type Props = {
  page: number
  setPage: (n: number) => void
  total: number
  pageSize: number
}

export default function Pagination({ page, setPage, total, pageSize }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  const goto = (n: number) => setPage(Math.min(totalPages, Math.max(1, n)))

  return (
    <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
      <div>
        {start}–{end} of {total}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          onClick={() => goto(1)}
          disabled={!canPrev}
        >
          « First
        </button>
        <button
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          onClick={() => goto(page - 1)}
          disabled={!canPrev}
        >
          ‹ Prev
        </button>
        <button
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          onClick={() => goto(page + 1)}
          disabled={!canNext}
        >
          Next ›
        </button>
        <button
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          onClick={() => goto(totalPages)}
          disabled={!canNext}
        >
          Last »
        </button>
      </div>
    </div>
  )
}
