import { useEffect, useMemo, useState } from 'react'
import './App.css'

type BookItem = {
  key: string
  url: string
  title: string
  price: number
  availability: string
  rating: number
  category: string
  site: 'books'
}

export default function App() {
  const [items, setItems] = useState<BookItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [sort, setSort] = useState<'price' | 'rating' | 'title'>('price')

  useEffect(() => {
    // simplest dev flow: copy scraper/data/items.jsonl -> ui/public/items.jsonl
    fetch('/items.jsonl')
      .then((r) => r.text())
      .then((t) =>
        t
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line) as BookItem),
      )
      .then(setItems)
      .catch(console.error)
  }, [])

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category || ''))
    return ['All', ...Array.from(set).filter(Boolean).sort()]
  }, [items])

  const filtered = useMemo(() => {
    let rows = items
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.title.toLowerCase().includes(q))
    }
    if (category !== 'All') rows = rows.filter((r) => r.category === category)
    rows = [...rows].sort((a, b) => {
      if (sort === 'price') return a.price - b.price
      if (sort === 'rating') return b.rating - a.rating
      return a.title.localeCompare(b.title)
    })
    return rows
  }, [items, search, category, sort])

  return (
    <div className="container">
      <h1>Books Explorer</h1>
      <div className="controls">
        <input
          placeholder="Search title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((b) => (
            <tr key={b.key} onClick={() => window.open(b.url, '_blank')}>
              <td>{b.title}</td>
              <td>{b.category || '—'}</td>
              <td>£{b.price.toFixed(2)}</td>
              <td>{b.rating}</td>
              <td>{b.availability}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Later: add <Chart /> to show counts by category or rating */}
    </div>
  )
}
