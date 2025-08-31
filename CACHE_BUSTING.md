# 🚫 Система антикэширования GLF Stat

## 📋 Обзор

Для гарантии получения актуальных данных все GET запросы к API оснащены системой антикэширования, которая предотвращает использование устаревших данных из кэша.

## 🔧 Реализация

### Frontend (client/src/App.jsx)

#### Функция `api()`
```javascript
async function api(path, options) {
  try {
    // Add cache-busting parameter for GET requests
    let url = `${API_URL}${path}`
    if (!options || options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const separator = path.includes('?') ? '&' : '?'
      url = `${url}${separator}_t=${Date.now()}`
    }
    
    const res = await fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      ...options,
    })
    // ... rest of function
  }
}
```

#### Механизм работы:
1. **Параметр `_t`** - добавляется к каждому GET запросу с текущим timestamp
2. **Заголовки антикэширования** - предотвращают кэширование на всех уровнях
3. **Уникальные URL** - каждый запрос имеет уникальный URL

### Backend (server/src/index.js)

#### Middleware для всех ответов
```javascript
// Add cache-busting headers to all responses
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});
```

## 📊 Примеры запросов

### Без параметров
```
GET /api/players
→ GET /api/players?_t=1756631497029
```

### С параметрами
```
GET /api/rounds/123/stats?type=clubs
→ GET /api/rounds/123/stats?type=clubs&_t=1756631497029
```

## 🛡️ Защита от кэширования

### Уровни защиты:

1. **URL параметр** - `_t=timestamp` делает каждый запрос уникальным
2. **HTTP заголовки** - `Cache-Control: no-cache, no-store, must-revalidate`
3. **Legacy заголовки** - `Pragma: no-cache` для старых браузеров
4. **Expires** - `Expires: 0` для немедленного истечения

### Заголовки ответа:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

## 🎯 Применение

### GET запросы (с антикэшированием):
- `GET /api/players` - список игроков
- `GET /api/rounds` - список раундов
- `GET /api/rounds/:id` - данные раунда
- `GET /api/rounds/:id/stats` - статистика раунда
- `GET /api/version` - версия API

### POST/PUT/DELETE запросы (без антикэширования):
- `POST /api/players` - создание игрока
- `POST /api/rounds` - создание раунда
- `POST /api/rounds/:id/holes/:holeId/shots` - добавление удара
- `DELETE /api/players/:id` - удаление игрока

## 🔍 Отладка

### Проверка в браузере:
1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Network
3. Выполните действие в приложении
4. Проверьте, что все GET запросы содержат параметр `_t`

### Проверка заголовков:
```bash
curl -I "https://your-api-url.vercel.app/api/players"
```

Ожидаемые заголовки:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

## 📈 Преимущества

1. **Актуальность данных** - всегда получаем свежие данные
2. **Отсутствие конфликтов** - нет проблем с устаревшими данными
3. **Простота отладки** - легко отследить проблемы с данными
4. **Кроссбраузерность** - работает во всех современных браузерах

## ⚠️ Примечания

- **Производительность** - каждый запрос уникален, но это необходимо для актуальности
- **Размер запросов** - параметр `_t` добавляет ~13 байт к каждому GET запросу
- **Совместимость** - система работает с любыми прокси и CDN

---

**Версия документации:** 1.0  
**Дата создания:** 2025-08-31  
**Статус:** Активно используется
