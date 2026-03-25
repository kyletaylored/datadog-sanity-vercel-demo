import {codeToHtml} from 'shiki'
import CopyButton from './CopyButton'

export default async function CodeBlock({
  code,
  lang,
  filename,
}: {
  code: string
  lang: string
  filename?: string
}) {
  const highlighted = await codeToHtml(code.trim(), {
    lang,
    theme: 'github-dark',
  })

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-800">
      {filename && (
        <div className="bg-gray-800 text-gray-400 text-xs font-mono px-4 py-2 border-b border-gray-700">
          {filename}
        </div>
      )}
      <div className="relative group">
        <CopyButton code={code.trim()} />
        <div
          className="overflow-x-auto bg-gray-950 text-sm leading-relaxed [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!bg-transparent [&>pre>code]:!font-mono"
          dangerouslySetInnerHTML={{__html: highlighted}}
        />
      </div>
    </div>
  )
}
