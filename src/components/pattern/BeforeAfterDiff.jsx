import { useState } from 'react'
import CodeBlock from '../common/CodeBlock'
import clsx from 'clsx'

function BeforeAfterDiff({ diff }) {
  const [activeScenario, setActiveScenario] = useState(0)
  const [viewMode, setViewMode] = useState('split') // 'split' | 'before' | 'after'

  if (!diff?.scenarios?.length) return null

  const scenario = diff.scenarios[activeScenario]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {diff.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{diff.subtitle}</p>
      </div>

      {/* Scenario Tabs */}
      <div className="flex flex-wrap gap-2">
        {diff.scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(i)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
              activeScenario === i
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        {scenario.description}
      </p>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {[
          { id: 'split', label: 'Split View' },
          { id: 'before', label: 'Before Only' },
          { id: 'after', label: 'After Only' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={clsx(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              viewMode === mode.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Diff Panels */}
      <div className={clsx(
        'gap-4',
        viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : 'grid grid-cols-1'
      )}>
        {/* Before */}
        {(viewMode === 'split' || viewMode === 'before') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 12H6" /></svg>
                BEFORE
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{scenario.before.label}</span>
            </div>
            <div className="rounded-xl border-2 border-red-200 dark:border-red-800/50 overflow-hidden">
              <CodeBlock
                code={scenario.before.code}
                language={scenario.before.language}
                title={scenario.before.label}
              />
            </div>
          </div>
        )}

        {/* After */}
        {(viewMode === 'split' || viewMode === 'after') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m-6-6h12" /></svg>
                AFTER
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{scenario.after.label}</span>
            </div>
            <div className="rounded-xl border-2 border-green-200 dark:border-green-800/50 overflow-hidden">
              <CodeBlock
                code={scenario.after.code}
                language={scenario.after.language}
                title={scenario.after.label}
              />
            </div>
          </div>
        )}
      </div>

      {/* Insight */}
      {scenario.insight && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <span className="text-xl flex-shrink-0">💡</span>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{scenario.insight}</p>
        </div>
      )}
    </div>
  )
}

export default BeforeAfterDiff
