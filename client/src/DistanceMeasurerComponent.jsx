import { useDistanceMeasurer } from './distanceMeasurer'

export function DistanceMeasurerComponent({ onDistanceMeasured, onClose }) {
  const {
    isSupported,
    isMobile,
    isTracking,
    currentDistance,
    currentPosition,
    error,
    startTracking,
    stopTracking,
    reset
  } = useDistanceMeasurer()

  const handleStartTracking = () => {
    startTracking()
  }

  const handleStopTracking = () => {
    stopTracking()
  }

  const handleUseDistance = () => {
    if (currentDistance > 0) {
      onDistanceMeasured(currentDistance)
      onClose()
    }
  }

  const handleReset = () => {
    reset()
  }

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4">Измерение расстояний</h3>
          <p className="text-gray-600 mb-4">
            Геолокация не поддерживается в этом браузере.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4">Измерение расстояний</h3>
          <p className="text-gray-600 mb-4">
            Измерение расстояний доступно только на мобильных устройствах.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Измерение расстояний</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Distance Display */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {currentDistance}м
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Измеренное расстояние
            </div>
          </div>

          {/* Position Info */}
          {currentPosition && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm text-blue-800">
                <div>Точность: ±{Math.round(currentPosition.accuracy)}м</div>
                <div className="text-xs mt-1">
                  Координаты: {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Как использовать:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Нажмите "Начать измерение"</li>
              <li>Пройдите от точки удара до мяча</li>
              <li>Нажмите "Остановить измерение"</li>
              <li>Используйте измеренное расстояние</li>
            </ol>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {!isTracking ? (
              <button
                onClick={handleStartTracking}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
              >
                Начать измерение
              </button>
            ) : (
              <button
                onClick={handleStopTracking}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-medium"
              >
                Остановить измерение
              </button>
            )}

            {currentDistance > 0 && (
              <button
                onClick={handleUseDistance}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium"
              >
                Использовать расстояние ({currentDistance}м)
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
