import type { ReactNode } from "react"

/**
 * Lightweight markdown renderer — handles headings, lists, tables,
 * blockquotes, bold and paragraphs. Sufficient for the report content.
 */
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n")
  const blocks: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === "") {
      i++
      continue
    }

    // table
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines.filter((l) => !/^\s*\|[-\s|]+\|\s*$/.test(l))
      const header = rows[0]
      const body = rows.slice(1)
      const cells = (l: string) =>
        l.split("|").slice(1, -1).map((c) => c.trim())
      blocks.push(
        <div
          key={`t${i}`}
          className="my-4 overflow-hidden rounded-xl border border-border"
        >
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                {cells(header).map((c, ci) => (
                  <th
                    key={ci}
                    className="px-4 py-2.5 text-left font-medium text-foreground"
                  >
                    {inline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-border">
                  {cells(r).map((c, ci) => (
                    <td key={ci} className="px-4 py-2.5 text-muted-foreground">
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h4 key={i} className="mt-5 mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          {inline(line.slice(4))}
        </h4>,
      )
      i++
      continue
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h3 key={i} className="mt-2 mb-3 text-lg font-semibold text-foreground">
          {inline(line.slice(3))}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={i}
          className="my-4 rounded-r-lg border-l-2 border-primary bg-primary/8 px-4 py-3 text-sm text-foreground"
        >
          {inline(line.slice(2))}
        </blockquote>,
      )
      i++
      continue
    }
    // ordered list
    if (/^\d+\.\s/.test(line)) {
      const list: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        list.push(lines[i].replace(/^\d+\.\s/, ""))
        i++
      }
      blocks.push(
        <ol key={`ol${i}`} className="my-3 ml-1 flex flex-col gap-2">
          {list.map((item, li) => (
            <li key={li} className="flex gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs text-primary">{li + 1}</span>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ol>,
      )
      continue
    }
    // unordered list
    if (/^[-*]\s/.test(line)) {
      const list: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        list.push(lines[i].replace(/^[-*]\s/, ""))
        i++
      }
      blocks.push(
        <ul key={`ul${i}`} className="my-3 flex flex-col gap-2">
          {list.map((item, li) => (
            <li key={li} className="flex gap-3 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    blocks.push(
      <p key={i} className="my-2 text-sm leading-relaxed text-muted-foreground">
        {inline(line)}
      </p>,
    )
    i++
  }

  return <div>{blocks}</div>
}
