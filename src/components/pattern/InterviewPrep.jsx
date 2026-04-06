import { useState, useEffect, useRef, useCallback } from 'react'
import CodeBlock from '../common/CodeBlock'
import clsx from 'clsx'

// ─── Timer Hook ──────────────────────────────────────────────
function useTimer(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, seconds])

  useEffect(() => {
    if (seconds === 0) setRunning(false)
  }, [seconds])

  const start = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = (s) => { setSeconds(s); setRunning(false) }

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${minutes}:${secs.toString().padStart(2, '0')}`
  const pct = (seconds / initialSeconds) * 100

  return { seconds, display, pct, running, start, pause, reset }
}

// ─── Self-Rating Component ──────────────────────────────────
function SelfRating({ onRate, currentRating }) {
  const ratings = [
    { value: 'weak', label: 'Weak', emoji: '😬', color: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400', activeColor: 'border-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500/30' },
    { value: 'ok', label: 'OK', emoji: '😐', color: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', activeColor: 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40 ring-2 ring-yellow-500/30' },
    { value: 'strong', label: 'Strong', emoji: '💪', color: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400', activeColor: 'border-green-500 bg-green-100 dark:bg-green-900/40 ring-2 ring-green-500/30' },
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">How'd you do?</span>
      {ratings.map(r => (
        <button
          key={r.value}
          onClick={() => onRate(r.value)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all',
            currentRating === r.value ? r.activeColor : r.color,
          )}
        >
          <span>{r.emoji}</span>
          {r.label}
        </button>
      ))}
    </div>
  )
}

// ─── Scorecard ───────────────────────────────────────────────
function Scorecard({ scenario, ratings, userAnswers }) {
  const scores = { weak: 0, ok: 1, strong: 2 }
  const total = scenario.steps.length * 2
  const earned = scenario.steps.reduce((sum, s) => sum + (scores[ratings[s.id]] || 0), 0)
  const pct = Math.round((earned / total) * 100)

  const grade = pct >= 80 ? { label: 'Strong Hire', emoji: '🟢', color: 'text-green-600 dark:text-green-400' }
    : pct >= 50 ? { label: 'Lean Hire', emoji: '🟡', color: 'text-yellow-600 dark:text-yellow-400' }
    : { label: 'Needs Work', emoji: '🔴', color: 'text-red-600 dark:text-red-400' }

  const strengths = scenario.steps.filter(s => ratings[s.id] === 'strong')
  const weaknesses = scenario.steps.filter(s => ratings[s.id] === 'weak')

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white space-y-6">
      <div className="text-center">
        <span className="text-4xl">{grade.emoji}</span>
        <h3 className="text-2xl font-bold mt-2">{grade.label}</h3>
        <p className="text-gray-400 text-sm mt-1">Score: {earned}/{total} ({pct}%)</p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {scenario.steps.map(s => {
          const r = ratings[s.id] || 'weak'
          const bg = r === 'strong' ? 'bg-green-500/20 border-green-500/40' : r === 'ok' ? 'bg-yellow-500/20 border-yellow-500/40' : 'bg-red-500/20 border-red-500/40'
          return (
            <div key={s.id} className={clsx('rounded-lg border p-2 text-center', bg)}>
              <div className="text-xs text-gray-400">{s.phase.split(' ').slice(0, 2).join(' ')}</div>
              <div className="text-lg mt-1">{r === 'strong' ? '💪' : r === 'ok' ? '😐' : '😬'}</div>
            </div>
          )
        })}
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-green-400 mb-2">Strengths</h4>
          <ul className="space-y-1">
            {strengths.map(s => (
              <li key={s.id} className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-green-400">+</span> {s.phase}: {s.keyInsight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-red-400 mb-2">Areas to Improve</h4>
          <ul className="space-y-1">
            {weaknesses.map(s => (
              <li key={s.id} className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-red-400">-</span> {s.phase}: {s.keyInsight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-300 italic">{scenario.summary}</p>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────
function InterviewPrep({ interview }) {
  const [activeScenario, setActiveScenario] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [mode, setMode] = useState('prep') // 'prep' | 'answering' | 'revealed' | 'scorecard'
  const [userAnswers, setUserAnswers] = useState({})
  const [ratings, setRatings] = useState({})
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [notes, setNotes] = useState('')
  const textareaRef = useRef(null)

  const timer = useTimer(120) // 2 min per phase

  if (!interview?.scenarios?.length) return null

  const scenario = interview.scenarios[activeScenario]
  const step = scenario.steps[activeStep]

  const startAnswering = () => {
    setMode('answering')
    timer.reset(120)
    timer.start()
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const submitAnswer = () => {
    timer.pause()
    setMode('revealed')
    setCompletedSteps(prev => new Set([...prev, step.id]))
  }

  const rateAndNext = (rating) => {
    setRatings(prev => ({ ...prev, [step.id]: rating }))

    // Auto-advance after rating
    if (activeStep < scenario.steps.length - 1) {
      setTimeout(() => {
        setActiveStep(activeStep + 1)
        setMode('prep')
        setShowFollowUp(false)
        timer.reset(120)
      }, 400)
    } else {
      // Last step — show scorecard
      setTimeout(() => setMode('scorecard'), 400)
    }
  }

  const goToStep = (idx) => {
    setActiveStep(idx)
    const stepId = scenario.steps[idx]?.id
    if (completedSteps.has(stepId)) {
      setMode('revealed')
    } else {
      setMode('prep')
    }
    setShowFollowUp(false)
    timer.reset(120)
  }

  const resetInterview = () => {
    setActiveStep(0)
    setMode('prep')
    setUserAnswers({})
    setRatings({})
    setCompletedSteps(new Set())
    setShowFollowUp(false)
    timer.reset(120)
  }

  const switchScenario = (idx) => {
    setActiveScenario(idx)
    resetInterview()
  }

  const isAllComplete = scenario.steps.every(s => completedSteps.has(s.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🎤</span>
            {interview.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{interview.subtitle}</p>
        </div>
        {mode !== 'scorecard' && (
          <button
            onClick={() => { if (isAllComplete) setMode('scorecard') }}
            disabled={!isAllComplete}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
              isAllComplete
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            )}
          >
            View Scorecard
          </button>
        )}
      </div>

      {/* Scenario Selector (if multiple) */}
      {interview.scenarios.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {interview.scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => switchScenario(i)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                activeScenario === i
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Scorecard Mode */}
      {mode === 'scorecard' ? (
        <div className="space-y-4">
          <Scorecard scenario={scenario} ratings={ratings} userAnswers={userAnswers} />
          <button
            onClick={resetInterview}
            className="w-full py-3 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            🔄 Retry Interview
          </button>
        </div>
      ) : (
        <>
          {/* Scenario Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                SCENARIO {activeScenario + 1}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {scenario.steps.length} PHASES
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">{scenario.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{scenario.context}</p>
            <blockquote className="border-l-4 border-primary-500 pl-4 py-2 text-gray-200 italic text-sm leading-relaxed bg-gray-800/50 rounded-r-lg pr-4">
              "{scenario.interviewerPrompt}"
            </blockquote>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Step Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Phases
              </h4>
              {scenario.steps.map((s, i) => {
                const rating = ratings[s.id]
                const isActive = activeStep === i
                const isDone = completedSteps.has(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => goToStep(i)}
                    className={clsx(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      isActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                        : isDone
                          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        isActive ? 'bg-primary-600 text-white'
                          : isDone ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      )}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <span className={clsx('text-sm font-medium flex-1', isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300')}>
                        {s.phase}
                      </span>
                      {rating && (
                        <span className="text-sm">
                          {rating === 'strong' ? '💪' : rating === 'ok' ? '😐' : '😬'}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}

              {/* Progress */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{completedSteps.size}/{scenario.steps.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completedSteps.size / scenario.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Notes Scratchpad */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  📝 Scratchpad
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down thoughts, patterns you'd use, trade-offs..."
                  className="w-full h-24 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Phase Header + Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    Phase {activeStep + 1}/{scenario.steps.length}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white">{step.phase}</h3>
                </div>

                {/* Timer */}
                {mode === 'answering' && (
                  <div className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold border',
                    timer.seconds <= 30
                      ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 animate-pulse'
                      : timer.seconds <= 60
                        ? 'border-yellow-300 bg-yellow-50 text-yellow-600 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  )}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timer.display}
                  </div>
                )}
              </div>

              {/* Interviewer Question */}
              <div className="flex gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-lg flex-shrink-0">
                  🧑‍💼
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Interviewer</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                    "{step.interviewer}"
                  </p>
                </div>
              </div>

              {/* ─── PREP MODE ─── */}
              {mode === 'prep' && (
                <div className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center space-y-3">
                  <span className="text-3xl">🤔</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Take 2 minutes. Think about what you'd say. Then write your answer.
                  </p>
                  <button
                    onClick={startAnswering}
                    className="px-8 py-3 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    ⏱️ Start Timer & Write Answer
                  </button>
                </div>
              )}

              {/* ─── ANSWERING MODE ─── */}
              {mode === 'answering' && (
                <div className="space-y-3">
                  {/* Timer Bar */}
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-1000',
                        timer.seconds <= 30 ? 'bg-red-500' : timer.seconds <= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      )}
                      style={{ width: `${timer.pct}%` }}
                    />
                  </div>

                  {/* User answer textarea */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={userAnswers[step.id] || ''}
                      onChange={(e) => setUserAnswers(prev => ({ ...prev, [step.id]: e.target.value }))}
                      placeholder="Type your answer here... Think about: what pattern would you use? Why? What are the trade-offs? Show the interviewer you think deeply."
                      className="w-full h-40 p-4 rounded-xl border-2 border-primary-300 dark:border-primary-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {(userAnswers[step.id] || '').length} chars
                    </span>
                  </div>

                  <button
                    onClick={submitAnswer}
                    className="w-full py-3 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    ✅ Submit & See Strong Answer
                  </button>
                </div>
              )}

              {/* ─── REVEALED MODE ─── */}
              {mode === 'revealed' && (
                <div className="space-y-4 animate-fade-in">
                  {/* User's Answer (if they wrote one) */}
                  {userAnswers[step.id] && (
                    <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm flex-shrink-0">
                        🧑‍💻
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Your Answer</span>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed whitespace-pre-line">
                          {userAnswers[step.id]}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Strong Answer */}
                  <div className="flex gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm flex-shrink-0">
                      ✅
                    </div>
                    <div>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Strong Answer</span>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                        {step.goodAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Code */}
                  {step.code && (
                    <CodeBlock code={step.code} language="java" title="Code shown to interviewer" />
                  )}

                  {/* Follow-up Probes */}
                  {step.followUps && step.followUps.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowFollowUp(!showFollowUp)}
                        className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                      >
                        <span>{showFollowUp ? '▼' : '▶'}</span>
                        🔍 Follow-up Probes ({step.followUps.length})
                      </button>
                      {showFollowUp && (
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-primary-200 dark:border-primary-800 animate-fade-in">
                          {step.followUps.map((fu, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <span className="text-sm">🧑‍💼</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{fu.probe}"</p>
                              </div>
                              <div className="flex gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                                <span className="text-sm">💡</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{fu.strongResponse}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Insight */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-500 flex-shrink-0">💡</span>
                    <p className="text-sm text-blue-800 dark:text-blue-300"><strong>Key Insight:</strong> {step.keyInsight}</p>
                  </div>

                  {/* Red Flag */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <span className="text-red-500 flex-shrink-0">🚩</span>
                    <p className="text-sm text-red-800 dark:text-red-300"><strong>Red Flag:</strong> {step.redFlag}</p>
                  </div>

                  {/* Self-Rating */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <SelfRating
                      currentRating={ratings[step.id]}
                      onRate={(r) => rateAndNext(r)}
                    />
                    <p className="text-xs text-gray-400 mt-2">Rate yourself honestly — this builds your scorecard.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InterviewPrep
