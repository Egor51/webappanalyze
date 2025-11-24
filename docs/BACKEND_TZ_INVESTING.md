# Техническое задание: Backend для Investing (MurmanClick Deal Engine)

## 📋 Общая информация

**Проект:** MurmanClick Deal Engine - Backend  
**Стек:** Java 17+, Spring Boot 3.x, PostgreSQL 14+  
**Архитектура:** REST API  
**Формат данных:** JSON  
**Аутентификация:** JWT токены (или существующая система авторизации)

---

## 🎯 Цель проекта

Реализовать backend для инвестиционной платформы, которая позволяет:
- Создавать и управлять инвестиционными мандатами (buy-box)
- Получать персональные инвестиционные идеи (trade ideas)
- Отслеживать события рынка недвижимости
- Управлять профилем инвестора и треками сделок
- Обрабатывать лиды для партнеров
- Управлять платными услугами (Checkup, модели объектов)

---

## 📊 Структура базы данных (PostgreSQL)

### 1. Таблица: `users` (если не существует)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    name VARCHAR(255),
    subscription_type VARCHAR(20) DEFAULT 'FREE', -- FREE, PRO
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_subscription ON users(subscription_type, subscription_expires_at);
```

### 2. Таблица: `investing_mandates`
```sql
CREATE TABLE investing_mandates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    strategy VARCHAR(20) NOT NULL, -- 'rent', 'flip', 'parking'
    budget_min DECIMAL(15, 2),
    budget_max DECIMAL(15, 2),
    target_yield DECIMAL(5, 2), -- процент годовых
    max_risk VARCHAR(10), -- 'low', 'medium', 'high'
    exclude_old_buildings BOOLEAN DEFAULT false,
    cities TEXT[], -- массив городов
    districts TEXT[], -- массив районов
    property_types TEXT[], -- массив типов объектов
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mandates_user ON investing_mandates(user_id);
CREATE INDEX idx_mandates_active ON investing_mandates(is_active);
```

### 3. Таблица: `investing_saved_deals`
```sql
CREATE TABLE investing_saved_deals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id VARCHAR(255) NOT NULL, -- ID из внешней системы или URL
    full_address VARCHAR(500),
    square DECIMAL(10, 2),
    count_room VARCHAR(10),
    price DECIMAL(15, 2),
    difference_percent DECIMAL(5, 2), -- разница с рынком в %
    url TEXT, -- ссылка на объявление
    analytics_data JSONB, -- полные данные аналитики
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, deal_id)
);

CREATE INDEX idx_saved_deals_user ON investing_saved_deals(user_id);
CREATE INDEX idx_saved_deals_deal_id ON investing_saved_deals(deal_id);
```

### 4. Таблица: `investing_deal_tracks`
```sql
CREATE TABLE investing_deal_tracks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'idea', 'negotiation', 'purchase', 'renovation', 'renting', 'sold'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id, deal_id) REFERENCES investing_saved_deals(user_id, deal_id) ON DELETE CASCADE
);

CREATE INDEX idx_tracks_user_deal ON investing_deal_tracks(user_id, deal_id);
CREATE INDEX idx_tracks_status ON investing_deal_tracks(status);
```

### 5. Таблица: `investing_events`
```sql
CREATE TABLE investing_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'price_drop', 'price_increase', 'new_match', 'long_listing', 'volume_spike', 'pattern'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    object_id VARCHAR(255), -- ID объекта из внешней системы
    mandate_id BIGINT REFERENCES investing_mandates(id) ON DELETE SET NULL,
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    event_data JSONB, -- дополнительные данные события
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- когда событие перестает быть актуальным
);

CREATE INDEX idx_events_type ON investing_events(event_type);
CREATE INDEX idx_events_priority ON investing_events(priority);
CREATE INDEX idx_events_created ON investing_events(created_at DESC);
CREATE INDEX idx_events_mandate ON investing_events(mandate_id);
```

### 6. Таблица: `investing_leads`
```sql
CREATE TABLE investing_leads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    object_id VARCHAR(255),
    object_address VARCHAR(500),
    object_price DECIMAL(15, 2),
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255),
    message TEXT,
    partner_id BIGINT, -- ID партнера, которому передан лид
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'converted', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_user ON investing_leads(user_id);
CREATE INDEX idx_leads_status ON investing_leads(status);
CREATE INDEX idx_leads_partner ON investing_leads(partner_id);
```

### 7. Таблица: `investing_checkups`
```sql
CREATE TABLE investing_checkups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_id VARCHAR(255) NOT NULL,
    checkup_type VARCHAR(20) NOT NULL, -- 'object', 'district', 'full'
    price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0, -- скидка для PRO
    final_price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_id VARCHAR(255), -- ID платежа в платежной системе
    report_data JSONB, -- данные отчета
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_checkups_user ON investing_checkups(user_id);
CREATE INDEX idx_checkups_payment ON investing_checkups(payment_status);
```

### 8. Таблица: `investing_payments`
```sql
CREATE TABLE investing_payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL, -- 'subscription_pro', 'checkup', 'model_unlock'
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    payment_system VARCHAR(50), -- 'yookassa', 'stripe', etc.
    payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE INDEX idx_payments_user ON investing_payments(user_id);
CREATE INDEX idx_payments_status ON investing_payments(status);
CREATE INDEX idx_payments_type ON investing_payments(payment_type);
```

### 9. Таблица: `investing_mandate_matches` (для кэширования совпадений)
```sql
CREATE TABLE investing_mandate_matches (
    id BIGSERIAL PRIMARY KEY,
    mandate_id BIGINT NOT NULL REFERENCES investing_mandates(id) ON DELETE CASCADE,
    deal_id VARCHAR(255) NOT NULL,
    match_score DECIMAL(5, 2), -- оценка соответствия (0-100)
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mandate_id, deal_id)
);

CREATE INDEX idx_matches_mandate ON investing_mandate_matches(mandate_id);
CREATE INDEX idx_matches_score ON investing_mandate_matches(match_score DESC);
```

---

## 🏗️ Java Entity Models

### 1. User (если не существует)
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phone;
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType = SubscriptionType.FREE;
    
    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters, setters, constructors
}

public enum SubscriptionType {
    FREE, PRO
}
```

### 2. InvestingMandate
```java
@Entity
@Table(name = "investing_mandates")
public class InvestingMandate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvestmentStrategy strategy;
    
    @Column(name = "budget_min", precision = 15, scale = 2)
    private BigDecimal budgetMin;
    
    @Column(name = "budget_max", precision = 15, scale = 2)
    private BigDecimal budgetMax;
    
    @Column(name = "target_yield", precision = 5, scale = 2)
    private BigDecimal targetYield;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "max_risk")
    private RiskLevel maxRisk;
    
    @Column(name = "exclude_old_buildings")
    private Boolean excludeOldBuildings = false;
    
    @ElementCollection
    @CollectionTable(name = "mandate_cities", joinColumns = @JoinColumn(name = "mandate_id"))
    @Column(name = "city")
    private List<String> cities = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "mandate_districts", joinColumns = @JoinColumn(name = "mandate_id"))
    @Column(name = "district")
    private List<String> districts = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "mandate_property_types", joinColumns = @JoinColumn(name = "mandate_id"))
    @Column(name = "property_type")
    private List<String> propertyTypes = new ArrayList<>();
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters, setters, constructors
}

public enum InvestmentStrategy {
    RENT, FLIP, PARKING
}

public enum RiskLevel {
    LOW, MEDIUM, HIGH
}
```

### 3. SavedDeal
```java
@Entity
@Table(name = "investing_saved_deals", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "deal_id"}))
public class SavedDeal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "deal_id", nullable = false)
    private String dealId;
    
    @Column(name = "full_address", length = 500)
    private String fullAddress;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal square;
    
    @Column(name = "count_room", length = 10)
    private String countRoom;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal price;
    
    @Column(name = "difference_percent", precision = 5, scale = 2)
    private BigDecimal differencePercent;
    
    @Column(columnDefinition = "TEXT")
    private String url;
    
    @Type(JsonType.class)
    @Column(name = "analytics_data", columnDefinition = "jsonb")
    private Map<String, Object> analyticsData;
    
    @CreationTimestamp
    private LocalDateTime savedAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters, setters, constructors
}
```

### 4. DealTrack
```java
@Entity
@Table(name = "investing_deal_tracks")
public class DealTrack {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "deal_id", nullable = false)
    private String dealId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters, setters, constructors
}

public enum DealStatus {
    IDEA, NEGOTIATION, PURCHASE, RENOVATION, RENTING, SOLD
}
```

### 5. MarketEvent
```java
@Entity
@Table(name = "investing_events")
public class MarketEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "object_id")
    private String objectId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mandate_id")
    private InvestingMandate mandate;
    
    @Enumerated(EnumType.STRING)
    private EventPriority priority = EventPriority.MEDIUM;
    
    @Type(JsonType.class)
    @Column(name = "event_data", columnDefinition = "jsonb")
    private Map<String, Object> eventData;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    private LocalDateTime expiresAt;
    
    // Getters, setters, constructors
}

public enum EventType {
    PRICE_DROP, PRICE_INCREASE, NEW_MATCH, LONG_LISTING, VOLUME_SPIKE, PATTERN
}

public enum EventPriority {
    LOW, MEDIUM, HIGH
}
```

---

## 🔌 REST API Endpoints

### Базовый путь: `/api/invest`

### 1. Мандаты (Mandates)

#### GET `/api/invest/mandates`
Получить все мандаты текущего пользователя.

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "mandates": [
    {
      "id": 1,
      "name": "Мой первый мандат",
      "strategy": "RENT",
      "budgetMin": 2000000.00,
      "budgetMax": 5000000.00,
      "targetYield": 12.5,
      "maxRisk": "MEDIUM",
      "excludeOldBuildings": false,
      "cities": ["Мурманск", "Оленегорск"],
      "districts": ["Ленинский", "Октябрьский"],
      "propertyTypes": ["квартира", "студия"],
      "isActive": true,
      "matchCount": 15,
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ]
}
```

#### POST `/api/invest/mandates`
Создать новый мандат.

**Request Body:**
```json
{
  "name": "Мой первый мандат",
  "strategy": "RENT",
  "budgetMin": 2000000.00,
  "budgetMax": 5000000.00,
  "targetYield": 12.5,
  "maxRisk": "MEDIUM",
  "excludeOldBuildings": false,
  "cities": ["Мурманск", "Оленегорск"],
  "districts": ["Ленинский", "Октябрьский"],
  "propertyTypes": ["квартира", "студия"]
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "message": "Мандат создан успешно"
}
```

**Ошибки:**
- `400 Bad Request` - превышен лимит мандатов (FREE: 1, PRO: 5)
- `400 Bad Request` - невалидные данные

#### PUT `/api/invest/mandates/{id}`
Обновить мандат.

**Request Body:** (те же поля, что и в POST)

**Response:** 200 OK

#### DELETE `/api/invest/mandates/{id}`
Удалить мандат.

**Response:** 200 OK

---

### 2. Trade Ideas (Сделки)

#### GET `/api/invest/trade-ideas`
Получить инвестиционные идеи.

**Query Parameters:**
- `mandateId` (optional) - фильтр по мандату
- `page` (default: 0) - номер страницы
- `size` (default: 20) - размер страницы
- `strategy` (optional) - фильтр по стратегии (RENT, FLIP, PARKING)

**Response:**
```json
{
  "content": [
    {
      "id": "deal_123",
      "fullAddress": "Мурманск, ул. Ленина, д. 10, кв. 5",
      "square": 45.5,
      "countRoom": "2",
      "price": 3500000.00,
      "differencePercent": -15.5,
      "url": "https://www.cian.ru/sale/flat/123456",
      "potential": {
        "marketDifference": -15.5,
        "flipMargin": 500000.00,
        "flipMarginPercent": 14.3,
        "rentalYield": 11.2,
        "monthlyRent": 35000.00,
        "interestLevel": 4,
        "strategy": "RENT"
      },
      "risks": [
        {
          "type": "LOW_LIQUIDITY",
          "severity": "MEDIUM",
          "message": "Объект на рынке более 90 дней"
        }
      ],
      "analyticsResponse": {
        "price": "3.5 млн",
        "priceMeter": "76,923",
        "priceMin": "3.2 млн",
        "priceMax": "3.8 млн",
        "annualPriceChangePercent": 8.5,
        "threeMonthPriceChangePercent": 2.3,
        "analytics": [
          {
            "date": "2024-01-01",
            "avgPrice": 3200000
          }
        ]
      }
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "page": 0,
  "size": 20
}
```

**Бизнес-логика:**
- Если `mandateId` указан, фильтровать объекты по критериям мандата
- Рассчитывать `potential` на основе стратегии мандата
- Определять `risks` на основе данных объекта
- Для FREE пользователей скрывать детали `potential` и `risks`

#### GET `/api/invest/trade-ideas/{dealId}`
Получить детальную информацию об объекте.

**Response:**
```json
{
  "id": "deal_123",
  "fullAddress": "Мурманск, ул. Ленина, д. 10, кв. 5",
  "square": 45.5,
  "countRoom": "2",
  "price": 3500000.00,
  "differencePercent": -15.5,
  "url": "https://www.cian.ru/sale/flat/123456",
  "analyticsResponse": {
    "price": "3.5 млн",
    "priceMeter": "76,923",
    "priceMin": "3.2 млн",
    "priceMax": "3.8 млн",
    "annualPriceChangePercent": 8.5,
    "threeMonthPriceChangePercent": 2.3,
    "analytics": [
      {
        "date": "2024-01-01",
        "avgPrice": 3200000
      }
    ]
  }
}
```

---

### 3. События рынка (Events)

#### GET `/api/invest/events`
Получить события рынка.

**Query Parameters:**
- `type` (optional) - фильтр по типу события
- `mandateId` (optional) - фильтр по мандату
- `priority` (optional) - фильтр по приоритету
- `page` (default: 0)
- `size` (default: 20)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "type": "PRICE_DROP",
      "title": "Цена снижена на 300 000 ₽",
      "description": "По объекту в Ленинском районе, Мурманск",
      "objectId": "deal_123",
      "mandateId": 1,
      "priority": "HIGH",
      "eventData": {
        "amount": 300000,
        "previousPrice": 3800000,
        "newPrice": 3500000
      },
      "createdAt": "2024-01-15T14:30:00"
    }
  ],
  "totalElements": 50,
  "totalPages": 3
}
```

**Бизнес-логика:**
- Для FREE пользователей возвращать только события с `priority = HIGH`
- Для FREE пользователей применять задержку (например, события старше 1 часа)
- Для PRO пользователей возвращать все события в реальном времени

---

### 4. Профиль инвестора

#### GET `/api/invest/profile`
Получить профиль инвестора.

**Response:**
```json
{
  "userId": 1,
  "savedDealsCount": 12,
  "activeMandatesCount": 2,
  "activeDealsCount": 5,
  "completedDealsCount": 3,
  "statusCounts": {
    "IDEA": 2,
    "NEGOTIATION": 1,
    "PURCHASE": 1,
    "RENOVATION": 1,
    "RENTING": 0,
    "SOLD": 3
  },
  "totalInvested": 15000000.00,
  "totalReturn": 16500000.00,
  "averageYield": 10.0
}
```

#### GET `/api/invest/profile/saved-deals`
Получить сохраненные сделки.

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "dealId": "deal_123",
      "fullAddress": "Мурманск, ул. Ленина, д. 10, кв. 5",
      "square": 45.5,
      "countRoom": "2",
      "price": 3500000.00,
      "differencePercent": -15.5,
      "url": "https://www.cian.ru/sale/flat/123456",
      "track": {
        "status": "IDEA",
        "notes": "Интересный объект",
        "updatedAt": "2024-01-15T10:00:00"
      },
      "savedAt": "2024-01-10T12:00:00"
    }
  ],
  "totalElements": 12
}
```

#### POST `/api/invest/profile/saved-deals`
Сохранить сделку.

**Request Body:**
```json
{
  "dealId": "deal_123",
  "fullAddress": "Мурманск, ул. Ленина, д. 10, кв. 5",
  "square": 45.5,
  "countRoom": "2",
  "price": 3500000.00,
  "differencePercent": -15.5,
  "url": "https://www.cian.ru/sale/flat/123456",
  "analyticsData": { ... }
}
```

#### DELETE `/api/invest/profile/saved-deals/{dealId}`
Удалить сохраненную сделку.

#### PUT `/api/invest/profile/deal-tracks/{dealId}`
Обновить статус сделки.

**Request Body:**
```json
{
  "status": "NEGOTIATION",
  "notes": "Ведем переговоры с продавцом"
}
```

#### GET `/api/invest/profile/deal-tracks`
Получить все треки сделок.

---

### 5. Лиды для партнеров

#### POST `/api/invest/leads`
Отправить лид эксперту.

**Request Body:**
```json
{
  "objectId": "deal_123",
  "objectAddress": "Мурманск, ул. Ленина, д. 10, кв. 5",
  "objectPrice": 3500000.00,
  "contactName": "Иван Иванов",
  "contactPhone": "+79991234567",
  "contactEmail": "ivan@example.com",
  "message": "Хочу обсудить этот объект"
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "message": "Лид успешно отправлен партнеру"
}
```

**Бизнес-логика:**
- Найти подходящего партнера (по городу, типу объекта)
- Сохранить лид в БД
- Отправить уведомление партнеру (email, Telegram, etc.)
- Вернуть подтверждение пользователю

---

### 6. Checkup (Платные отчеты)

#### POST `/api/invest/checkup`
Заказать проверку объекта.

**Request Body:**
```json
{
  "objectId": "deal_123",
  "checkupType": "FULL", // 'OBJECT', 'DISTRICT', 'FULL'
  "objectAddress": "Мурманск, ул. Ленина, д. 10, кв. 5"
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "checkupType": "FULL",
  "price": 2990.00,
  "discountPercent": 10.0,
  "finalPrice": 2691.00,
  "paymentUrl": "https://payment-system.com/pay/12345"
}
```

**Бизнес-логика:**
- Определить цену в зависимости от типа (OBJECT: 1990₽, DISTRICT: 1490₽, FULL: 2990₽)
- Применить скидку 10% для PRO пользователей
- Создать запись в БД со статусом `pending`
- Создать платеж в платежной системе
- Вернуть URL для оплаты

#### GET `/api/invest/checkup/{id}`
Получить статус и результат Checkup.

**Response:**
```json
{
  "id": 1,
  "checkupType": "FULL",
  "paymentStatus": "PAID",
  "reportData": {
    "objectCheck": { ... },
    "districtCheck": { ... },
    "financialModel": { ... }
  },
  "createdAt": "2024-01-15T10:00:00",
  "paidAt": "2024-01-15T10:05:00",
  "completedAt": "2024-01-15T10:30:00"
}
```

#### POST `/api/invest/checkup/{id}/webhook`
Webhook от платежной системы для обновления статуса оплаты.

---

### 7. Платежи и подписки

#### POST `/api/invest/subscriptions/pro`
Оформить PRO подписку.

**Request Body:**
```json
{
  "period": "MONTH", // 'MONTH', 'QUARTER', 'YEAR'
  "autoRenew": true
}
```

**Response:**
```json
{
  "subscriptionId": 1,
  "price": 990.00,
  "paymentUrl": "https://payment-system.com/pay/12345"
}
```

#### GET `/api/invest/subscriptions/status`
Получить статус подписки.

**Response:**
```json
{
  "subscriptionType": "PRO",
  "expiresAt": "2024-02-15T10:00:00",
  "autoRenew": true
}
```

---

## 🔐 Аутентификация и авторизация

### Требования:
1. Все endpoints требуют аутентификации (кроме webhook'ов)
2. Использовать существующую систему авторизации или JWT
3. Проверять права доступа (FREE/PRO) для соответствующих endpoints

### Middleware/Interceptor:
```java
@Component
public class InvestingAuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) {
        // Проверка токена
        // Проверка прав доступа
        // Установка user context
    }
}
```

---

## 💰 Бизнес-логика монетизации

### Ограничения для FREE:
- Максимум 1 мандат
- Ограниченный набор событий (только HIGH priority, с задержкой)
- Базовый уровень интереса без деталей
- Базовая статистика профиля

### Возможности для PRO:
- До 5 мандатов
- Все события в реальном времени
- Полная информация о потенциале и рисках
- Расширенная аналитика
- Скидка 10% на Checkup

### Проверка прав:
```java
@Service
public class SubscriptionService {
    public boolean isPro(User user) {
        return user.getSubscriptionType() == SubscriptionType.PRO
            && (user.getSubscriptionExpiresAt() == null 
                || user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now()));
    }
    
    public void checkMandateLimit(User user) {
        long mandateCount = mandateRepository.countByUserId(user.getId());
        int maxMandates = isPro(user) ? 5 : 1;
        if (mandateCount >= maxMandates) {
            throw new BusinessException("Превышен лимит мандатов");
        }
    }
}
```

---

## 📈 Расчет потенциала и рисков

### Сервис расчета:
```java
@Service
public class TradeIdeaCalculatorService {
    
    public TradeIdeaPotential calculatePotential(
            InvestmentObject object, 
            InvestmentStrategy strategy,
            AnalyticsData analytics) {
        
        if (strategy == InvestmentStrategy.FLIP) {
            return calculateFlipPotential(object, analytics);
        } else if (strategy == InvestmentStrategy.RENT) {
            return calculateRentalPotential(object, analytics);
        }
        // ...
    }
    
    public List<Risk> identifyRisks(InvestmentObject object, AnalyticsData analytics) {
        List<Risk> risks = new ArrayList<>();
        
        if (object.getDifferencePercent() > 10) {
            risks.add(new Risk(RiskType.OVERPRICED, RiskSeverity.HIGH, 
                "Объект дороже рынка на " + object.getDifferencePercent() + "%"));
        }
        
        // Другие проверки...
        
        return risks;
    }
    
    public int calculateInterestLevel(TradeIdeaPotential potential, List<Risk> risks) {
        int score = 0;
        // Логика расчета уровня интереса (1-5)
        return Math.max(1, Math.min(5, score));
    }
}
```

---

## 🔔 Генерация событий рынка

### Сервис событий:
```java
@Service
public class MarketEventService {
    
    @Scheduled(fixedRate = 60000) // Каждую минуту
    public void generateEvents() {
        // Проверка изменений цен
        checkPriceChanges();
        
        // Проверка новых объектов под мандаты
        checkNewMatches();
        
        // Проверка долго висящих объектов
        checkLongListings();
        
        // Проверка всплесков объема
        checkVolumeSpikes();
    }
    
    private void checkPriceChanges() {
        // Логика проверки изменений цен
        // Создание событий PRICE_DROP, PRICE_INCREASE
    }
    
    private void checkNewMatches() {
        // Для каждого активного мандата
        // Проверка новых объектов
        // Создание событий NEW_MATCH
    }
}
```

---

## 🔄 Интеграция с внешними системами

### 1. Источник данных об объектах
- Интеграция с существующим API `/ads/invest/top`
- Парсинг данных из внешних источников
- Кэширование данных

### 2. Платежная система
- Интеграция с YooKassa, Stripe или другой системой
- Обработка webhook'ов
- Управление подписками

### 3. Партнерская система
- API для регистрации партнеров
- Управление лидами
- Статистика конверсий

---

## 📝 Дополнительные требования

### 1. Валидация данных
- Использовать Bean Validation (`@Valid`, `@NotNull`, etc.)
- Кастомные валидаторы для бизнес-логики

### 2. Обработка ошибок
- Единый формат ошибок:
```json
{
  "error": "BAD_REQUEST",
  "message": "Превышен лимит мандатов",
  "details": { ... }
}
```

### 3. Логирование
- Логировать все важные операции
- Использовать SLF4J + Logback

### 4. Тестирование
- Unit тесты для сервисов
- Integration тесты для API
- Покрытие кода > 70%

### 5. Документация API
- Swagger/OpenAPI документация
- Примеры запросов/ответов

### 6. Производительность
- Кэширование часто запрашиваемых данных (Redis)
- Пагинация для больших списков
- Индексы в БД для быстрого поиска

---

## 🚀 Приоритеты реализации

### Этап 1 (MVP):
1. Мандаты (CRUD)
2. Trade Ideas (базовый список)
3. Сохранение сделок
4. Профиль инвестора (базовая статистика)

### Этап 2:
5. События рынка
6. Расчет потенциала и рисков
7. Лиды для партнеров

### Этап 3:
8. Checkup и платежи
9. PRO подписки
10. Расширенная аналитика

---

## 📞 Контакты и вопросы

При возникновении вопросов обращаться к:
- Product Manager: [контакты]
- Frontend разработчик: [контакты]

---

**Версия документа:** 1.0  
**Дата:** 2024-01-15  
**Автор:** AI Assistant

