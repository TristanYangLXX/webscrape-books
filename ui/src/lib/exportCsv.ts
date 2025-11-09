import type { BookItem } from "./loadData"

const escape = (s: string | number | undefined | null): string => {
  const value = s ?? ""
  return `"${String(value).replace(/"/g, '""')}"`
}

export function exportRowsToCsv(filename: string, rows: BookItem[]): void {
  const header = ["title", "category", "price", "rating", "availability", "url"]
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        escape(r.title),
        escape(r.category || ""),
        escape(r.price),
        escape(r.rating),
        escape(r.availability || ""),
        escape(r.url),
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([lines], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
