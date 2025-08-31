# 🚂 Миграция на Railway

## 📋 Обзор

Миграция с Vercel на Railway для решения проблем с кэшированием данных.

## 🎯 Преимущества Railway

- ✅ **Нет проблем с кэшированием** - нет CDN кэширования
- ✅ **Простой деплой** - `railway up`
- ✅ **Бесплатный план** - 500 часов/месяц
- ✅ **Встроенная база данных** - PostgreSQL (опционально)
- ✅ **Автоматический SSL** - HTTPS из коробки
- ✅ **Отличная документация** - подробные гайды

## 🔧 Настройка

### 1. Создать аккаунт на Railway
1. Перейти на https://railway.app
2. Создать аккаунт или войти
3. Подключить GitHub репозиторий

### 2. Установить Railway CLI
```bash
npm install -g @railway/cli
```

### 3. Логин в Railway CLI
```bash
railway login
```

## 🚀 Деплой

### Автоматический деплой
```bash
./deploy-railway.sh
```

### Ручной деплой
```bash
# Обновить версию
node update-version.js

# Инициализировать проект (если первый раз)
railway init

# Деплой
railway up
```

## 📁 Структура проекта

```
glf-stat/
├── railway.json         # Конфигурация Railway
├── deploy-railway.sh    # Скрипт деплоя
├── server/              # Backend API
│   ├── package.json
│   └── src/index.js
└── client/              # Frontend
    ├── package.json
    ├── src/App.jsx
    └── dist/            # Собранный фронтенд
```

## 🌐 URL после деплоя

- **Backend:** https://your-project-name.railway.app
- **Frontend:** (будет развернут отдельно)

## 🔧 Конфигурация

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 📊 Сравнение с Vercel

| Функция | Vercel | Railway |
|---------|--------|---------|
| **Кэширование** | ❌ Проблемы с CDN | ✅ Нет проблем |
| **Деплой** | ✅ Простой | ✅ Очень простой |
| **База данных** | ❌ Файлы | ✅ PostgreSQL |
| **Цена** | ✅ Бесплатно | ✅ Бесплатно |
| **SSL** | ✅ Автоматический | ✅ Автоматический |
| **CLI** | ✅ Да | ✅ Да |

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
# Получить URL API
railway domain

# Проверка здоровья API
curl https://your-project-name.railway.app/api/health

# Проверка версии
curl https://your-project-name.railway.app/api/version

# Проверка данных
curl https://your-project-name.railway.app/api/rounds
curl https://your-project-name.railway.app/api/players
```

### Проверка логов
```bash
# Просмотр логов
railway logs

# Просмотр логов в реальном времени
railway logs --follow
```

## 🚨 Решение проблем

### Проблема: Railway CLI не найден
```bash
npm install -g @railway/cli
```

### Проблема: Не авторизован
```bash
railway login
```

### Проблема: Проект не инициализирован
```bash
railway init
```

### Проблема: Деплой не удался
```bash
# Проверить логи
railway logs

# Проверить статус
railway status

# Перезапустить сервис
railway service restart
```

## 📈 Мониторинг

### Railway Dashboard
- https://railway.app/dashboard
- Логи деплоя
- Статус сервисов
- Использование ресурсов
- Переменные окружения

### CLI команды
```bash
# Статус проекта
railway status

# Логи
railway logs

# Переменные окружения
railway variables

# Домен
railway domain
```

## 🔧 Переменные окружения

### Установка переменных
```bash
# В Railway Dashboard или через CLI
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

### Получение переменных
```bash
# Список всех переменных
railway variables
```

## 🚀 Деплой фронтенда

### Отдельный сервис для фронтенда
```bash
# Создать новый сервис для фронтенда
railway service create glf-stat-frontend

# Деплой фронтенда
cd client
railway up
```

### Или через Railway Dashboard
1. Создать новый сервис
2. Выбрать "Static Site"
3. Указать путь к собранному фронтенду

---

**Дата создания:** 2025-08-31  
**Статус:** Готов к миграции  
**Приоритет:** Высокий
