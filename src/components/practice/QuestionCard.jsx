import { useState, lazy, Suspense } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Eye, EyeOff, Tag, Loader2 } from 'lucide-react'
import clsx from 'clsx'

// Lazy-load InteractiveEditor since it pulls in Monaco (~2MB)
const InteractiveEditor = lazy(() => import('../pattern/InteractiveEditor'))

const difficultyColors = {
  basic: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

const languages = [
  { id: 'java', label: 'Java', color: 'bg-java' },
  { id: 'cpp', label: 'C++', color: 'bg-cpp' },
  { id: 'kotlin', label: 'Kotlin', color: 'bg-purple-600' }
]

const langLabel = { java: 'Java', cpp: 'C++', kotlin: 'Kotlin' }

function QuestionCard({ question }) {
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [solutionLanguage, setSolutionLanguage] = useState('java')

  // Figure out which languages have solutions
  const availableLangs = languages.filter(l => question.solutions?.[l.id])

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {question.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                difficultyColors[question.difficulty]
              )}>
                {question.difficulty}
              </span>
              {question.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-4">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {question.description}
        </p>
      </div>

      {/* Hints Section */}
      {question.hints && question.hints.length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? 'Hide Hints' : 'Show Hints'}
            {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHints && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {question.hints.map((hint, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                    Hint {index + 1}:
                  </span>
                  <span className="text-sm text-yellow-800 dark:text-yellow-300">
                    {hint}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Solution Section */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {showSolution ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="text-sm font-medium">Hide Solution</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Show Solution</span>
            </>
          )}
        </button>

        {showSolution && (
          <div className="p-4 space-y-4 animate-fade-in">
            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Solution in:</span>
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                {availableLangs.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSolutionLanguage(lang.id)}
                    className={clsx(
                      'px-3 py-1 text-sm rounded-md transition-colors font-medium',
                      solutionLanguage === lang.id
                        ? `${lang.color} text-white`
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Code Editor */}
            {question.solutions[solutionLanguage] && (
              <Suspense
                fallback={
                  <div className="h-[300px] flex items-center justify-center bg-gray-900 rounded-lg text-gray-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading editor...
                  </div>
                }
              >
                <InteractiveEditor
                  key={`${question.id}-${solutionLanguage}`}
                  code={question.solutions[solutionLanguage]}
                  language={solutionLanguage}
                  title={`${langLabel[solutionLanguage]} Solution`}
                />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
