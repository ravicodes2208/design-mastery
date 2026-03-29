import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import clsx from 'clsx'

function CodeBlock({ code, language, title, explanation }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const languageLabel = language === 'cpp' ? 'C++' : 'Java'
  const languageColor = language === 'cpp' ? 'bg-cpp' : 'bg-java'

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'px-2 py-0.5 rounded text-xs font-medium text-white',
            languageColor
          )}>
            {languageLabel}
          </span>
          {title && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {title}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto bg-gray-900">
        <pre className="p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 {explanation}
          </p>
        </div>
      )}
    </div>
  )
}

export default CodeBlock
