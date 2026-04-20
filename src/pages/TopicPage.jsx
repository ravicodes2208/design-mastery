import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, CheckCircle, ArrowRight, BookOpen, Code, GitCompare, HelpCircle } from 'lucide-react'
import ConceptCard from '../components/content/ConceptCard'
import CodeComparison from '../components/content/CodeComparison'
import ComparisonTable from '../components/content/ComparisonTable'
import QuestionCard from '../components/practice/QuestionCard'
import { useProgress } from '../context/ProgressContext'
import clsx from 'clsx'

// Import topic data
import classesData from '../data/topics/fundamentals/classes.json'
import commandData from '../data/topics/design-patterns/command.json'

// Topic data mapping (design patterns use PatternPage instead)
const topicDataMap = {
  'fundamentals': {
    'classes': classesData
  },
  'design-patterns': {
    'command': commandData
  }
}

const difficultyTabs = [
  { id: 'basic', label: 'Basic', color: 'green' },
  { id: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { id: 'advanced', label: 'Advanced', color: 'red' }
]

function TopicPage() {
  const { phase, topicId } = useParams()
  const { progress, markTopicComplete, setLastVisited } = useProgress()
  const [activeLevel, setActiveLevel] = useState('basic')
  const [activeSection, setActiveSection] = useState('concepts')

  // Get topic data
  const topicData = topicDataMap[phase]?.[topicId]

  useEffect(() => {
    if (topicId) {
      setLastVisited(topicId)
    }
  }, [topicId, setLastVisited])

  if (!topicData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Coming Soon!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This topic is under construction. Start with the Classes topic!
        </p>
        <Link
          to="/topic/fundamentals/classes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          Go to Classes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const currentLevel = topicData.levels[activeLevel]
  const isCompleted = progress.completedTopics.includes(topicId)

  return (
    <div className="max-w-5xl mx-auto pt-4 pb-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span className="capitalize">{phase}</span>
              <span>/</span>
              <span>{topicData.title}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-4xl">{topicData.icon}</span>
              {topicData.title}
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

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {topicData.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {topicData.estimatedTime}
          </span>
        </div>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {difficultyTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLevel(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              activeLevel === tab.id
                ? tab.color === 'green'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : tab.color === 'yellow'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setActiveSection('concepts')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            activeSection === 'concepts'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Concepts
        </button>
        <button
          onClick={() => setActiveSection('code')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            activeSection === 'code'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <Code className="w-4 h-4" />
          Code Examples
        </button>
        <button
          onClick={() => setActiveSection('comparison')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            activeSection === 'comparison'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <GitCompare className="w-4 h-4" />
          Comparison
        </button>
        <button
          onClick={() => setActiveSection('practice')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            activeSection === 'practice'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <HelpCircle className="w-4 h-4" />
          Practice ({currentLevel.practiceQuestions?.length || 0})
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 animate-fade-in">
        {/* Concepts Section */}
        {activeSection === 'concepts' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📖 {currentLevel.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentLevel.description}
            </p>
            <div className="space-y-4">
              {currentLevel.concepts?.map((concept, index) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  isExpanded={index === 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Code Examples Section */}
        {activeSection === 'code' && currentLevel.cppCode && currentLevel.javaCode && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              💻 Code Examples
            </h2>
            <CodeComparison
              cppCode={currentLevel.cppCode}
              javaCode={currentLevel.javaCode}
            />
          </div>
        )}

        {/* Comparison Section */}
        {activeSection === 'comparison' && currentLevel.comparison && (
          <div className="space-y-6">
            <ComparisonTable comparisons={currentLevel.comparison} />

            {/* Key Differences */}
            {topicData.keyDifferences && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔑 Key Differences Summary
                </h3>
                <div className="grid gap-4">
                  {topicData.keyDifferences.map((diff, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {diff.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-cpp font-medium">C++: </span>
                          <span className="text-gray-600 dark:text-gray-400">{diff.cpp}</span>
                        </div>
                        <div>
                          <span className="text-java font-medium">Java: </span>
                          <span className="text-gray-600 dark:text-gray-400">{diff.java}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practice Section */}
        {activeSection === 'practice' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🏋️ Practice Questions - {currentLevel.title}
            </h2>
            {currentLevel.practiceQuestions?.length > 0 ? (
              <div className="space-y-6">
                {currentLevel.practiceQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No practice questions available for this level yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Best Practices & Common Mistakes */}
      {activeSection === 'concepts' && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Practices */}
          {topicData.bestPractices && (
            <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                ✅ Best Practices
              </h3>
              <ul className="space-y-2">
                {topicData.bestPractices.map((practice, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-300 flex gap-2">
                    <span>•</span>
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {topicData.commonMistakes && (
            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                ⚠️ Common Mistakes
              </h3>
              <ul className="space-y-3">
                {topicData.commonMistakes.map((mistake, index) => (
                  <li key={index} className="text-sm">
                    <div className="text-red-700 dark:text-red-300">
                      ❌ {mistake.mistake}
                    </div>
                    <div className="text-green-700 dark:text-green-300 mt-1">
                      ✓ {mistake.correct}
                    </div>
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

export default TopicPage
