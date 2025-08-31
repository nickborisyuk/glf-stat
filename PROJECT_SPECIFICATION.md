# Golf Statistics Tracker - Полная спецификация проекта

## 📋 Обзор проекта

Веб-приложение для отслеживания статистики гольфа с возможностью создания раундов, регистрации ударов и анализа данных. Проект состоит из Node.js/Express бэкенда и React/Vite фронтенда.

## 🏗️ Архитектура

### Структура проекта
```
glf-stat/
├── server/                 # Backend API
│   ├── src/
│   │   └── index.js       # Основной серверный файл
│   ├── data/              # Файлы данных
│   │   ├── rounds.json    # Данные раундов
│   │   └── players.json   # Данные игроков
│   └── package.json
├── client/                 # Frontend React приложение
│   ├── src/
│   │   ├── App.jsx        # Основной компонент
│   │   ├── main.jsx       # Точка входа
│   │   └── index.css      # Стили
│   ├── public/
│   ├── package.json
│   └── vercel.json        # Конфигурация Vercel
├── vercel.json            # Конфигурация Vercel для backend
├── deploy.sh              # Скрипт автоматического деплоя
└── .env.local             # Локальные переменные окружения
```

## 🛠️ Технологический стек

### Backend
- **Node.js** (v18+)
- **Express.js** - веб-фреймворк
- **nanoid** - генерация уникальных ID
- **CORS** - обработка CORS запросов
- **fs/promises** - файловое хранилище данных

### Frontend
- **React** (v18+)
- **Vite** - сборщик
- **React Router DOM** - маршрутизация
- **Tailwind CSS** - стилизация
- **Recharts** - графики и диаграммы

### Deployment
- **Vercel** - хостинг
- **Environment Variables** - конфигурация

## 📊 Модели данных

### Player (Игрок)
```javascript
{
  id: string,           // Уникальный ID (nanoid)
  name: string,         // Имя игрока
  color: string         // Цвет игрока (hex)
}
```

### Round (Раунд)
```javascript
{
  id: string,           // Уникальный ID (nanoid)
  date: string,         // Дата (YYYY-MM-DD)
  course: string,       // Название поля
  courseType: string,   // Тип поля: 'championship' | 'academic'
  players: string[],    // Массив ID игроков
  holes: {              // Объект лунок
    [holeId]: Shot[]    // Массив ударов для каждой лунки
  }
}
```

### Shot (Удар)
```javascript
{
  shotNumber: number,   // Номер удара (отдельно для каждого игрока)
  playerId: string,     // ID игрока
  club: string,         // Клюшка
  distance: number,     // Дистанция (метры)
  result: string,       // Результат: 'success' | 'fail'
  location: string,     // Откуда удар: 'tee' | 'fairway' | 'rough_left' | 'rough_right' | 'forest_left' | 'forest_right' | 'green' | 'pre_green' | 'other'
  targetLocation: string, // Куда попал: 'tee' | 'fairway' | 'rough_left' | 'rough_right' | 'forest_left' | 'forest_right' | 'green' | 'pre_green' | 'lake' | 'hole' | 'other'
  error?: string,       // Ошибка (если result === 'fail'): 'ground' | 'top' | 'slice' | 'hook' | 'shank' | 'direction' | 'choke' | 'heel' | 'too_far' | 'other'
  isPenalty?: boolean   // Штрафной удар
}
```

## 🔌 API Endpoints

### Players (Игроки)
```
POST   /api/players          # Создать игрока
GET    /api/players          # Получить всех игроков
DELETE /api/players/:id      # Удалить игрока
```

### Rounds (Раунды)
```
POST   /api/rounds                    # Создать раунд
GET    /api/rounds                    # Получить все раунды
GET    /api/rounds/:id                # Получить раунд по ID
GET    /api/rounds/:id/stats          # Статистика раунда
GET    /api/rounds/:id/stats/clubs    # Статистика по клюшкам
```

### Shots (Удары)
```
POST   /api/rounds/:id/holes/:holeId/shots                    # Добавить удар
DELETE /api/rounds/:id/holes/:holeId/shots/last               # Удалить последний удар
PUT    /api/rounds/:id/holes/:holeId/shots/:shotNumber        # Обновить удар
GET    /api/rounds/:id/holes/:holeId/players/:playerId/last-shot # Последний удар игрока
```

### System (Система)
```
POST   /api/clear-all-data    # Очистить все данные
```

## 🎨 UI/UX Спецификация

### Цветовая схема
- **Основные цвета игроков:**
  - 🔴 Красный: `#EF4444`
  - 🔵 Синий: `#3B82F6`
  - 🟢 Зеленый: `#10B981`
  - 🟠 Оранжевый: `#F97316`
  - 🟣 Фиолетовый: `#8B5CF6`

### Стиль
- **iOS-подобный дизайн**
- **Адаптация под iPhone (портретная ориентация)**
- **Tailwind CSS для стилизации**
- **Динамические цвета элементов в зависимости от выбранного игрока**

### Навигация
```
/                    # Главная страница (список раундов)
/players             # Управление игроками
/rounds/:id          # Список лунок раунда
/rounds/:id/holes/:holeId  # Детали лунки
```

## 📱 Функциональность

### Управление игроками
- ✅ Создание игроков с именем и цветом
- ✅ Выбор из 5 предустановленных цветов
- ✅ Просмотр списка игроков
- ✅ Удаление игроков
- занятый игроками цвет недоступен для новых игроков

### Управление раундами
- ✅ Создание раундов с выбором игроков
- ✅ Выбор типа поля (Чемпионское 18 лунок / Академическое 9 лунок)
- ✅ Автоматическое название раунда: "{Поле} — {Тип} ({Дата Время})"
- ✅ Сортировка раундов от последнего к первому

### Регистрация ударов
- ✅ Выбор игрока для каждого удара
- ✅ Динамический цвет интерфейса в зависимости от игрока
- ✅ Отдельная нумерация ударов для каждого игрока
- ✅ Автозаполнение поля "Откуда" на основе предыдущего удара (Куда попал)
- ✅ Поле "Куда попал" для следующего удара
- ✅ Поле "Ошибка" (активно только при неудачном результате)
- ✅ Добавление штрафных ударов
- ✅ Удаление последнего удара

### Измерение расстояний (мобильные устройства)
- ✅ Автоматическое включение на мобильных устройствах
- ✅ Кнопка рулетки для переключения режима
- ✅ Плавающие кнопки измерения в правом верхнем углу
- ✅ Отображение текущего расстояния на кнопках
- ✅ GPS-измерение расстояния от точки создания до точки нажатия

### Статистика
- ✅ Общая статистика раунда
- ✅ Статистика по клюшкам
- ✅ Отдельная статистика штрафов
- ✅ Графики и диаграммы (Recharts)

## 🔧 Конфигурация

### Backend (server/package.json)
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

### Frontend (client/package.json)
```json
{
  "name": "golf-stat-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "recharts": "^2.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.7",
    "vite": "^4.1.0"
  }
}
```

### Vercel конфигурация

#### Backend (vercel.json)
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

#### Frontend (client/vercel.json)
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

## 🚀 Развертывание

### Локальная разработка
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run dev
```

### Vercel деплой
```bash
# Автоматический деплой
./deploy.sh

# Или вручную:
# 1. Деплой backend
vercel --prod --force

# 2. Установка переменной окружения
echo "BACKEND_URL/api" | vercel env add VITE_API_URL production

# 3. Деплой frontend
cd client && vercel --prod --force
```

## 📋 Список значений

### Клюшки
```javascript
const clubs = [
  'DR', '3W', '5W', 'HY', '3I', '4I', '5I', '6I', '7I', '8I', '9I', 'PW', 'GW', 'SW', 'LW', 'P'
]
```

### Локации (Откуда)
```javascript
const validLocations = [
  'tee', 'fairway', 'rough_left', 'rough_right', 'forest_left', 'forest_right', 'green', 'pre_green', 'other'
]
```

### Целевые локации (Куда попал)
```javascript
const validTargetLocations = [
  'tee', 'fairway', 'rough_left', 'rough_right', 'forest_left', 'forest_right', 'green', 'pre_green', 'lake', 'hole', 'other'
]
```

### Ошибки
```javascript
const validErrors = [
  'ground', 'top', 'slice', 'hook', 'shank', 'direction', 'choke', 'heel', 'too_far', 'other'
]
```

### Результаты
```javascript
const validResults = [
  'success', 'fail'
]
```

## 🔍 Особенности реализации

### GPS измерение расстояний
- Использование `navigator.geolocation.watchPosition`
- Формула Гаверсина для расчета расстояния
- Плавающие кнопки с цветом игрока, чей удар
- Отображение текущего расстояния в реальном времени

### Автозаполнение полей
- Поле "Откуда" по умолчанию "tee" для первого удара игрока
- Поле "Откуда" заполняется значением "Куда попал" предыдущего удара
- Поле "Ошибка" активно только при неудачном результате

### Сортировка данных
- Раунды: от последнего к первому
- Удары: от последнего к первому
- Нумерация ударов: отдельно для каждого игрока

### Валидация данных
- Проверка существования игроков при создании раунда
- Валидация типов полей
- Проверка корректности локаций и целевых локаций

## 🧪 Тестирование

### Автоматические тесты (deploy.sh)
```bash
# Создание тестовых данных
curl -X POST "$BACKEND_URL/api/players" -H "Content-Type: application/json" -d '{"name":"Test Player","color":"#3B82F6"}'
curl -X POST "$BACKEND_URL/api/rounds" -H "Content-Type: application/json" -d '{"date":"2024-01-16","course":"МГК","courseType":"championship","playerIds":["PLAYER_ID"]}'

# Очистка данных после тестов
curl -X POST "$BACKEND_URL/api/clear-all-data"
```

## 📝 Примечания

1. **Файловое хранилище**: Данные сохраняются в JSON файлах для простоты
2. **CORS**: Настроен для работы с Vercel
3. **Environment Variables**: Используются для конфигурации API URL
4. **Мобильная оптимизация**: GPS функциональность только для мобильных устройств
5. **iOS стиль**: Дизайн адаптирован под iPhone в портретной ориентации

## 🔄 Обновления и поддержка

- Регулярное обновление зависимостей
- Мониторинг производительности Vercel
- Резервное копирование данных
- Логирование ошибок для отладки

---

**Версия спецификации:** 1.0  
**Дата создания:** 2024-01-16  
**Автор:** AI Assistant  
**Статус:** Готово к реализации
