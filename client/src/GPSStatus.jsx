import { useState, useEffect } from 'react'

export function GPSStatus() {
  const [isSupported, setIsSupported] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [permission, setPermission] = useState(null)

  useEffect(() => {
    // Check if geolocation is supported
    setIsSupported('geolocation' in navigator)
    
    // Check if running on mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    
    // Check permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermission(result.state)
      })
    }
  }, [])

  if (!isSupported) {
    return null
  }

  if (!isMobile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">📱</span>
          <span className="text-sm text-yellow-800">
            Измерение расстояний доступно только на мобильных устройствах
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-green-600">📍</span>
        <span className="text-sm text-green-800">
          GPS доступен для измерения расстояний
          {permission && (
            <span className="ml-1 text-xs">
              (Разрешение: {permission === 'granted' ? '✅' : permission === 'denied' ? '❌' : '⏳'})
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
