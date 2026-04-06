import { useState, lazy, Suspense } from 'react'
import CodeBlock from '../common/CodeBlock'
import clsx from 'clsx'

// Lazy load Monaco only when user starts a challenge
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

function ChallengeCard({ challenge, isActive, onClick }) {
  const colorMap = { green: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', red: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' }

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border-2 transition-all',
        isActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-md'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-bold', colorMap[challenge.difficultyColor])}>
          {challenge.difficulty}
        </span>
        <span className="text-xs text-gray-400">{challenge.timeEstimate}</span>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{challenge.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{challenge.description}</p>
    </button>
  )
}

function RefactoringChallenge({ challenge: challengeData }) {
  const [activeChallenge, setActiveChallenge] = useState(0)
  const [code, setCode] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [revealedHints, setRevealedHints] = useState(0)
  const [editorStarted, setEditorStarted] = useState(false)

  if (!challengeData?.challenges?.length) return null

  const challenge = challengeData.challenges[activeChallenge]

  const startChallenge = () => {
    setCode(challenge.starterCode)
    setEditorStarted(true)
    setShowHints(false)
    setShowSolution(false)
    setRevealedHints(0)
  }

  const resetChallenge = () => {
    setCode(challenge.starterCode)
    setShowHints(false)
    setShowSolution(false)
    setRevealedHints(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {challengeData.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{challengeData.subtitle}</p>
      </div>

      {/* Challenge Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {challengeData.challenges.map((c, i) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            isActive={activeChallenge === i}
            onClick={() => {
              setActiveChallenge(i)
              setEditorStarted(false)
              setShowSolution(false)
              setShowHints(false)
              setRevealedHints(0)
            }}
          />
        ))}
      </div>

      {/* Active Challenge */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{challenge.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{challenge.description}</p>
        </div>

        {!editorStarted ? (
          /* Pre-start: Show starter code as read-only */
          <div className="p-5 space-y-4">
            <CodeBlock code={challenge.starterCode} language="java" title="Starter Code (Read Only)" />
            <button
              onClick={startChallenge}
              className="w-full py-3 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">⚔️</span>
              Start Challenge — Open Editor
            </button>
          </div>
        ) : (
          /* Editor Mode */
          <div className="space-y-0">
            {/* Monaco Editor */}
            <div className="h-[400px] border-b border-gray-200 dark:border-gray-700">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
                  Loading editor...
                </div>
              }>
                <MonacoEditor
                  height="100%"
                  language="java"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </Suspense>
            </div>

            {/* Toolbar */}
            <div className="p-4 flex items-center gap-3 flex-wrap bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => { setShowHints(true); setRevealedHints(Math.min(revealedHints + 1, challenge.hints.length)) }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
              >
                💡 Hint ({revealedHints}/{challenge.hints.length})
              </button>
              <button
                onClick={resetChallenge}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
              >
                🔄 Reset
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setShowSolution(!showSolution)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  showSolution
                    ? 'text-white bg-green-600 hover:bg-green-700'
                    : 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100'
                )}
              >
                {showSolution ? '✅ Solution Shown' : '👁️ Show Solution'}
              </button>
            </div>

            {/* Hints */}
            {showHints && revealedHints > 0 && (
              <div className="p-4 space-y-2 border-t border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">
                {challenge.hints.slice(0, revealedHints).map((hint, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 font-bold">Hint {i + 1}:</span>
                    <span className="text-gray-700 dark:text-gray-300">{hint}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Solution */}
            {showSolution && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-green-50 dark:bg-green-900/10">
                  <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-3">Reference Solution</h4>
                  <CodeBlock code={challenge.solutionCode} language="java" title="Solution" />

                  <div className="mt-4 space-y-2">
                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Validation Checklist:</h5>
                    {challenge.validationChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500">✓</span>
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RefactoringChallenge
