import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function ConceptCard({ concept, isExpanded: defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white text-left">
          {concept.title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
          {/* Explanation */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {concept.explanation}
          </p>

          {/* Real World Analogy */}
          {concept.realWorldAnalogy && (
            <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Real World Analogy:
                </span>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  {concept.realWorldAnalogy}
                </p>
              </div>
            </div>
          )}

          {/* Key Points */}
          {concept.keyPoints && concept.keyPoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary-500" />
                Key Points
              </h4>
              <ul className="space-y-1.5">
                {concept.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="text-primary-500 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ConceptCard
