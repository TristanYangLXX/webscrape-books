import type { BookItem } from "../lib/loadData"

type Props = {
  rows: BookItem[]
  onRowClick?: (item: BookItem) => void
  onClearFilters?: () => void
}

function Price({ value }: { value: number }) {
  return <span>£{value.toFixed(2)}</span>
}

function ratingClass(r: number): string {
  if (r >= 5) return "bg-emerald-50 text-emerald-800"
  if (r === 4) return "bg-lime-50 text-lime-800"
  if (r === 3) return "bg-amber-50 text-amber-800"
  if (r === 2) return "bg-orange-50 text-orange-800"
  if (r === 1) return "bg-rose-50 text-rose-800"
  return "bg-gray-100 text-gray-700"
}

export default function Table({ rows, onRowClick, onClearFilters }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="sticky top-0 z-10 bg-gray-50 text-left font-semibold shadow-sm">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Rating</th>
            <th className="p-3">Availability</th>
            <th className="p-3">Link</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.key}
              className="cursor-pointer border-t border-gray-200 hover:bg-gray-100"
              onClick={() => onRowClick?.(r)}
            >
              <td className="p-3">{r.title}</td>
              <td className="p-3">{r.category || "—"}</td>
              <td className="p-3">
                <Price value={r.price} />
              </td>
              <td className="p-3">
                <span className={`inline-flex items-center rounded px-2 py-0.5 ${ratingClass(r.rating)}`}>
                  {r.rating ? `${r.rating}★` : "—"}
                </span>
              </td>
              <td className="p-3">{r.availability}</td>
              <td className="p-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--brand)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Product
                </a>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-6 text-gray-500" colSpan={6}>
                <div className="flex flex-col items-start gap-3">
                  <span>No items match your filters.</span>
                  {onClearFilters && (
                    <button
                      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm"
                      onClick={onClearFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
