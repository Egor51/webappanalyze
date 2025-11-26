# 🎨 UI-kit / Design System

Централизованная библиотека компонентов и дизайн-токенов для MurmanClick.

---

## 📦 Компоненты

### Button
Универсальная кнопка с вариантами и размерами.

```tsx
import { Button } from '@/ui-kit/components'

<Button variant="primary" size="md" onClick={handleClick}>
  Нажми меня
</Button>

<Button variant="secondary" size="lg" leftIcon={<Icon />} fullWidth>
  С иконкой
</Button>

<Button variant="ghost" isLoading={loading}>
  Загрузка...
</Button>
```

**Варианты:** `primary`, `secondary`, `ghost`  
**Размеры:** `sm`, `md`, `lg`  
**Props:** `variant`, `size`, `fullWidth`, `isLoading`, `leftIcon`, `rightIcon`

---

### Input
Универсальный input с поддержкой ошибок и иконок.

```tsx
import { Input } from '@/ui-kit/components'

<Input
  label="Адрес"
  placeholder="Введите адрес"
  error={errors.address}
  helperText="Начните вводить адрес"
  leftIcon={<LocationIcon />}
/>

<Input
  type="tel"
  label="Телефон"
  required
  error={errors.phone}
/>
```

**Props:** `label`, `error`, `helperText`, `leftIcon`, `rightIcon`, `fullWidth`

---

### Card
Карточка с вариантами отображения.

```tsx
import { Card } from '@/ui-kit/components'

<Card variant="elevated" padding="lg">
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>

<Card variant="outlined" padding="sm">
  Компактная карточка
</Card>
```

**Варианты:** `default`, `elevated`, `outlined`  
**Padding:** `none`, `sm`, `md`, `lg`

---

### Tabs
Компонент для переключения между вкладками.

```tsx
import { Tabs } from '@/ui-kit/components'

<Tabs
  tabs={[
    { id: 'tab1', label: 'Вкладка 1', icon: <Icon1 /> },
    { id: 'tab2', label: 'Вкладка 2', icon: <Icon2 /> },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

---

### Modal
Модальное окно с поддержкой размеров и закрытия.

```tsx
import { Modal } from '@/ui-kit/components'

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Заголовок модального окна"
  size="md"
>
  <p>Содержимое модального окна</p>
</Modal>
```

**Размеры:** `sm`, `md`, `lg`, `xl`  
**Props:** `isOpen`, `onClose`, `title`, `size`, `closeOnOverlayClick`, `closeOnEscape`

---

### Alert
Компонент для уведомлений.

```tsx
import { Alert } from '@/ui-kit/components'

<Alert variant="success" title="Успех!" onClose={handleClose}>
  Операция выполнена успешно
</Alert>

<Alert variant="error" title="Ошибка">
  Произошла ошибка при загрузке данных
</Alert>
```

**Варианты:** `success`, `error`, `warning`, `info`

---

### Skeleton
Компонент для loading состояний.

```tsx
import { Skeleton } from '@/ui-kit/components'

<Skeleton variant="text" width="100%" height={20} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width={200} height={100} />
```

**Варианты:** `text`, `circular`, `rectangular`  
**Анимации:** `pulse`, `wave`, `none`

---

## 🎨 Design Tokens

### Colors
Цветовая палитра с поддержкой темной темы.

```css
/* Primary colors */
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;

/* Semantic colors */
--color-success: #10b981;
--color-error: #ef4444;
--color-warning: #f59e0b;
--color-info: #3b82f6;
```

### Spacing
Шкала отступов на основе 4px.

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-4: 16px;
--spacing-6: 24px;
--spacing-8: 32px;
```

### Shadows
Тени для различных компонентов.

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Typography
Типографическая шкала.

```css
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
```

---

## 📝 Использование

### Импорт токенов

```css
@import '@/ui-kit/tokens/index.css';
```

### Импорт компонентов

```tsx
import { Button, Input, Card } from '@/ui-kit/components'
```

---

## 🔄 Миграция существующих компонентов

Постепенно заменяйте существующие компоненты на UI-kit:

1. **Button** → `<Button>` из UI-kit
2. **Input** → `<Input>` из UI-kit
3. **Card** → `<Card>` из UI-kit
4. Используйте токены вместо хардкода значений

---

## 📚 Дополнительная информация

- Все компоненты поддерживают темную тему автоматически
- Компоненты доступны (ARIA атрибуты)
- Адаптивный дизайн из коробки
- TypeScript типы для всех компонентов

