# 🚀 Руководство по настройке Golf Statistics Tracker

## 📋 Предварительные требования

- **Node.js** (версия 18 или выше)
- **npm** или **yarn**
- **Git**
- **Vercel CLI** (для деплоя)

## 🛠️ Пошаговая настройка

### Шаг 1: Создание структуры проекта

```bash
# Создаем корневую папку
mkdir glf-stat
cd glf-stat

# Создаем структуру папок
mkdir -p server/src server/data client/src client/public
```

### Шаг 2: Настройка Backend

```bash
cd server

# Инициализация package.json
npm init -y

# Установка зависимостей
npm install express cors nanoid

# Создание основного файла сервера
touch src/index.js
```

**Содержимое `server/package.json`:**
```json
{
  "name": "golf-stat-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nanoid": "^3.3.4"
  }
}
```

### Шаг 3: Настройка Frontend

```bash
cd ../client

# Создание Vite проекта
npm create vite@latest . -- --template react
npm install

# Установка дополнительных зависимостей
npm install react-router-dom recharts

# Установка dev зависимостей для Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Содержимое `client/tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Содержимое `client/src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Шаг 4: Создание конфигурационных файлов

**Корневой `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "server/src/index.js"
    }
  ]
}
```

**`client/vercel.json`:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
```

**`.env.local`:**
```env
VITE_API_URL=http://localhost:4000/api
```

### Шаг 5: Создание скрипта деплоя

**`deploy.sh`:**
```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Deploy backend
echo "📦 Deploying backend..."
vercel --prod --force

# Get backend URL
BACKEND_URL=$(vercel ls | grep "glf-stat" | head -1 | awk '{print $2}')
echo "🔗 Backend URL: $BACKEND_URL"

# Update environment variable for frontend
echo "⚙️ Updating environment variables..."
vercel env rm VITE_API_URL production -y
echo "$BACKEND_URL/api" | vercel env add VITE_API_URL production

# Deploy frontend
echo "🌐 Deploying frontend..."
cd client
vercel --prod --force

# Test deployment
echo "🧪 Testing deployment..."
sleep 5
curl -X POST "$BACKEND_URL/api/players" -H "Content-Type: application/json" -d '{"name":"Test Player","color":"#3B82F6"}'
curl -X POST "$BACKEND_URL/api/clear-all-data"

echo "✅ Deployment completed!"
```

```bash
chmod +x deploy.sh
```

### Шаг 6: Копирование исходного кода

Скопируйте содержимое файлов из спецификации:

1. **`server/src/index.js`** - основной серверный файл
2. **`client/src/App.jsx`** - основной React компонент
3. **`client/src/main.jsx`** - точка входа React приложения

### Шаг 7: Локальная разработка

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### Шаг 8: Деплой на Vercel

```bash
# Установка Vercel CLI (если не установлен)
npm i -g vercel

# Логин в Vercel
vercel login

# Автоматический деплой
./deploy.sh
```

## 🔧 Настройка переменных окружения

### Локальная разработка
```bash
# В папке client
echo "VITE_API_URL=http://localhost:4000/api" > .env.local
```

### Vercel Production
```bash
# После деплоя backend
BACKEND_URL=$(vercel ls | grep "glf-stat" | head -1 | awk '{print $2}')
echo "$BACKEND_URL/api" | vercel env add VITE_API_URL production
```

## 🧪 Тестирование

### Проверка Backend
```bash
# Проверка API
curl http://localhost:4000/api/players
curl http://localhost:4000/api/rounds
```

### Проверка Frontend
```bash
# Откройте http://localhost:5173
# Создайте игрока
# Создайте раунд
# Добавьте удары
```

### Проверка Production
```bash
# После деплоя
curl https://your-backend-url.vercel.app/api/players
# Откройте https://your-frontend-url.vercel.app
```

## 🐛 Устранение неполадок

### Проблема: CORS ошибки
**Решение:** Убедитесь, что в backend настроен CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-url.vercel.app']
}));
```

### Проблема: API URL не работает
**Решение:** Проверьте переменные окружения:
```bash
# Проверка локальных переменных
cat client/.env.local

# Проверка Vercel переменных
vercel env ls
```

### Проблема: Данные не сохраняются
**Решение:** Убедитесь, что папка `server/data` существует и доступна для записи:
```bash
mkdir -p server/data
chmod 755 server/data
```

### Проблема: Tailwind CSS не работает
**Решение:** Перезапустите dev сервер и проверьте конфигурацию:
```bash
cd client
npm run dev
```

## 📱 Мобильная оптимизация

### Проверка GPS функциональности
1. Откройте приложение на мобильном устройстве
2. Разрешите доступ к геолокации
3. Создайте удар с включенным измерением расстояния
4. Проверьте появление плавающих кнопок

### Тестирование на разных устройствах
- iPhone (Safari)
- Android (Chrome)
- Desktop (Chrome, Firefox, Safari)

## 🔄 Обновления

### Обновление зависимостей
```bash
# Backend
cd server
npm update

# Frontend
cd client
npm update
```

### Передеплой после изменений
```bash
./deploy.sh
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в консоли браузера
2. Проверьте логи Vercel в дашборде
3. Убедитесь, что все переменные окружения настроены правильно
4. Проверьте, что API доступен и отвечает

---

**Готово!** 🎉 Ваш Golf Statistics Tracker готов к использованию!
