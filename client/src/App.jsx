import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

// API URL configuration for different environments
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:4000')

async function api(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-gray-200">
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-3" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="iOS-notch w-2 h-6" />
          <Link className="font-semibold text-gray-900" to="/">GLF Stat</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-screen-sm px-4 py-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>{children}</main>
    </div>
  )
}

function RoundsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [course, setCourse] = useState('Home Course')
  const [created, setCreated] = useState(null)
  const [rounds, setRounds] = useState([])

  const navigate = useNavigate()

  async function createRound(e) {
    e.preventDefault()
    const round = await api('/rounds', {
      method: 'POST',
      body: JSON.stringify({ date, course })
    })
    setCreated(round)
    // refresh list
    const list = await api('/rounds')
    setRounds(list)
  }

  useEffect(() => {
    (async () => {
      const list = await api('/rounds')
      setRounds(list)
    })()
  }, [])

  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">Раунды</h1>
      <form onSubmit={createRound} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <label className="flex flex-col text-sm gap-1">
          <span className="mb-1">Дата</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </label>
        <label className="flex flex-col text-sm sm:col-span-2 gap-1">
          <span className="mb-1">Поле</span>
          <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </label>
        <button className="rounded-full bg-blue-600 text-white px-4 py-3 sm:col-span-3 shadow-sm active:opacity-80">Создать</button>
      </form>

      {created && (
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">Создан раунд {created.id} — {created.course} ({created.date})</div>
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
        {rounds.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.course}</div>
              <div className="text-sm text-gray-600">{r.id} — {r.date}</div>
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
  const holes = useMemo(() => Array.from({ length: 18 }, (_, i) => i + 1), [])
  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">Раунд {id}: Лунки</h1>
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
  const [club, setClub] = useState('7I')
  const [distance, setDistance] = useState(140)
  const [result, setResult] = useState('success')
  const [shots, setShots] = useState([])

  async function addShot(e) {
    e.preventDefault()
    const resp = await api(`/rounds/${id}/holes/${holeId}/shots`, {
      method: 'POST',
      body: JSON.stringify({ club, distance: Number(distance), result })
    })
    setShots((prev) => [...prev, resp.shot])
  }

  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">Раунд {id} — Лунка {holeId}</h1>
      <form onSubmit={addShot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <label className="flex flex-col text-sm gap-1">
          <span className="mb-1">Клюшка</span>
          <select value={club} onChange={(e) => setClub(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {['DR','3W','5W','3I','5I','6I','7I','8I','9I','PW','SW','LW','PT'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm gap-1">
          <span className="mb-1">Дистанция (м)</span>
          <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </label>
        <label className="flex flex-col text-sm gap-1">
          <span className="mb-1">Результат</span>
          <select value={result} onChange={(e) => setResult(e.target.value)} className="appearance-none rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="success">Удачный</option>
            <option value="fail">Неудачный</option>
          </select>
        </label>
        <button className="rounded-full bg-blue-600 text-white px-4 py-3 shadow-sm active:opacity-80">Добавить удар</button>
      </form>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Удары</h2>
        <ul className="space-y-2">
          {shots.map((s) => (
            <li key={s.shotNumber} className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
              #{s.shotNumber}: {s.club} — {s.distance}м — {s.result === 'success' ? 'Удачный' : 'Неудачный'}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

import { Pie, PieChart, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatsPage() {
  const { id } = useParams()
  const [roundStats, setRoundStats] = useState(null)
  const [clubs, setClubs] = useState([])

  useEffect(() => {
    (async () => {
      const rs = await api(`/rounds/${id}/stats`)
      const cs = await api(`/rounds/${id}/stats/clubs`)
      setRoundStats(rs)
      setClubs(cs)
    })()
  }, [id])

  const pieData = roundStats ? [
    { name: 'Удачные', value: roundStats.successPercent },
    { name: 'Неудачные', value: roundStats.failPercent },
  ] : []

  return (
    <Layout>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">Статистика раунда {id}</h1>
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
        <Route path="/rounds/:id/holes" element={<HolesList />} />
        <Route path="/rounds/:id/holes/:holeId" element={<HoleDetail />} />
        <Route path="/rounds/:id/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
