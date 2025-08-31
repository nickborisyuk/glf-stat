# 🚀 Миграция на Render

## 📋 Обзор

Миграция с Vercel на Render для решения проблем с кэшированием данных.

## 🎯 Преимущества Render

- ✅ **Нет проблем с кэшированием** - нет CDN кэширования
- ✅ **Простой деплой** - автоматический деплой из Git
- ✅ **Бесплатный план** - 750 часов/месяц
- ✅ **Встроенная база данных** - PostgreSQL (опционально)
- ✅ **Автоматический SSL** - HTTPS из коробки

## 🔧 Настройка

### 1. Создать аккаунт на Render
1. Перейти на https://render.com
2. Создать аккаунт или войти
3. Подключить GitHub репозиторий

### 2. Установить Render CLI
```bash
curl -sL https://render.com/download-cli/install.sh | bash
export PATH="$HOME/.render/bin:$PATH"
```

### 3. Логин в Render CLI
```bash
render login
```

## 🚀 Деплой

### Автоматический деплой
```bash
./deploy-render.sh
```

### Ручной деплой
```bash
# Обновить версию
node update-version.js

# Деплой
render deploy
```

## 📁 Структура проекта

```
glf-stat/
├── render.yaml          # Конфигурация Render
├── deploy-render.sh     # Скрипт деплоя
├── server/              # Backend API
│   ├── package.json
│   └── src/index.js
└── client/              # Frontend
    ├── package.json
    ├── src/App.jsx
    └── dist/            # Собранный фронтенд
```

## 🌐 URL после деплоя

- **Frontend:** https://glf-stat-frontend.onrender.com
- **Backend:** https://glf-stat-api.onrender.com

## 🔧 Конфигурация

### render.yaml
```yaml
services:
  - type: web
    name: glf-stat-api
    env: node
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health

  - type: web
    name: glf-stat-frontend
    env: static
    plan: free
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/dist
    envVars:
      - key: VITE_API_URL
        value: https://glf-stat-api.onrender.com/api
```

## 📊 Сравнение с Vercel

| Функция | Vercel | Render |
|---------|--------|--------|
| **Кэширование** | ❌ Проблемы с CDN | ✅ Нет проблем |
| **Деплой** | ✅ Простой | ✅ Простой |
| **База данных** | ❌ Файлы | ✅ PostgreSQL |
| **Цена** | ✅ Бесплатно | ✅ Бесплатно |
| **SSL** | ✅ Автоматический | ✅ Автоматический |
| **Мониторинг** | ✅ Да | ✅ Да |

## 🔄 Миграция данных

### Текущие данные
- Данные хранятся в файлах JSON
- Проблемы с кэшированием

### Планы на будущее
- Миграция на PostgreSQL
- Стабильное хранение данных
- Нет проблем с кэшированием

## 🧪 Тестирование

### Проверка API
```bash
# Проверка здоровья API
curl https://glf-stat-api.onrender.com/api/health

# Проверка версии
curl https://glf-stat-api.onrender.com/api/version

# Проверка данных
curl https://glf-stat-api.onrender.com/api/rounds
curl https://glf-stat-api.onrender.com/api/players
```

### Проверка фронтенда
```bash
# Открыть в браузере
open https://glf-stat-frontend.onrender.com
```

## 🚨 Решение проблем

### Проблема: Render CLI не найден
```bash
curl -sL https://render.com/download-cli/install.sh | bash
export PATH="$HOME/.render/bin:$PATH"
```

### Проблема: Не авторизован
```bash
render login
```

### Проблема: Деплой не удался
1. Проверить логи в Render Dashboard
2. Проверить конфигурацию render.yaml
3. Проверить package.json

## 📈 Мониторинг

### Render Dashboard
- https://render.com/dashboard
- Логи деплоя
- Статус сервисов
- Использование ресурсов

### Логи
```bash
# Просмотр логов API
render logs glf-stat-api

# Просмотр логов фронтенда
render logs glf-stat-frontend
```

---

**Дата создания:** 2025-08-31  
**Статус:** Готов к миграции  
**Приоритет:** Высокий
