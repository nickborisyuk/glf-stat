# 🏌️ GLF Stat - Golf Statistics Tracking

Приложение для отслеживания статистики игры в гольф с современным веб-интерфейсом.

## 🚀 Технологии

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Tailwind CSS
- **Графики**: Recharts
- **Хранение данных**: JSON файл (локально)

## 📁 Структура проекта

```
glf-stat/
├── server/           # Backend API
│   ├── src/
│   │   └── index.js  # Основной сервер
│   ├── data/         # Файлы данных (создается автоматически)
│   └── package.json
├── client/           # Frontend React приложение
│   ├── src/
│   │   └── App.jsx   # Основной компонент
│   └── package.json
└── README.md
```

## 🛠️ Установка и запуск

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 📊 Функциональность

### Основные возможности:
- ✅ Создание раундов гольфа
- ✅ Добавление ударов по лункам (1-18)
- ✅ Указание места удара (ти, файервэй, раф, лес, грин)
- ✅ Статистика по клюшкам
- ✅ Статистика по местам ударов
- ✅ Удаление последнего удара
- ✅ Графики и аналитика

### API Endpoints:
- `POST /api/rounds` - Создать раунд
- `GET /api/rounds` - Список раундов
- `GET /api/rounds/:id` - Получить раунд
- `POST /api/rounds/:id/holes/:holeId/shots` - Добавить удар
- `DELETE /api/rounds/:id/holes/:holeId/shots/last` - Удалить последний удар
- `GET /api/rounds/:id/stats` - Общая статистика
- `GET /api/rounds/:id/stats/clubs` - Статистика по клюшкам
- `GET /api/rounds/:id/stats/locations` - Статистика по местам

## 💾 Хранение данных

Данные сохраняются в JSON файл `server/data/rounds.json`. Файл создается автоматически при первом запуске.

### Формат данных:
```json
[
  ["roundId", {
    "id": "roundId",
    "date": "2024-01-15",
    "course": "Golf Course Name",
    "holes": {
      "1": [
        {
          "shotNumber": 1,
          "club": "DR",
          "distance": 220,
          "result": "success",
          "location": "tee"
        }
      ]
    }
  }]
]
```

## 🎨 Интерфейс

- **iOS-стиль** дизайн
- **Адаптирован для iPhone** (вертикальный формат)
- **Интуитивно понятный** интерфейс
- **Реактивные графики** с Recharts

## 🔧 Разработка

### Локальная разработка:
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

### Переменные окружения:
- `NODE_ENV` - окружение (development/production)
- `PORT` - порт сервера (по умолчанию 4000)
- `CORS_ORIGIN` - CORS настройки для продакшена

## 📱 Использование

1. **Создайте раунд** - укажите дату и название поля
2. **Выберите лунку** - от 1 до 18
3. **Добавьте удары** - укажите клюшку, дистанцию, место и результат
4. **Посмотрите статистику** - анализируйте свою игру
5. **Исправьте ошибки** - удалите последний удар при необходимости

## 🚀 Деплой

### Backend (Vercel):
```bash
cd server
vercel --prod
```

### Frontend (Vercel):
```bash
cd client
vercel --prod
```

## 📝 Лицензия

MIT License
