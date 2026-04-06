import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Clock, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProgress } from '../context/ProgressContext'
import { loadPattern } from '../data/patterns/loader'
import clsx from 'clsx'

// Lazy-loaded section components (code-split per tab)
const sectionComponents = {
  intuition:    lazy(() => import('../components/pattern/PatternHero')),
  triggers:     lazy(() => import('../components/pattern/BrainTriggers')),
  explanation:  lazy(() => import('../components/pattern/PatternExplanation')),
  code:         lazy(() => import('../components/pattern/CodeWalkthrough')),
  diff:         lazy(() => import('../components/pattern/BeforeAfterDiff')),
  evolution:    lazy(() => import('../components/pattern/CodeEvolution')),
  diagrams:     lazy(() => import('../components/pattern/MermaidDiagrams')),
  realworld:    lazy(() => import('../components/pattern/RealWorldGallery')),
  challenge:    lazy(() => import('../components/pattern/RefactoringChallenge')),
  interview:    lazy(() => import('../components/pattern/InterviewPrep')),
  flashcards:   lazy(() => import('../components/pattern/Flashcards')),
  sandbox:      lazy(() => import('../components/pattern/CodeSandbox')),
  diagramdraw:  lazy(() => import('../components/pattern/DiagramEditor')),
  solid:        lazy(() => import('../components/pattern/SolidConnections')),
  lld:          lazy(() => import('../components/pattern/LLDProblems')),
  web:          lazy(() => import('../components/pattern/PatternWeb')),
  antipatterns: lazy(() => import('../components/pattern/AntiPatterns')),
  quiz:         lazy(() => import('../components/pattern/PatternQuiz')),
  cheatsheet:   lazy(() => import('../components/pattern/CheatSheet')),
}

// Grouped section definitions
const sectionGroups = [
  {
    id: 'learn',
    label: 'Learn',
    color: 'blue',
    sections: [
      { id: 'intuition', label: 'Intuition', icon: '🎯' },
      { id: 'triggers', label: 'Brain Triggers', icon: '🧠' },
      { id: 'explanation', label: 'Explanation', icon: '📖', requiresData: 'explanation' },
      { id: 'code', label: 'Code Build', icon: '💻' },
      { id: 'diff', label: 'Before/After', icon: '🔄', requiresData: 'diff' },
      { id: 'evolution', label: 'Evolution', icon: '⏳', requiresData: 'evolution' },
      { id: 'diagrams', label: 'UML Diagrams', icon: '📐', requiresData: 'diagrams' },
      { id: 'realworld', label: 'Real-World', icon: '🌍', requiresData: 'realworld' },
    ]
  },
  {
    id: 'practice',
    label: 'Practice',
    color: 'green',
    sections: [
      { id: 'challenge', label: 'Refactor Challenge', icon: '⚔️', requiresData: 'challenge' },
      { id: 'interview', label: 'Interview Prep', icon: '🎤', requiresData: 'interview' },
      { id: 'flashcards', label: 'Flashcards', icon: '🃏', requiresData: 'flashcards' },
      { id: 'sandbox', label: 'Code Sandbox', icon: '🧪', requiresData: 'sandbox' },
      { id: 'diagramdraw', label: 'Diagram Practice', icon: '✏️', requiresData: 'diagramPractice' },
      { id: 'quiz', label: 'Quiz', icon: '📝' },
      { id: 'practice', label: 'Practice', icon: '🏋️' },
    ]
  },
  {
    id: 'reference',
    label: 'Reference',
    color: 'purple',
    sections: [
      { id: 'solid', label: 'SOLID', icon: '🔗' },
      { id: 'lld', label: 'LLD Problems', icon: '🎯' },
      { id: 'web', label: 'Pattern Web', icon: '🕸️' },
      { id: 'antipatterns', label: 'Anti-Patterns', icon: '⚠️' },
      { id: 'deepthoughts', label: 'Deep Thoughts', icon: '🤔', requiresData: 'deepThoughtQuestions' },
      { id: 'cheatsheet', label: 'Cheat Sheet', icon: '📋' },
    ]
  }
]

// Props mapping: section ID -> props extractor from patternData
const sectionPropsMap = {
  intuition:    (d) => ({ hook: d.hook }),
  triggers:     (d) => ({ brainTriggers: d.brainTriggers }),
  explanation:  (d) => ({ explanation: d.explanation }),
  code:         (d) => ({ codeImplementation: d.codeImplementation, codeFactoryMethod: d.codeFactoryMethod, codeAbstractFactory: d.codeAbstractFactory }),
  diff:         (d) => ({ diff: d.diff }),
  evolution:    (d) => ({ evolution: d.evolution }),
  diagrams:     (d) => ({ diagrams: d.diagrams }),
  realworld:    (d) => ({ realworld: d.realworld }),
  challenge:    (d) => ({ challenge: d.challenge }),
  interview:    (d) => ({ interview: d.interview }),
  flashcards:   (d) => ({ flashcards: d.flashcards }),
  sandbox:      (d) => ({ sandbox: d.sandbox }),
  diagramdraw:  (d) => ({ diagramPractice: d.diagramPractice }),
  solid:        (d) => ({ solidConnections: d.solidConnections }),
  lld:          (d) => ({ lldProblems: d.lldProblems }),
  web:          (d) => ({ patternWeb: d.patternWeb }),
  antipatterns: (d) => ({ antiPatterns: d.antiPatterns }),
  quiz:         (d) => ({ quiz: d.quiz }),
  cheatsheet:   (d) => ({ cheatSheet: d.cheatSheet, bestPractices: d.bestPractices, commonMistakes: d.commonMistakes }),
}

// Inline components
import CodeBlock from '../components/common/CodeBlock'
import QuestionCard from '../components/practice/QuestionCard'

function DeepThoughtCard({ question }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <span className="text-lg mt-0.5">{isOpen ? '🔽' : '🤔'}</span>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-relaxed">{question.question}</h3>
        </div>
        <ChevronRight className={clsx('w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-0.5', isOpen && 'rotate-90')} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 ml-9 animate-fade-in">
          <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{question.answer}</p>
            {question.codeExample && <CodeBlock code={question.codeExample} language="java" compact />}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

const groupColors = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    activeBg: 'bg-blue-100 dark:bg-blue-900/30',
    dot: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    activeBg: 'bg-green-100 dark:bg-green-900/30',
    dot: 'bg-green-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-400',
    activeBg: 'bg-purple-100 dark:bg-purple-900/30',
    dot: 'bg-purple-500',
  },
}

function PatternPage() {
  const { phase, topicId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { progress, markTopicComplete, setLastVisited } = useProgress()
  const [patternData, setPatternData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const activeSection = searchParams.get('tab') || 'intuition'
  const setActiveSection = (sectionId) => {
    setSearchParams({ tab: sectionId }, { replace: true })
  }

  // Dynamic pattern loading
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    loadPattern(topicId)
      .then((data) => { if (!cancelled) { setPatternData(data); setLoading(false) } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [topicId])

  useEffect(() => {
    if (topicId) setLastVisited(topicId)
  }, [topicId, setLastVisited])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])

  if (loading) return <div className="max-w-5xl mx-auto pt-4 pb-16"><SectionSkeleton /></div>

  if (error || !patternData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {error ? 'Failed to Load' : 'Coming Soon!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'This pattern is under construction.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
          Go Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  // Filter groups/sections based on available data
  const filteredGroups = sectionGroups.map(group => ({
    ...group,
    sections: group.sections.filter(s => {
      if (!s.requiresData) return true
      const d = patternData[s.requiresData]
      if (Array.isArray(d)) return d.length > 0
      return d != null
    })
  })).filter(g => g.sections.length > 0)

  // Flat list for prev/next navigation
  const allSections = filteredGroups.flatMap(g => g.sections)
  const currentIdx = allSections.findIndex(s => s.id === activeSection)
  const prevSection = currentIdx > 0 ? allSections[currentIdx - 1] : null
  const nextSection = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null
  const activeGroup = filteredGroups.find(g => g.sections.some(s => s.id === activeSection))

  const isCompleted = progress.completedTopics.includes(topicId)

  // Render the active section
  const renderSection = () => {
    const LazyComponent = sectionComponents[activeSection]
    const propsExtractor = sectionPropsMap[activeSection]

    if (LazyComponent && propsExtractor) {
      return (
        <Suspense fallback={<SectionSkeleton />}>
          <LazyComponent {...propsExtractor(patternData)} />
        </Suspense>
      )
    }

    // Inline sections
    switch (activeSection) {
      case 'deepthoughts':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Deep Thought Questions</h2>
            <p className="text-gray-600 dark:text-gray-400">Hard-hitting questions that test true understanding. Click to reveal.</p>
            {patternData.deepThoughtQuestions?.length > 0 ? (
              <div className="space-y-4">
                {patternData.deepThoughtQuestions.map((dtq) => <DeepThoughtCard key={dtq.id} question={dtq} />)}
              </div>
            ) : <div className="text-center py-12 text-gray-500">No deep thought questions yet.</div>}
          </div>
        )
      case 'practice':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Practice Questions</h2>
            {patternData.practiceQuestions?.length > 0 ? (
              <div className="space-y-6">
                {patternData.practiceQuestions.map((q) => <QuestionCard key={q.id} question={q} />)}
              </div>
            ) : <div className="text-center py-12 text-gray-500">No practice questions yet.</div>}
          </div>
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
                  <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">{patternData.category}</span>
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
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            )}
          >
            <CheckCircle className={clsx('w-5 h-5', isCompleted && 'text-green-500')} />
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{patternData.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{patternData.estimatedTime}</span>
        </div>
      </div>

      {/* Grouped Tab Navigation */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-6 px-6 pt-3 pb-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          {filteredGroups.map((group) => {
            const colors = groupColors[group.color]
            const isActiveGroup = group.sections.some(s => s.id === activeSection)
            return (
              <div key={group.id} className="flex items-center gap-2">
                {/* Group Label */}
                <span className={clsx(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap',
                  colors.text,
                  isActiveGroup ? colors.bg : 'opacity-60'
                )}>
                  <span className={clsx('w-2 h-2 rounded-full', colors.dot)} />
                  {group.label}
                </span>

                {/* Section Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
                  {group.sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={clsx(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                        activeSection === section.id
                          ? clsx(colors.activeBg, colors.text, 'shadow-sm')
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700'
                      )}
                    >
                      <span className="text-sm">{section.icon}</span>
                      <span className="hidden sm:inline">{section.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="flex gap-0.5 mt-2">
          {allSections.map((section, i) => (
            <div
              key={section.id}
              className={clsx(
                'h-1 flex-1 rounded-full transition-colors',
                i <= currentIdx
                  ? activeGroup ? groupColors[activeGroup.color].dot : 'bg-primary-500'
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {prevSection.icon} {prevSection.label}
          </button>
        ) : <div />}

        <span className="text-xs text-gray-400">{currentIdx + 1} / {allSections.length}</span>

        {nextSection ? (
          <button
            onClick={() => setActiveSection(nextSection.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            {nextSection.label} {nextSection.icon}
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
