import type { BookItem } from "../lib/loadData"

type Props = {
  item: BookItem | null
  onClose: () => void
}

export default function DetailPanel({ item, onClose }: Props) {
  const open = !!item
  const img = item?.imageUrl || ""
  const desc = item?.description || ""

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Book Details</h2>
          <button className="rounded-md border px-2 py-1 text-sm" onClick={onClose}>
            Close
          </button>
        </div>

        {item && (
          <div className="space-y-3 p-4 text-sm">
            <div className="w-full">
              {img ? (
                <img
                  src={img}
                  alt={item.title}
                  className="mx-auto max-h-64 rounded-md border object-contain"
                />
              ) : (
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-md border text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-500">Title</div>
              <div className="font-medium">{item.title}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div>£{item.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Rating</div>
                <div>
                  {item.rating || "—"}
                  {item.rating ? "★" : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Category</div>
                <div>{item.category || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Availability</div>
                <div>{item.availability || "—"}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Description</div>
              <div className="whitespace-pre-wrap">
                {desc || <span className="text-gray-500">No description available.</span>}
              </div>
            </div>

            <div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md border px-3 py-2 text-blue-600 hover:bg-blue-50"
              >
                Open Product Page
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
