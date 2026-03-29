import { useState } from 'react'
import CodeBlock from './CodeBlock'
import clsx from 'clsx'

function CodeComparison({ cppCode, javaCode }) {
  const [view, setView] = useState('split') // 'split', 'cpp', 'java'

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setView('split')}
            className={clsx(
              'px-3 py-1 text-sm rounded-md transition-colors',
              view === 'split'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Split View
          </button>
          <button
            onClick={() => setView('cpp')}
            className={clsx(
              'px-3 py-1 text-sm rounded-md transition-colors',
              view === 'cpp'
                ? 'bg-cpp text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            C++ Only
          </button>
          <button
            onClick={() => setView('java')}
            className={clsx(
              'px-3 py-1 text-sm rounded-md transition-colors',
              view === 'java'
                ? 'bg-java text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Java Only
          </button>
        </div>
      </div>

      {/* Code Blocks */}
      <div className={clsx(
        'grid gap-4',
        view === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      )}>
        {(view === 'split' || view === 'cpp') && (
          <CodeBlock
            code={cppCode.code}
            language="cpp"
            title={cppCode.title}
            explanation={cppCode.explanation}
          />
        )}
        {(view === 'split' || view === 'java') && (
          <CodeBlock
            code={javaCode.code}
            language="java"
            title={javaCode.title}
            explanation={javaCode.explanation}
          />
        )}
      </div>
    </div>
  )
}

export default CodeComparison
