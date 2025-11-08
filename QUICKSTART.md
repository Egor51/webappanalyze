# Быстрый старт

## 1. Установка зависимостей

```bash
npm install
```

## 2. Запуск локально

```bash
npm run dev
```

Откройте браузер: http://localhost:5173

## 3. Деплой на GitHub Pages

### Автоматический деплой (рекомендуется)

1. Создайте репозиторий на GitHub с именем `webappanalyze`
2. Убедитесь, что в `vite.config.js` указан правильный `base`:
   ```javascript
   base: '/webappanalyze/', // Замените на имя вашего репозитория
   ```
3. Отправьте код на GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ваш-username/webappanalyze.git
   git push -u origin main
   ```
4. В настройках репозитория: Settings → Pages → Source: выберите "GitHub Actions"
5. Дождитесь завершения деплоя (2-5 минут)
6. Приложение будет доступно: `https://ваш-username.github.io/webappanalyze/`

## 4. Настройка Telegram Mini App

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot` и создайте бота
3. Отправьте `/newapp` и создайте Mini App
4. Укажите URL: `https://ваш-username.github.io/webappanalyze/`
5. Готово! Откройте бота и нажмите на кнопку меню

## Структура проекта

```
webappanalyze/
├── src/
│   ├── components/      # React компоненты
│   ├── context/         # Context API
│   └── ...
├── .github/workflows/   # GitHub Actions
└── ...
```

## Команды

- `npm run dev` - запуск dev-сервера
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр собранного приложения

## Подробная документация

- [README.md](README.md) - полная документация
- [DEPLOY.md](DEPLOY.md) - детальная инструкция по деплою

