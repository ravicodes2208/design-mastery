import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProgress } from '../context/ProgressContext'
import clsx from 'clsx'

// Pattern sub-components
import PatternHero from '../components/pattern/PatternHero'
import BrainTriggers from '../components/pattern/BrainTriggers'
import CodeWalkthrough from '../components/pattern/CodeWalkthrough'
import SolidConnections from '../components/pattern/SolidConnections'
import LLDProblems from '../components/pattern/LLDProblems'
import PatternWeb from '../components/pattern/PatternWeb'
import AntiPatterns from '../components/pattern/AntiPatterns'
import PatternQuiz from '../components/pattern/PatternQuiz'
import CheatSheet from '../components/pattern/CheatSheet'
import QuestionCard from '../components/practice/QuestionCard'

// Import pattern data
import strategyData from '../data/topics/design-patterns/strategy.json'
import factoryData from '../data/topics/design-patterns/factory.json'

// Pattern data registry
const patternDataMap = {
  'strategy': strategyData,
  'factory': factoryData
}

// Section navigation config
const sections = [
  { id: 'intuition', label: 'Intuition', icon: '🎯', num: 1 },
  { id: 'triggers', label: 'Brain Triggers', icon: '🧠', num: 2 },
  { id: 'code', label: 'Code Build', icon: '💻', num: 3 },
  { id: 'solid', label: 'SOLID', icon: '🔗', num: 4 },
  { id: 'lld', label: 'LLD Problems', icon: '🎯', num: 5 },
  { id: 'web', label: 'Pattern Web', icon: '🕸️', num: 6 },
  { id: 'antipatterns', label: 'Anti-Patterns', icon: '⚠️', num: 7 },
  { id: 'quiz', label: 'Quiz', icon: '📝', num: 8 },
  { id: 'practice', label: 'Practice', icon: '🏋️', num: 9 },
  { id: 'cheatsheet', label: 'Cheat Sheet', icon: '📋', num: 10 }
]

function PatternPage() {
  const { phase, topicId } = useParams()
  const { progress, markTopicComplete, setLastVisited } = useProgress()
  const [activeSection, setActiveSection] = useState('intuition')

  const patternData = patternDataMap[topicId]

  useEffect(() => {
    if (topicId) {
      setLastVisited(topicId)
    }
  }, [topicId, setLastVisited])

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])

  if (!patternData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Coming Soon!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This pattern is under construction. Check back soon!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          Go Home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const isCompleted = progress.completedTopics.includes(topicId)
  const currentIdx = sections.findIndex(s => s.id === activeSection)
  const prevSection = currentIdx > 0 ? sections[currentIdx - 1] : null
  const nextSection = currentIdx < sections.length - 1 ? sections[currentIdx + 1] : null

  // Render the active section content
  const renderSection = () => {
    switch (activeSection) {
      case 'intuition':
        return <PatternHero hook={patternData.hook} />
      case 'triggers':
        return <BrainTriggers brainTriggers={patternData.brainTriggers} />
      case 'code':
        return <CodeWalkthrough codeImplementation={patternData.codeImplementation} />
      case 'solid':
        return <SolidConnections solidConnections={patternData.solidConnections} />
      case 'lld':
        return <LLDProblems lldProblems={patternData.lldProblems} />
      case 'web':
        return <PatternWeb patternWeb={patternData.patternWeb} />
      case 'antipatterns':
        return <AntiPatterns antiPatterns={patternData.antiPatterns} />
      case 'quiz':
        return <PatternQuiz quiz={patternData.quiz} />
      case 'practice':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Practice Questions
            </h2>
            {patternData.practiceQuestions && patternData.practiceQuestions.length > 0 ? (
              <div className="space-y-6">
                {patternData.practiceQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No practice questions yet.
              </div>
            )}
          </div>
        )
      case 'cheatsheet':
        return (
          <CheatSheet
            cheatSheet={patternData.cheatSheet}
            bestPractices={patternData.bestPractices}
            commonMistakes={patternData.commonMistakes}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span className="capitalize">{phase?.replace('-', ' ')}</span>
              <span>/</span>
              <span>{patternData.title}</span>
              {patternData.category && (
                <>
                  <span>/</span>
                  <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                    {patternData.category}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-4xl">{patternData.icon}</span>
              {patternData.title}
            </h1>
          </div>
          <button
            onClick={() => markTopicComplete(topicId)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              isCompleted
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <CheckCircle className={clsx('w-5 h-5', isCompleted && 'text-green-500')} />
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{patternData.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {patternData.estimatedTime}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-6 px-6 py-3 mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeSection === section.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <span className="text-base">{section.icon}</span>
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex gap-0.5 mt-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={clsx(
                'h-1 flex-1 rounded-full transition-colors',
                sections.findIndex(s => s.id === section.id) <= currentIdx
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="animate-fade-in" key={activeSection}>
        {renderSection()}
      </div>

      {/* Prev / Next Navigation */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        {prevSection ? (
          <button
            onClick={() => setActiveSection(prevSection.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prevSection.icon} {prevSection.label}</span>
            <span className="sm:hidden">{prevSection.icon} Prev</span>
          </button>
        ) : (
          <div />
        )}

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {currentIdx + 1} / {sections.length}
        </span>

        {nextSection ? (
          <button
            onClick={() => setActiveSection(nextSection.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <span className="hidden sm:inline">{nextSection.label} {nextSection.icon}</span>
            <span className="sm:hidden">Next {nextSection.icon}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => markTopicComplete(topicId)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Pattern
          </button>
        )}
      </div>
    </div>
  )
}

export default PatternPage
