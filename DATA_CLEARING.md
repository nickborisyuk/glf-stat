# 🧹 Очистка данных GLF Stat

## 📋 Обзор

Система очистки данных позволяет полностью удалить все данные из приложения для тестирования или сброса состояния.

## 🔧 API Endpoint

### `POST /api/clear-all-data`

**Описание:** Очищает все данные из системы

**Метод:** `POST`

**URL:** `https://your-api-url.vercel.app/api/clear-all-data`

**Заголовки:** `Content-Type: application/json`

**Тело запроса:** Пустое (не требуется)

## 📊 Ответ

### Успешный ответ (200):
```json
{
  "message": "All data cleared successfully",
  "cleared": {
    "rounds": 0,
    "players": 0
  }
}
```

### Ошибка (500):
```json
{
  "error": "Failed to clear data"
}
```

## 🗑️ Что очищается

При выполнении запроса удаляются:

- ✅ **Все игроки** - данные из `players` Map
- ✅ **Все раунды** - данные из `rounds` Map
- ✅ **Все удары** - удары в лунках всех раундов
- ✅ **Все штрафы** - штрафные удары
- ✅ **Файлы данных** - `rounds.json` и `players.json` перезаписываются

## 🔍 Примеры использования

### cURL
```bash
# Очистить все данные
curl -X POST https://glf-stat-lw3bex1eg-nick-borisyuks-projects.vercel.app/api/clear-all-data

# Проверить результат
curl https://glf-stat-lw3bex1eg-nick-borisyuks-projects.vercel.app/api/players
curl https://glf-stat-lw3bex1eg-nick-borisyuks-projects.vercel.app/api/rounds
```

### JavaScript/Fetch
```javascript
// Очистить все данные
const response = await fetch('https://your-api-url.vercel.app/api/clear-all-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(result.message); // "All data cleared successfully"
```

## 🛡️ Безопасность

### Логирование
Все операции очистки логируются в консоль сервера:
```
🧹 Clearing all data...
📊 Before clearing: 5 rounds, 3 players
📊 After clearing: 0 rounds, 0 players
✅ Data saved to file successfully
```

### Подтверждение
Операция возвращает детальную информацию о том, что было очищено.

## 🔄 Автоматическая очистка

### В скрипте деплоя
```bash
# Очистка после тестирования
curl -X POST "$BACKEND_URL/api/clear-all-data" > /dev/null 2>&1
```

### При разработке
В режиме разработки данные автоматически очищаются при старте сервера:
```javascript
if (NODE_ENV === 'development' && (rounds.size > 0 || players.size > 0)) {
  console.log('🧹 Clearing old data for fresh start...');
  rounds.clear();
  players.clear();
  await saveData(rounds, players);
  console.log('✅ Data cleared successfully');
}
```

## ⚠️ Важные замечания

1. **Необратимость** - операция необратима, все данные удаляются навсегда
2. **Только для тестирования** - предназначен для тестовых сред
3. **Логирование** - все операции записываются в логи сервера
4. **Синхронизация** - очищает как память, так и файлы данных

## 🧪 Тестирование

### Создание тестовых данных
```bash
# Создать игроков
curl -X POST https://your-api-url.vercel.app/api/players -H "Content-Type: application/json" -d '{"name":"Тест","color":"#3B82F6"}'

# Создать раунд
curl -X POST https://your-api-url.vercel.app/api/rounds -H "Content-Type: application/json" -d '{"date":"2024-01-16","course":"МГК","courseType":"championship","playerIds":["PLAYER_ID"]}'
```

### Проверка очистки
```bash
# Проверить, что данные очистились
curl https://your-api-url.vercel.app/api/players
# Ожидаемый результат: []

curl https://your-api-url.vercel.app/api/rounds
# Ожидаемый результат: []
```

---

**Версия документации:** 1.0  
**Дата создания:** 2025-08-31  
**Статус:** Активно используется
