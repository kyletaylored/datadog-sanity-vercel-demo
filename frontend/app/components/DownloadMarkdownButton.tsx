'use client'
import TurndownService from 'turndown'

interface Props {
  /** CSS selector for the element whose content to convert. Defaults to 'main'. */
  contentSelector?: string
  /** Base filename for the downloaded file (without extension). */
  filename?: string
}

export default function DownloadMarkdownButton({
  contentSelector = 'main',
  filename = 'setup-guide',
}: Props) {
  function handleDownload() {
    const el = document.querySelector(contentSelector)
    if (!el) return

    // Clone so we can strip interactive-only elements before converting
    const clone = el.cloneNode(true) as HTMLElement
    clone.querySelectorAll('button, [data-download-exclude]').forEach((n) => n.remove())

    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    })

    // Preserve fenced code blocks — keep the lang class as the fence info string
    td.addRule('fencedCodeBlock', {
      filter: (node) =>
        node.nodeName === 'PRE' &&
        node.firstChild?.nodeName === 'CODE',
      replacement: (_content, node) => {
        const code = node.firstChild as HTMLElement
        const lang = (code.className.match(/language-(\S+)/) ?? [])[1] ?? ''
        return `\n\`\`\`${lang}\n${code.textContent ?? ''}\n\`\`\`\n`
      },
    })

    const markdown = td.turndown(clone.innerHTML)

    const blob = new Blob([markdown], {type: 'text/markdown'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 rounded px-2.5 py-1 transition-colors"
      title="Download page as Markdown (for Confluence import)"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12l-4-4h2.5V4h3v4H12L8 12z"/>
        <rect x="2" y="13" width="12" height="1.5" rx="0.75"/>
      </svg>
      .md
    </button>
  )
}
