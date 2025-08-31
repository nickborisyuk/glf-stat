# 🚀 Деплой на Netlify

## 📋 Обзор

Деплой GLF Stat на Netlify с использованием Netlify Functions для API.

## 🎯 Преимущества Netlify

- ✅ **Очень простой деплой** - `netlify deploy --prod`
- ✅ **Netlify Functions** - serverless API без проблем с кэшированием
- ✅ **Бесплатный план** - 100GB bandwidth, 125K function invocations
- ✅ **Автоматический SSL** - HTTPS из коробки
- ✅ **CDN** - быстрая доставка контента
- ✅ **GitHub интеграция** - автоматический деплой при push

## 🔧 Структура проекта

```
glf-stat/
├── netlify.toml              # Конфигурация Netlify
├── deploy-netlify.sh         # Скрипт деплоя
├── client/                   # React frontend
│   ├── src/App.jsx
│   └── dist/                 # Собранный фронтенд
└── netlify/
    └── functions/
        ├── api.js            # Netlify Function для API
        └── package.json      # Зависимости для функций
```

## 🚀 Деплой

### Автоматический деплой
```bash
./deploy-netlify.sh
```

### Ручной деплой
```bash
# 1. Установить Netlify CLI
npm install -g netlify-cli

# 2. Логин в Netlify
netlify login

# 3. Связать с сайтом
netlify link

# 4. Деплой
netlify deploy --prod
```

## 🌐 URL после деплоя

- **Frontend:** https://your-site-name.netlify.app
- **API:** https://your-site-name.netlify.app/.netlify/functions/api

## 🔧 Конфигурация

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "client/dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

## 📊 Сравнение с Vercel

| Функция | Vercel | Netlify |
|---------|--------|---------|
| **Деплой** | ✅ Простой | ✅ Очень простой |
| **API** | ❌ Проблемы с кэшированием | ✅ Netlify Functions |
| **CDN** | ✅ Да | ✅ Да |
| **SSL** | ✅ Автоматический | ✅ Автоматический |
| **CLI** | ✅ Да | ✅ Да |
| **Бесплатный план** | ✅ Да | ✅ Да |

## 🧪 Тестирование

### Проверка API
```bash
# Получить URL сайта
netlify status

# Проверка здоровья API
curl https://your-site-name.netlify.app/.netlify/functions/api/health

# Проверка версии
curl https://your-site-name.netlify.app/.netlify/functions/api/version

# Проверка данных
curl https://your-site-name.netlify.app/.netlify/functions/api/rounds
curl https://your-site-name.netlify.app/.netlify/functions/api/players
```

### Проверка логов
```bash
# Просмотр логов функций
netlify functions:list
netlify functions:logs
```

## 🚨 Решение проблем

### Проблема: Netlify CLI не найден
```bash
npm install -g netlify-cli
```

### Проблема: Не авторизован
```bash
netlify login
```

### Проблема: Сайт не связан
```bash
netlify link
```

### Проблема: Деплой не удался
```bash
# Проверить логи
netlify deploy --prod --debug

# Проверить статус
netlify status
```

## 📈 Мониторинг

### Netlify Dashboard
- https://app.netlify.com
- Логи деплоя
- Статус функций
- Аналитика
- Переменные окружения

### CLI команды
```bash
# Статус сайта
netlify status

# Логи функций
netlify functions:logs

# Список функций
netlify functions:list

# Переменные окружения
netlify env:list
```

## 🔧 Переменные окружения

### Установка переменных
```bash
# В Netlify Dashboard или через CLI
netlify env:set VITE_API_URL /.netlify/functions/api
```

### Получение переменных
```bash
# Список всех переменных
netlify env:list
```

## 🚀 Автоматический деплой

### GitHub интеграция
1. Подключить GitHub репозиторий в Netlify Dashboard
2. Настроить автоматический деплой при push
3. Настроить переменные окружения

### Настройка в Netlify Dashboard
1. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `client/dist`

2. **Environment variables:**
   - `VITE_API_URL`: `/.netlify/functions/api`

3. **Functions:**
   - Functions directory: `netlify/functions`

## 🔄 Миграция данных

### Текущие данные
- Данные хранятся в памяти Netlify Functions
- Нет проблем с кэшированием
- Данные сбрасываются при перезапуске функции

### Планы на будущее
- Интеграция с Netlify KV (база данных)
- Постоянное хранение данных
- Синхронизация между функциями

---

**Дата создания:** 2025-08-31  
**Статус:** Готов к деплою  
**Приоритет:** Высокий
