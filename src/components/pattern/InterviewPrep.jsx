import { useState } from 'react'
import CodeBlock from '../common/CodeBlock'
import clsx from 'clsx'

function StepCard({ step, stepIndex, isActive, isCompleted, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all',
        isActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
          : isCompleted
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300'
      )}
    >
      <div className="flex items-center gap-2">
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
          isActive
            ? 'bg-primary-600 text-white'
            : isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        )}>
          {isCompleted ? '✓' : stepIndex + 1}
        </div>
        <span className={clsx(
          'text-sm font-medium',
          isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
        )}>
          {step.phase}
        </span>
      </div>
    </button>
  )
}

function InterviewPrep({ interview }) {
  const [activeScenario, setActiveScenario] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [revealedAnswer, setRevealedAnswer] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  if (!interview?.scenarios?.length) return null

  const scenario = interview.scenarios[activeScenario]
  const step = scenario.steps[activeStep]

  const revealAndComplete = () => {
    setRevealedAnswer(true)
    setCompletedSteps(prev => new Set([...prev, step.id]))
  }

  const goToStep = (idx) => {
    setActiveStep(idx)
    setRevealedAnswer(completedSteps.has(scenario.steps[idx]?.id))
  }

  const nextStep = () => {
    if (activeStep < scenario.steps.length - 1) {
      goToStep(activeStep + 1)
    }
  }

  const isAllComplete = scenario.steps.every(s => completedSteps.has(s.id))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          {interview.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{interview.subtitle}</p>
      </div>

      {/* Scenario Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
            INTERVIEW SCENARIO
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
            Interview Stages
          </h4>
          {scenario.steps.map((s, i) => (
            <StepCard
              key={s.id}
              step={s}
              stepIndex={i}
              isActive={activeStep === i}
              isCompleted={completedSteps.has(s.id)}
              onClick={() => goToStep(i)}
            />
          ))}

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
        </div>

        {/* Step Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Phase Header */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              Phase {activeStep + 1}
            </span>
            <h3 className="font-bold text-gray-900 dark:text-white">{step.phase}</h3>
          </div>

          {/* Interviewer Question */}
          <div className="flex gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm flex-shrink-0">
              🧑‍💼
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">INTERVIEWER</span>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                "{step.interviewer}"
              </p>
            </div>
          </div>

          {/* Think First Prompt / Answer */}
          {!revealedAnswer ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  🤔 Think about your answer first...
                </p>
                <button
                  onClick={revealAndComplete}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Reveal Strong Answer →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Good Answer */}
              <div className="flex gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm flex-shrink-0">
                  ✅
                </div>
                <div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">STRONG ANSWER</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                    {step.goodAnswer}
                  </p>
                </div>
              </div>

              {/* Code if present */}
              {step.code && (
                <CodeBlock code={step.code} language="java" title="Code shown to interviewer" />
              )}

              {/* Key Insight */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                <span className="text-blue-500 flex-shrink-0">💡</span>
                <p className="text-sm text-blue-800 dark:text-blue-300">{step.keyInsight}</p>
              </div>

              {/* Red Flag */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                <span className="text-red-500 flex-shrink-0">🚩</span>
                <p className="text-sm text-red-800 dark:text-red-300"><strong>Red Flag:</strong> {step.redFlag}</p>
              </div>

              {/* Next Button */}
              {activeStep < scenario.steps.length - 1 && (
                <button
                  onClick={nextStep}
                  className="w-full py-3 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Next Phase →
                </button>
              )}
            </div>
          )}

          {/* Summary */}
          {isAllComplete && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎉</span>
                <h4 className="font-bold text-green-700 dark:text-green-400">Interview Complete!</h4>
              </div>
              <p className="text-sm text-green-800 dark:text-green-300">{scenario.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InterviewPrep
