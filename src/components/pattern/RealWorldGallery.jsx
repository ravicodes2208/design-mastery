import { useState } from 'react'
import CodeBlock from '../common/CodeBlock'
import clsx from 'clsx'

function RealWorldGallery({ realworld }) {
  const [activeExample, setActiveExample] = useState(null)

  if (!realworld?.examples?.length) return null

  const categories = [...new Set(realworld.examples.map(e => e.category))]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {realworld.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{realworld.subtitle}</p>
      </div>

      {/* Category Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {categories.map((cat) => (
          <span
            key={cat}
            className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              cat === 'JDK' && 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
              cat === 'Framework' && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
              cat === 'Library' && 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
              cat === 'Frontend' && 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
            )}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {realworld.examples.map((example) => (
          <div
            key={example.id}
            className={clsx(
              'rounded-xl border-2 overflow-hidden transition-all cursor-pointer',
              activeExample === example.id
                ? 'border-primary-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
            )}
            onClick={() => setActiveExample(activeExample === example.id ? null : example.id)}
          >
            {/* Card Header */}
            <div className="p-4 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{example.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {example.title}
                    </h3>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                      example.category === 'JDK' && 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
                      example.category === 'Framework' && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                      example.category === 'Library' && 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                      example.category === 'Frontend' && 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
                    )}>
                      {example.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{example.source}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {example.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Expandable Code + Lesson */}
            {activeExample === example.id && (
              <div className="animate-fade-in border-t border-gray-200 dark:border-gray-700">
                <CodeBlock code={example.code} language="java" title={example.source} />
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 flex items-start gap-2">
                  <span className="text-amber-500 flex-shrink-0 text-sm">💡</span>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{example.lesson}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RealWorldGallery
