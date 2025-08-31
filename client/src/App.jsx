import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

const APP_VERSION = '0.28.154606';

function getLocationName(location) {
  const locationNames = {
    'tee': 'Ти',
    'left_rough': 'Левый раф',
    'right_rough': 'Правый раф',
    'fairway': 'Файервэй',
    'left_woods': 'Левый лес',
    'right_woods': 'Правый лес',
    'green': 'Грин',
    'lake': 'Озеро',
    'pre_green': 'Прегрин',
    'hole': 'Лунка',
    'other': 'Другое'
  }
  return locationNames[location] || 'Другое'
}

function getErrorName(error) {
  const errorNames = {
    'ground': 'Земля',
    'top_shot': 'Удар сверху',
    'slice': 'Слайс',
    'hook': 'Хук',
    'shank': 'Срез вбок',
    'direction': 'Направление',
    'chunk': 'Зажал',
    'thin': 'Ребром',
    'too_far': 'Слишком далеко',
    'other': 'Другая'
  }
  return errorNames[error] || 'Другая'
}

// API URL configuration for different environments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Debug: log API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL)
  console.log('🌍 Environment:', import.meta.env.MODE)
  console.log('📦 VITE_API_URL:', import.meta.env.VITE_API_URL)
}

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
    if (!res.ok) {
      console.error(`❌ API Error: ${res.status} ${res.statusText} for ${url}`)
      throw new Error(`API ${res.status}: ${res.statusText}`)
    }
    return res.json()
  } catch (error) {
    console.error(`❌ API Request failed: ${url}`, error)
    throw error
  }
}

// Fetch API version
async function fetchApiVersion() {
  try {
    const response = await api('/version');
    return response.version;
  } catch (error) {
    console.error('Failed to fetch API version:', error);
    return 'error';
  }
}

function Layout({ children }) {
  const [apiVersion, setApiVersion] = useState('...');

  useEffect(() => {
    fetchApiVersion().then(setApiVersion);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-gray-200">
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-3" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="iOS-notch w-2 h-6" />
          <Link className="font-semibold text-gray-900" to="/">GLF Stat</Link>
          <span className="text-xs text-gray-500 font-mono">v{APP_VERSION}</span>
          <span className="text-xs text-gray-400 font-mono">API:{apiVersion}</span>
          <div className="flex-1" />
          <Link className="text-blue-600 text-sm" to="/players">Игроки</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-screen-sm px-4 py-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>{children}</main>
    </div>
  )
}

function PlayersPage() {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [playersList, setPlayersList] = useState([])

  async function createPlayer(e) {
    e.preventDefault()
    await api('/players', {
      method: 'POST',
      body: JSON.stringify({ name, color })
    })
    setName('')
    setColor('#3B82F6')
    // refresh list
    const list = await api('/players')
    setPlayersList(list)
  }

  async function deletePlayer(id) {
    await api(`/players/${id}`, {
      method: 'DELETE'
    })
    // refresh list
    const list = await api('/players')
    setPlayersList(list)
  }

  useEffect(() => {
    (async () => {
      const list = await api('/players')
      setPlayersList(list)
    })()
  }, [])

  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">Игроки</h1>
      <form onSubmit={createPlayer} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <label className="flex flex-col text-sm gap-1">
          <span className="mb-1">Имя</span>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </label>
        <label className="flex flex-col text-sm gap-1">
          <span className="mb-1">Цвет</span>
          <select 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
            className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="#EF4444">🔴 Красный</option>
            <option value="#3B82F6">🔵 Синий</option>
            <option value="#10B981">🟢 Зеленый</option>
            <option value="#F97316">🟠 Оранжевый</option>
            <option value="#8B5CF6">🟣 Фиолетовый</option>
          </select>
        </label>
        <button className="rounded-full bg-blue-600 text-white px-4 py-3 shadow-sm active:opacity-80">Добавить</button>
      </form>

      <h2 className="text-xl font-semibold mt-8 mb-2">Список игроков</h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y">
        {playersList.length === 0 && (
          <div className="p-4 text-sm text-gray-600">Нет игроков</div>
        )}
        {playersList.map((player) => (
          <div key={player.id} className="p-4 flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: player.color }}
            />
            <span className="flex-1">{player.name}</span>
            <button 
              onClick={() => deletePlayer(player.id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function RoundsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [course, setCourse] = useState('МГК')
  const [courseType, setCourseType] = useState('championship')
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [created, setCreated] = useState(null)
  const [rounds, setRounds] = useState([])
  const [roundsPlayers, setRoundsPlayers] = useState([])

  const navigate = useNavigate()

  async function createRound(e) {
    e.preventDefault()
    if (selectedPlayers.length === 0) {
      alert('Выберите хотя бы одного игрока')
      return
    }
    
    console.log('Creating round with data:', { date, course, courseType, playerIds: selectedPlayers })
    
    try {
      const round = await api('/rounds', {
        method: 'POST',
        body: JSON.stringify({ date, course, courseType, playerIds: selectedPlayers })
      })
      console.log('Round created successfully:', round)
      setCreated(round)
      
      // Clear form
      setDate('')
      setCourse('МГК')
      setCourseType('championship')
      setSelectedPlayers([])
      
      // refresh list
      const list = await api('/rounds')
      console.log('Updated rounds list:', list)
      setRounds(list)
    } catch (error) {
      console.error('Error creating round:', error)
      alert('Ошибка при создании раунда: ' + error.message)
    }
  }

  function togglePlayer(playerId) {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  useEffect(() => {
    (async () => {
      const [roundsList, playersList] = await Promise.all([
        api('/rounds'),
        api('/players')
      ])
      setRounds(roundsList)
      setRoundsPlayers(playersList)
    })()
  }, [])

  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">Раунды</h1>
      <form onSubmit={createRound} className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Дата</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </label>
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Название поля</span>
            <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </label>
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Тип поля</span>
            <select 
              value={courseType} 
              onChange={(e) => setCourseType(e.target.value)}
              className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="championship">Чемпионское (18 лунок)</option>
              <option value="academic">Академическое (9 лунок)</option>
            </select>
          </label>
        </div>
        
        <div>
          <span className="text-sm font-medium mb-2 block">Игроки</span>
          {roundsPlayers.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-xl">
              Нет игроков. <Link to="/players" className="text-blue-600">Добавить игроков</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {roundsPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    selectedPlayers.includes(player.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="text-sm">{player.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button className="w-full rounded-full bg-blue-600 text-white px-4 py-3 shadow-sm active:opacity-80">
          Создать раунд
        </button>
      </form>

      {created && (
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
            Создан раунд: {created.course} — {created.courseType === 'championship' ? 'Чемпионское' : 'Академическое'} ({created.date})
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-full bg-gray-900 text-white active:opacity-80" onClick={() => navigate(`/rounds/${created.id}/holes`)}>К лункам</button>
            <button className="px-4 py-2 rounded-full bg-indigo-700 text-white active:opacity-80" onClick={() => navigate(`/rounds/${created.id}/stats`)}>К статистике</button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-2">Список раундов</h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm divide-y">
        {rounds.length === 0 && (
          <div className="p-4 text-sm text-gray-600">Нет раундов</div>
        )}
        {rounds
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.course} — {r.courseType === 'championship' ? 'Чемпионское' : 'Академическое'}</div>
              <div className="text-sm text-gray-600">{r.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link className="px-4 py-2 rounded-full bg-gray-900 text-white active:opacity-80" to={`/rounds/${r.id}/holes`}>Лунки</Link>
              <Link className="px-4 py-2 rounded-full bg-indigo-700 text-white active:opacity-80" to={`/rounds/${r.id}/stats`}>Статистика</Link>
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function HolesList() {
  const { id } = useParams()
  const [round, setRound] = useState(null)
  const holes = useMemo(() => {
    const maxHoles = round?.courseType === 'academic' ? 9 : 18
    return Array.from({ length: maxHoles }, (_, i) => i + 1)
  }, [round?.courseType])

  useEffect(() => {
    (async () => {
      try {
        const roundData = await api(`/rounds/${id}`)
        setRound(roundData)
      } catch (error) {
        console.error('Failed to load round data:', error)
      }
    })()
  }, [id])

  return (
    <Layout>
      <div className="mb-4">
        <Link 
          to="/"
          className="text-blue-600 hover:text-blue-700 text-lg font-medium"
        >
          ← К раундам
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">
          {round?.course || 'Раунд'} — {round?.courseType === 'championship' ? 'Чемпионское' : 'Академическое'} ({round?.date || id})
        </h1>
      </div>
      
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {holes.map((n) => (
          <Link key={n} className="p-3 text-center rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm" to={`/rounds/${id}/holes/${n}`}>{n}</Link>
        ))}
      </div>
      <div className="mt-4">
        <Link className="text-blue-700" to={`/rounds/${id}/stats`}>Смотреть статистику</Link>
      </div>
    </Layout>
  )
}

function HoleDetail() {
  const { id, holeId } = useParams()
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [club, setClub] = useState('7I')
  const [distance, setDistance] = useState(140)
  const [result, setResult] = useState('success')
  const [location, setLocation] = useState('tee')
  const [targetLocation, setTargetLocation] = useState('fairway')
  const [error, setError] = useState('ground')
  const [shots, setShots] = useState([])
  const [round, setRound] = useState(null)
  const [holePlayers, setHolePlayers] = useState([])
  const [isAutoMeasureEnabled, setIsAutoMeasureEnabled] = useState(false)
  const [pendingMeasurements, setPendingMeasurements] = useState([])
  const [measurementStartPositions, setMeasurementStartPositions] = useState({})
  const [currentDistances, setCurrentDistances] = useState({})
  const [watchId, setWatchId] = useState(null)

  // Load round data and shots
  useEffect(() => {
    (async () => {
      try {
        console.log('Loading data for round:', id, 'hole:', holeId)
        const [roundData, playersData] = await Promise.all([
          api(`/rounds/${id}`),
          api('/players')
        ])
        console.log('Round data loaded:', roundData)
        console.log('Players data loaded:', playersData)
        setRound(roundData)
        
        // Filter players to only show players in this round
        const roundPlayers = playersData.filter(player => 
          roundData.players && roundData.players.includes(player.id)
        )
        console.log('Round players:', roundPlayers)
        setHolePlayers(roundPlayers)
        setShots(roundData.holes[holeId] || [])
        
        // Set first player as default if available
        if (roundPlayers.length > 0 && !selectedPlayer) {
          console.log('Setting default player:', roundPlayers[0].id)
          setSelectedPlayer(roundPlayers[0].id)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    })()
  }, [id, holeId])

  // Update location when selected player changes
  useEffect(() => {
    if (selectedPlayer) {
      // Check if this player has any shots on this hole
      const playerShots = shots.filter(s => s.playerId === selectedPlayer)
      if (playerShots.length === 0) {
        // First shot for this player - set location to 'tee'
        setLocation('tee')
      } else {
        // Not first shot - set location to last shot's target location
        const lastShot = playerShots[playerShots.length - 1]
        setLocation(lastShot.targetLocation)
      }
    }
  }, [selectedPlayer, shots])

  // Check if running on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Auto-enable measurement on mobile
  useEffect(() => {
    if (isMobile) {
      setIsAutoMeasureEnabled(true)
    }
  }, [isMobile])

  // Start watching position when there are pending measurements
  useEffect(() => {
    if (pendingMeasurements.length > 0 && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp
          }
          
          // Update distances for all pending measurements
          const newDistances = {}
          pendingMeasurements.forEach(measurement => {
            const measurementKey = `${measurement.playerId}-${measurement.shotNumber}`
            const startPos = measurementStartPositions[measurementKey]
            if (startPos) {
              const distance = calculateDistance(
                startPos.lat, startPos.lng,
                currentPos.lat, currentPos.lng
              )
              newDistances[measurementKey] = distance
            }
          })
          
          setCurrentDistances(prev => ({ ...prev, ...newDistances }))
        },
        (error) => {
          console.error('Error watching position:', error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
      setWatchId(id)
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [pendingMeasurements, measurementStartPositions])

  // Get player color for styling
  const playerColor = holePlayers.find(p => p.id === selectedPlayer)?.color || '#3B82F6'

  async function addShot(e) {
    e.preventDefault()
    if (!selectedPlayer) {
      alert('Выберите игрока')
      return
    }
    
    const shotData = { 
      playerId: selectedPlayer,
      club, 
      distance: isAutoMeasureEnabled ? 0 : Number(distance), 
      result, 
      location,
      targetLocation,
      isPenalty: false
    }
    
    // Add error field for failed shots
    if (result === 'fail') {
      shotData.error = error
    }
    
    const resp = await api(`/rounds/${id}/holes/${holeId}/shots`, {
      method: 'POST',
      body: JSON.stringify(shotData)
    })
    
    // If auto-measure is enabled, save start position and add to pending measurements
    if (isAutoMeasureEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const startPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp
          }
          const measurementKey = `${resp.shot.playerId}-${resp.shot.shotNumber}`
          setMeasurementStartPositions(prev => ({
            ...prev,
            [measurementKey]: startPos
          }))
          setPendingMeasurements(prev => [...prev, { playerId: resp.shot.playerId, shotNumber: resp.shot.shotNumber }])
        },
        (error) => {
          console.error('Failed to get position for measurement:', error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
    
    setShots((prev) => [...prev, resp.shot])
    
    // Reset form for next shot
    setLocation(targetLocation)
    setTargetLocation('fairway')
  }

  async function addPenalty(e) {
    e.preventDefault()
    if (!selectedPlayer) {
      alert('Выберите игрока')
      return
    }
    
    const penaltyData = { 
      playerId: selectedPlayer,
      club: 'PT', 
      distance: 0, 
      result: 'fail', 
      location: 'other',
      targetLocation: 'other',
      error: 'other',
      isPenalty: true
    }
    
    console.log('Adding penalty:', penaltyData)
    
    const resp = await api(`/rounds/${id}/holes/${holeId}/shots`, {
      method: 'POST',
      body: JSON.stringify(penaltyData)
    })
    
    console.log('Penalty response:', resp)
    setShots((prev) => [...prev, resp.shot])
    
    // Force reload shots data to ensure consistency
    try {
      const roundData = await api(`/rounds/${id}`)
      setShots(roundData.holes[holeId] || [])
    } catch (error) {
      console.error('Failed to reload shots after penalty:', error)
    }
  }

  async function deleteLastShot() {
    try {
      await api(`/rounds/${id}/holes/${holeId}/shots/last`, {
        method: 'DELETE'
      })
      setShots((prev) => prev.slice(0, -1))
    } catch (error) {
      console.error('Failed to delete last shot:', error)
    }
  }

  function handleDistanceMeasured(measuredDistance) {
    setDistance(measuredDistance)
  }

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c)
  }

  async function completeMeasurement(playerId, shotNumber) {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const endPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp
        }
        
        const measurementKey = `${playerId}-${shotNumber}`
        const startPos = measurementStartPositions[measurementKey]
        if (!startPos) return

        const distance = calculateDistance(
          startPos.lat, startPos.lng,
          endPos.lat, endPos.lng
        )

        // Update the shot with measured distance
        try {
          const updatedShot = shots.find(s => s.shotNumber === shotNumber && s.playerId === playerId)
          if (updatedShot) {
            // Only update the distance field, preserve all other data
            await api(`/rounds/${id}/holes/${holeId}/shots/${shotNumber}`, {
              method: 'PUT',
              body: JSON.stringify({ 
                distance: distance,
                playerId: updatedShot.playerId 
              })
            })
            
            // Update local state - only change the distance for the specific shot
            setShots(prev => prev.map(s => 
              s.shotNumber === shotNumber && s.playerId === playerId
                ? { ...s, distance } 
                : s
            ))
          }
        } catch (error) {
          console.error('Failed to update shot distance:', error)
        }

        // Remove from pending measurements
        setPendingMeasurements(prev => prev.filter(m => !(m.playerId === playerId && m.shotNumber === shotNumber)))
        setMeasurementStartPositions(prev => {
          const newPositions = { ...prev }
          delete newPositions[measurementKey]
          return newPositions
        })
        setCurrentDistances(prev => {
          const newDistances = { ...prev }
          delete newDistances[measurementKey]
          return newDistances
        })
      },
      (error) => {
        console.error('Failed to get position for measurement completion:', error)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <Layout>
      <div className="mb-4">
        <Link 
          to={`/rounds/${id}/holes`}
          className="text-blue-600 hover:text-blue-700 text-lg font-medium"
        >
          ← {round?.course || 'Раунд'} — {round?.courseType === 'championship' ? 'Чемпионское' : 'Академическое'} ({round?.date || id})
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Лунка {holeId}</h1>
      </div>
      
      {round && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm text-blue-800">
            <strong>Игроки:</strong> {round.players?.map(playerId => {
              const player = holePlayers.find(p => p.id === playerId)
              return player ? (
                <span key={playerId} className="inline-flex items-center gap-1 ml-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                  {player.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      <form onSubmit={addShot} className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm" style={{ borderColor: playerColor }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Игрок</span>
            <select 
              value={selectedPlayer} 
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите игрока</option>
              {round?.players?.map(playerId => {
                const player = holePlayers.find(p => p.id === playerId)
                return player ? (
                  <option key={playerId} value={playerId}>{player.name}</option>
                ) : null
              })}
            </select>
          </label>
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Клюшка</span>
            <select value={club} onChange={(e) => setClub(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {['DR','3W','5W','HY','3I','5I','6I','7I','8I','9I','PW','SW','LW','PT'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col text-sm gap-1">
            <span className="mb-1">Дистанция (м)</span>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={distance} 
                onChange={(e) => setDistance(e.target.value)} 
                disabled={isAutoMeasureEnabled}
                className={`flex-1 appearance-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isAutoMeasureEnabled 
                    ? 'bg-gray-100 border border-gray-300 text-gray-500' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              />
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setIsAutoMeasureEnabled(!isAutoMeasureEnabled)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium ${
                    isAutoMeasureEnabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📏
                </button>
              )}
            </div>
          </div>
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Откуда</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="tee">Ти</option>
              <option value="left_rough">Левый раф</option>
              <option value="right_rough">Правый раф</option>
              <option value="fairway">Файервэй</option>
              <option value="left_woods">Левый лес</option>
              <option value="right_woods">Правый лес</option>
              <option value="green">Грин</option>
              <option value="pre_green">Прегрин</option>
              <option value="other">Другое</option>
            </select>
          </label>
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Куда попал</span>
            <select value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="tee">Ти</option>
              <option value="left_rough">Левый раф</option>
              <option value="right_rough">Правый раф</option>
              <option value="fairway">Файервэй</option>
              <option value="left_woods">Левый лес</option>
              <option value="right_woods">Правый лес</option>
              <option value="green">Грин</option>
              <option value="lake">Озеро</option>
              <option value="pre_green">Прегрин</option>
              <option value="hole">Лунка</option>
              <option value="other">Другое</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col text-sm gap-1">
            <span className="mb-1">Результат</span>
            <select value={result} onChange={(e) => setResult(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="success">Удачный</option>
              <option value="fail">Неудачный</option>
            </select>
          </label>
        </div>

        {result === 'fail' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col text-sm gap-1">
              <span className="mb-1">Ошибка</span>
              <select 
                value={error} 
                onChange={(e) => setError(e.target.value)}
                className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ground">Земля</option>
                <option value="top_shot">Удар сверху</option>
                <option value="slice">Слайс</option>
                <option value="hook">Хук</option>
                <option value="shank">Срез вбок</option>
                <option value="direction">Направление</option>
                <option value="chunk">Зажал</option>
                <option value="thin">Ребром</option>
                <option value="too_far">Слишком далеко</option>
                <option value="other">Другая</option>
              </select>
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            type="submit"
            className="rounded-full text-white px-4 py-3 shadow-sm active:opacity-80"
            style={{ backgroundColor: playerColor }}
          >
            Добавить удар
          </button>
          <button 
            type="button"
            onClick={addPenalty}
            className="rounded-full bg-gray-900 text-white px-4 py-3 shadow-sm active:opacity-80"
          >
            Добавить штраф
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Удары</h2>
          {shots.length > 0 && (
            <button 
              onClick={deleteLastShot}
              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              Удалить последний
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {shots
            .slice()
            .reverse()
            .map((s) => {
            const player = holePlayers.find(p => p.id === s.playerId)
            return (
              <li key={`${s.playerId}-${s.shotNumber}`} className={`bg-white border p-3 rounded-2xl shadow-sm ${s.isPenalty ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: player?.color || '#3B82F6' }}
                  />
                  <span className="text-sm font-medium">{player?.name || 'Неизвестный'}</span>
                  <span className="text-sm text-gray-500">#{s.shotNumber}</span>
                  {s.isPenalty && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Штраф</span>
                  )}
                </div>
                <div className="text-sm">
                  {s.isPenalty ? (
                    <span className="text-red-700">Штрафной удар</span>
                  ) : (
                    <>
                      {s.club} — {s.distance}м — {getLocationName(s.location)} → {getLocationName(s.targetLocation)} — {s.result === 'success' ? 'Удачный' : 'Неудачный'}
                      {s.error && (
                        <span className="text-red-600 ml-2">({getErrorName(s.error)})</span>
                      )}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {shots.length === 0 && (
          <p className="text-gray-500 text-center py-4">Нет ударов</p>
        )}
      </div>



      {/* Floating Measurement Buttons */}
      {isAutoMeasureEnabled && pendingMeasurements.length > 0 && (
        <div className="fixed top-20 right-4 z-40 space-y-2">
          {pendingMeasurements.map((measurement) => {
            const player = holePlayers.find(p => p.id === measurement.playerId)
            const measurementKey = `${measurement.playerId}-${measurement.shotNumber}`
            const currentDistance = currentDistances[measurementKey] || 0
            return (
              <button
                key={measurementKey}
                onClick={() => completeMeasurement(measurement.playerId, measurement.shotNumber)}
                className="min-w-[60px] h-12 rounded-full text-white font-bold text-xs shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center"
                style={{ backgroundColor: player?.color || '#3B82F6' }}
                title={`Завершить измерение удара #${measurement.shotNumber} (${player?.name || 'Неизвестный'})`}
              >
                <div>#{measurement.shotNumber}</div>
                <div className="text-[10px] font-normal">{currentDistance}м</div>
              </button>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

import { Pie, PieChart, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatsPage() {
  const { id } = useParams()
  const [roundStats, setRoundStats] = useState(null)
  const [clubs, setClubs] = useState([])
  const [locations, setLocations] = useState([])

  useEffect(() => {
    (async () => {
      const rs = await api(`/rounds/${id}/stats`)
      const cs = await api(`/rounds/${id}/stats/clubs`)
      const ls = await api(`/rounds/${id}/stats/locations`)
      setRoundStats(rs)
      setClubs(cs)
      setLocations(ls)
    })()
  }, [id])

  const pieData = roundStats ? [
    { name: 'Удачные', value: roundStats.successPercent },
    { name: 'Неудачные', value: roundStats.failPercent },
  ] : []

  return (
    <Layout>
      <div className="mb-4">
        <Link 
          to={`/rounds/${id}/holes`}
          className="text-blue-600 hover:text-blue-700 text-lg font-medium"
        >
          ← К лункам
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Статистика</h1>
      </div>
      {roundStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Общая статистика</h2>
            <p className="text-sm text-gray-600">Всего ударов: {roundStats.totalShots}</p>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80} label>
                    <Cell fill="#16a34a" />
                    <Cell fill="#dc2626" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Клюшки</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Клюшка</th>
                    <th className="py-2 pr-4">Удары</th>
                    <th className="py-2 pr-4">Средняя дистанция</th>
                    <th className="py-2 pr-4">% Успеха</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((c) => (
                    <tr key={c.club} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{c.club}</td>
                      <td className="py-2 pr-4">{c.shots}</td>
                      <td className="py-2 pr-4">{c.avgDistance} м</td>
                      <td className="py-2 pr-4">{c.successPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-56 md:h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clubs}>
                  <XAxis dataKey="club" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgDistance" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {locations.length > 0 && (
        <div className="mt-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Статистика по местам ударов</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-4">Место</th>
                    <th className="py-2 pr-4">Удары</th>
                    <th className="py-2 pr-4">Средняя дистанция</th>
                    <th className="py-2 pr-4">% Успеха</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((l) => (
                    <tr key={l.location} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{getLocationName(l.location)}</td>
                      <td className="py-2 pr-4">{l.shots}</td>
                      <td className="py-2 pr-4">{l.avgDistance} м</td>
                      <td className="py-2 pr-4">{l.successPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-56 md:h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locations}>
                  <XAxis dataKey="location" tickFormatter={getLocationName} />
                  <YAxis />
                  <Tooltip labelFormatter={getLocationName} />
                  <Bar dataKey="successPercent" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link className="text-blue-700" to={`/rounds/${id}/holes`}>К лункам</Link>
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoundsPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/rounds/:id/holes" element={<HolesList />} />
        <Route path="/rounds/:id/holes/:holeId" element={<HoleDetail />} />
        <Route path="/rounds/:id/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
