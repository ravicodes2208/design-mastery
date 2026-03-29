import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Filter } from 'lucide-react'
import QuestionCard from '../components/practice/QuestionCard'
import clsx from 'clsx'

// Import topic data
import classesData from '../data/topics/fundamentals/classes.json'

const topicDataMap = {
  'fundamentals': {
    'classes': classesData
  }
}

function PracticePage() {
  const { phase, topicId } = useParams()
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  const topicData = topicDataMap[phase]?.[topicId]

  if (!topicData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Coming Soon!
        </h2>
        <Link
          to="/topic/fundamentals/classes"
          className="text-primary-600 hover:text-primary-700"
        >
          Go to Classes
        </Link>
      </div>
    )
  }

  // Collect all questions from all levels
  const allQuestions = [
    ...(topicData.levels.basic.practiceQuestions || []),
    ...(topicData.levels.intermediate.practiceQuestions || []),
    ...(topicData.levels.advanced.practiceQuestions || [])
  ]

  const filteredQuestions = difficultyFilter === 'all'
    ? allQuestions
    : allQuestions.filter(q => q.difficulty === difficultyFilter)

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/topic/${phase}/${topicId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {topicData.title}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          🏋️ Practice: {topicData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {allQuestions.length} practice questions across all difficulty levels
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          Filter by:
        </div>
        <div className="flex gap-2">
          {['all', 'basic', 'intermediate', 'advanced'].map((filter) => (
            <button
              key={filter}
              onClick={() => setDifficultyFilter(filter)}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize',
                difficultyFilter === filter
                  ? filter === 'all'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : filter === 'basic'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : filter === 'intermediate'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {filter} ({filter === 'all' ? allQuestions.length : allQuestions.filter(q => q.difficulty === filter).length})
            </button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {filteredQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No questions found for this filter.
          </div>
        )}
      </div>
    </div>
  )
}

export default PracticePage
