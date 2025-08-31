// Distance measurement utilities using GPS
export class DistanceMeasurer {
  constructor() {
    this.positions = []
    this.isTracking = false
    this.watchId = null
    this.onPositionUpdate = null
    this.onDistanceUpdate = null
  }

  // Start tracking position
  startTracking(onPositionUpdate, onDistanceUpdate) {
    if (!navigator.geolocation) {
      throw new Error('Геолокация не поддерживается в этом браузере')
    }

    this.onPositionUpdate = onPositionUpdate
    this.onDistanceUpdate = onDistanceUpdate
    this.isTracking = true

    // Get current position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.addPosition(position)
      },
      (error) => {
        console.error('Ошибка получения текущей позиции:', error)
        throw new Error(`Ошибка GPS: ${this.getErrorMessage(error)}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    // Start watching for position changes
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.addPosition(position)
      },
      (error) => {
        console.error('Ошибка отслеживания позиции:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Stop tracking
  stopTracking() {
    this.isTracking = false
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.onPositionUpdate = null
    this.onDistanceUpdate = null
  }

  // Add new position and calculate distance
  addPosition(position) {
    const newPos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    }

    this.positions.push(newPos)

    if (this.onPositionUpdate) {
      this.onPositionUpdate(newPos)
    }

    // Calculate total distance if we have multiple positions
    if (this.positions.length > 1) {
      const totalDistance = this.calculateTotalDistance()
      if (this.onDistanceUpdate) {
        this.onDistanceUpdate(totalDistance)
      }
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Calculate total distance from all positions
  calculateTotalDistance() {
    let totalDistance = 0
    for (let i = 1; i < this.positions.length; i++) {
      const prev = this.positions[i - 1]
      const curr = this.positions[i]
      totalDistance += this.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng)
    }
    return Math.round(totalDistance)
  }

  // Get current distance
  getCurrentDistance() {
    return this.calculateTotalDistance()
  }

  // Reset measurements
  reset() {
    this.positions = []
  }

  // Get error message
  getErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Доступ к геолокации запрещен'
      case error.POSITION_UNAVAILABLE:
        return 'Информация о местоположении недоступна'
      case error.TIMEOUT:
        return 'Превышено время ожидания'
      default:
        return 'Неизвестная ошибка'
    }
  }

  // Check if geolocation is supported
  static isSupported() {
    return 'geolocation' in navigator
  }

  // Check if running on mobile device
  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
}

import { useState, useEffect, useRef, useCallback } from 'react'

// Hook for using distance measurer in React components
export function useDistanceMeasurer() {
  const [isSupported, setIsSupported] = useState(DistanceMeasurer.isSupported())
  const [isMobile, setIsMobile] = useState(DistanceMeasurer.isMobile())
  const [isTracking, setIsTracking] = useState(false)
  const [currentDistance, setCurrentDistance] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [error, setError] = useState(null)
  const measurerRef = useRef(null)

  useEffect(() => {
    if (isSupported && isMobile) {
      measurerRef.current = new DistanceMeasurer()
    }
    return () => {
      if (measurerRef.current) {
        measurerRef.current.stopTracking()
      }
    }
  }, [isSupported, isMobile])

  const startTracking = useCallback(() => {
    if (!measurerRef.current) return

    try {
      setError(null)
      measurerRef.current.startTracking(
        (position) => setCurrentPosition(position),
        (distance) => setCurrentDistance(distance)
      )
      setIsTracking(true)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const stopTracking = useCallback(() => {
    if (!measurerRef.current) return

    measurerRef.current.stopTracking()
    setIsTracking(false)
  }, [])

  const reset = useCallback(() => {
    if (!measurerRef.current) return

    measurerRef.current.reset()
    setCurrentDistance(0)
    setCurrentPosition(null)
  }, [])

  return {
    isSupported,
    isMobile,
    isTracking,
    currentDistance,
    currentPosition,
    error,
    startTracking,
    stopTracking,
    reset
  }
}
