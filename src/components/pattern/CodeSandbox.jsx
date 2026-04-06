import { useState, useCallback, lazy, Suspense } from 'react'
import { Play, RotateCcw, Loader2, Terminal, Beaker, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const JUDGE0_API = 'https://ce.judge0.com'
const LANG_CONFIG = {
  java: { langId: 91, monacoLang: 'java', label: 'Java', color: 'bg-orange-600' },
  cpp: { langId: 105, monacoLang: 'cpp', label: 'C++', color: 'bg-blue-600' },
  kotlin: { langId: 111, monacoLang: 'kotlin', label: 'Kotlin', color: 'bg-purple-600' },
}

function TestCasePanel({ testCases, results }) {
  return (
    <div className="space-y-2">
      {testCases.map((tc, i) => {
        const result = results?.[i]
        const passed = result?.passed
        const icon = result === undefined ? '⬜' : passed ? '✅' : '❌'

        return (
          <div
            key={i}
            className={clsx(
              'p-3 rounded-lg border text-sm transition-colors',
              result === undefined
                ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                : passed
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{icon}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{tc.name}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{tc.description}</p>
            {result && !passed && (
              <div className="mt-2 ml-6 p-2 rounded bg-red-100 dark:bg-red-900/20 text-xs font-mono text-red-700 dark:text-red-400">
                Expected output to contain: "{tc.expectedOutput}"
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExperimentPrompt({ experiment, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-3 rounded-lg border-2 transition-all',
        isActive
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/15 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 bg-white dark:bg-gray-800'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{experiment.icon || '🧪'}</span>
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{experiment.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{experiment.prompt}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
      </div>
    </button>
  )
}

function CodeSandbox({ sandbox }) {
  const [activeTemplate, setActiveTemplate] = useState(0)
  const [activeLang, setActiveLang] = useState('java')
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [activeExperiment, setActiveExperiment] = useState(null)
  const [initialized, setInitialized] = useState(false)

  if (!sandbox?.templates?.length) return null

  const template = sandbox.templates[activeTemplate]
  const langCode = template.starterCode?.[activeLang]
  const testCases = template.testCases || []

  // Initialize code on first render or template change
  if (!initialized || code === '') {
    if (langCode && code !== langCode) {
      setCode(langCode)
      setInitialized(true)
      setOutput(null)
      setTestResults(null)
    }
  }

  const switchTemplate = (idx) => {
    const newTemplate = sandbox.templates[idx]
    const newCode = newTemplate.starterCode?.[activeLang] || newTemplate.starterCode?.java || ''
    setActiveTemplate(idx)
    setCode(newCode)
    setOutput(null)
    setTestResults(null)
    setActiveExperiment(null)
  }

  const switchLang = (lang) => {
    const newCode = template.starterCode?.[lang]
    if (newCode) {
      setActiveLang(lang)
      setCode(newCode)
      setOutput(null)
      setTestResults(null)
    }
  }

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setOutput(null)
    setTestResults(null)

    const config = LANG_CONFIG[activeLang]
    try {
      const response = await fetch(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language_id: config.langId,
            source_code: code,
          }),
        }
      )

      if (!response.ok) throw new Error(`API returned ${response.status}`)

      const data = await response.json()
      const status = data.status?.id

      if (status === 3) {
        const stdout = data.stdout || '(No output)'
        setOutput({ type: 'success', text: stdout, time: data.time, memory: data.memory })

        // Run test validation against stdout
        if (testCases.length > 0) {
          const results = testCases.map(tc => ({
            passed: stdout.includes(tc.expectedOutput),
          }))
          setTestResults(results)
        }
      } else if (status === 6) {
        setOutput({ type: 'error', text: data.compile_output || 'Compilation failed' })
      } else if (status === 5) {
        setOutput({ type: 'error', text: 'Time Limit Exceeded. Check for infinite loops.' })
      } else {
        setOutput({
          type: 'error',
          text: (data.stdout ? data.stdout + '\n' : '') + (data.stderr || data.compile_output || `Failed: ${data.status?.description}`),
        })
      }
    } catch (err) {
      setOutput({ type: 'error', text: 'Could not reach execution server. Check internet connection.' })
    } finally {
      setIsRunning(false)
    }
  }, [code, activeLang, testCases])

  const handleReset = () => {
    setCode(langCode || '')
    setOutput(null)
    setTestResults(null)
  }

  const passedCount = testResults ? testResults.filter(r => r.passed).length : 0
  const allPassed = testResults && passedCount === testCases.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🧪</span>
          {sandbox.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sandbox.subtitle}</p>
      </div>

      {/* Template Selector */}
      <div className="flex flex-wrap gap-2">
        {sandbox.templates.map((t, i) => (
          <button
            key={t.id}
            onClick={() => switchTemplate(i)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
              activeTemplate === i
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-300'
            )}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Template Description */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300">{template.description}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Editor + Output (2/3) */}
        <div className="xl:col-span-2 space-y-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              {Object.entries(LANG_CONFIG).map(([lang, cfg]) => {
                const hasCode = !!template.starterCode?.[lang]
                return (
                  <button
                    key={lang}
                    onClick={() => hasCode && switchLang(lang)}
                    disabled={!hasCode}
                    className={clsx(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                      !hasCode && 'opacity-30 cursor-not-allowed',
                      activeLang === lang
                        ? `${cfg.color} text-white`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all',
                  isRunning
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-wait'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
                )}
              >
                {isRunning ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                ) : (
                  <><Play className="w-3.5 h-3.5" /> Run Code</>
                )}
              </button>
            </div>
          </div>

          {/* Monaco */}
          <Suspense fallback={
            <div className="h-[420px] flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading editor...
            </div>
          }>
            <MonacoEditor
              height="420px"
              language={LANG_CONFIG[activeLang]?.monacoLang || 'java'}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 12, bottom: 12 },
                wordWrap: 'on',
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </Suspense>

          {/* Output */}
          {output && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Output</span>
                  {output.type === 'success' && <span className="w-2 h-2 rounded-full bg-green-500" />}
                  {output.type === 'error' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
                {output.time && (
                  <span className="text-xs text-gray-500">{output.time}s | {Math.round((output.memory || 0) / 1024)}MB</span>
                )}
              </div>
              <div className={clsx(
                'px-4 py-3 font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto',
                output.type === 'error' ? 'bg-red-950 text-red-300' : 'bg-gray-900 text-green-300'
              )}>
                {output.text}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Tests + Experiments (1/3) */}
        <div className="space-y-6">
          {/* Test Cases */}
          {testCases.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Beaker className="w-4 h-4" />
                  Test Cases
                </h3>
                {testResults && (
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    allPassed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  )}>
                    {passedCount}/{testCases.length} passed
                  </span>
                )}
              </div>
              <TestCasePanel testCases={testCases} results={testResults} />
            </div>
          )}

          {/* Experiment Prompts */}
          {template.experiments && template.experiments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                🧪 Try These Experiments
              </h3>
              <div className="space-y-2">
                {template.experiments.map((exp, i) => (
                  <ExperimentPrompt
                    key={i}
                    experiment={exp}
                    isActive={activeExperiment === i}
                    onClick={() => setActiveExperiment(activeExperiment === i ? null : i)}
                  />
                ))}
              </div>

              {/* Expanded experiment hint */}
              {activeExperiment !== null && template.experiments[activeExperiment]?.hint && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 animate-fade-in">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    💡 <strong>Hint:</strong> {template.experiments[activeExperiment].hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* All tests passed celebration */}
          {allPassed && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-center">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-2">All tests passed!</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">Try the experiments to deepen your understanding.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeSandbox
