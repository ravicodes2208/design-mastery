import { useState, useCallback } from 'react'
import CodeBlock from '../common/CodeBlock'
import clsx from 'clsx'

function CodeEvolution({ evolution }) {
  const [activeStage, setActiveStage] = useState(0)

  if (!evolution?.stages?.length) return null

  const stage = evolution.stages[activeStage]
  const total = evolution.stages.length

  const goTo = useCallback((idx) => {
    setActiveStage(Math.max(0, Math.min(total - 1, idx)))
  }, [total])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {evolution.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{evolution.subtitle}</p>
      </div>

      {/* Timeline Slider */}
      <div className="relative">
        {/* Track */}
        <div className="flex items-center gap-0">
          {evolution.stages.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              {/* Node */}
              <button
                onClick={() => goTo(i)}
                className={clsx(
                  'relative z-10 flex flex-col items-center gap-1 group',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1'
                )}
              >
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 border-2',
                  i === activeStage
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-lg shadow-primary-500/20 scale-110'
                    : i < activeStage
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:border-primary-300'
                )}>
                  {s.icon}
                </div>
                <span className={clsx(
                  'text-xs font-medium whitespace-nowrap transition-colors',
                  i === activeStage
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}>
                  {s.shortLabel}
                </span>
              </button>

              {/* Connector */}
              {i < total - 1 && (
                <div className="flex-1 h-0.5 mx-1 relative top-[-10px]">
                  <div className={clsx(
                    'h-full rounded transition-colors duration-300',
                    i < activeStage ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                  )} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Range Slider (invisible, overlaid for drag) */}
        <input
          type="range"
          min={0}
          max={total - 1}
          value={activeStage}
          onChange={(e) => goTo(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ top: 0, height: '48px' }}
          aria-label="Code evolution stage"
        />
      </div>

      {/* Stage Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{stage.icon}</span>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{stage.label}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stage.description}</p>
          </div>
        </div>

        {/* Problems / Trade-offs */}
        <div className="flex flex-wrap gap-2">
          {stage.problems.map((p, i) => (
            <span
              key={i}
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                activeStage === 0
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : activeStage === total - 1
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              )}
            >
              {activeStage === 0 ? '❌' : activeStage === total - 1 ? '✅' : '⚠️'} {p}
            </span>
          ))}
        </div>
      </div>

      {/* Code */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <CodeBlock
          code={stage.code}
          language="java"
          title={`Stage ${activeStage + 1}/${total} — ${stage.label}`}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goTo(activeStage - 1)}
          disabled={activeStage === 0}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeStage === 0
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
          )}
        >
          ← Previous Stage
        </button>
        <span className="text-xs text-gray-400">
          {activeStage + 1} / {total}
        </span>
        <button
          onClick={() => goTo(activeStage + 1)}
          disabled={activeStage === total - 1}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeStage === total - 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-white bg-primary-600 hover:bg-primary-700'
          )}
        >
          Next Stage →
        </button>
      </div>
    </div>
  )
}

export default CodeEvolution
