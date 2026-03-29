import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, CheckCircle, Circle, Code2, Layers, Shield, Puzzle, Layout, Cloud } from 'lucide-react'
import { useProgress } from '../../context/ProgressContext'
import clsx from 'clsx'

const phases = [
  {
    id: 'fundamentals',
    title: 'Language Fundamentals',
    icon: Code2,
    color: 'blue',
    topics: [
      { id: 'classes', title: 'Classes & Objects', icon: '📦' },
      { id: 'constructors', title: 'Constructors & Destructors', icon: '🔨' },
      { id: 'access-modifiers', title: 'Access Modifiers', icon: '🔐' },
      { id: 'static-members', title: 'Static Members', icon: '📌' },
      { id: 'memory-management', title: 'Memory Management', icon: '💾' },
      { id: 'exception-handling', title: 'Exception Handling', icon: '⚠️' },
    ]
  },
  {
    id: 'oops',
    title: 'OOPs Concepts',
    icon: Layers,
    color: 'purple',
    topics: [
      { id: 'encapsulation', title: 'Encapsulation', icon: '📦' },
      { id: 'inheritance', title: 'Inheritance', icon: '🧬' },
      { id: 'polymorphism', title: 'Polymorphism', icon: '🎭' },
      { id: 'abstraction', title: 'Abstraction', icon: '🎨' },
      { id: 'composition', title: 'Composition vs Inheritance', icon: '🔗' },
    ]
  },
  {
    id: 'solid',
    title: 'SOLID Principles',
    icon: Shield,
    color: 'green',
    topics: [
      { id: 'srp', title: 'Single Responsibility (SRP)', icon: '1️⃣' },
      { id: 'ocp', title: 'Open/Closed (OCP)', icon: '🚪' },
      { id: 'lsp', title: 'Liskov Substitution (LSP)', icon: '🔄' },
      { id: 'isp', title: 'Interface Segregation (ISP)', icon: '✂️' },
      { id: 'dip', title: 'Dependency Inversion (DIP)', icon: '⬆️' },
    ]
  },
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    icon: Puzzle,
    color: 'orange',
    topics: [
      { id: 'singleton', title: 'Singleton Pattern', icon: '1️⃣' },
      { id: 'factory', title: 'Factory Pattern', icon: '🏭' },
      { id: 'builder', title: 'Builder Pattern', icon: '🏗️' },
      { id: 'observer', title: 'Observer Pattern', icon: '👁️' },
      { id: 'strategy', title: 'Strategy Pattern', icon: '♟️' },
      { id: 'decorator', title: 'Decorator Pattern', icon: '🎀' },
      { id: 'adapter', title: 'Adapter Pattern', icon: '🔌' },
      { id: 'facade', title: 'Facade Pattern', icon: '🏛️' },
    ]
  },
  {
    id: 'lld',
    title: 'Low-Level Design',
    icon: Layout,
    color: 'pink',
    topics: [
      { id: 'parking-lot', title: 'Parking Lot System', icon: '🅿️' },
      { id: 'library-system', title: 'Library Management', icon: '📚' },
      { id: 'elevator-system', title: 'Elevator System', icon: '🛗' },
      { id: 'chess-game', title: 'Chess Game', icon: '♟️' },
      { id: 'atm-machine', title: 'ATM Machine', icon: '🏧' },
    ]
  },
  {
    id: 'hld',
    title: 'High-Level Design',
    icon: Cloud,
    color: 'cyan',
    topics: [
      { id: 'url-shortener', title: 'URL Shortener', icon: '🔗' },
      { id: 'twitter-design', title: 'Twitter/X Design', icon: '🐦' },
      { id: 'chat-system', title: 'Chat System', icon: '💬' },
      { id: 'video-streaming', title: 'Video Streaming', icon: '📺' },
      { id: 'e-commerce', title: 'E-Commerce Platform', icon: '🛒' },
    ]
  },
]

const colorClasses = {
  blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  pink: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
  cyan: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
}

function Sidebar() {
  const location = useLocation()
  const { progress } = useProgress()
  const [expandedPhases, setExpandedPhases] = useState(['fundamentals'])

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    )
  }

  const isTopicActive = (phaseId, topicId) => {
    return location.pathname.includes(`/topic/${phaseId}/${topicId}`)
  }

  const isTopicCompleted = (topicId) => {
    return progress.completedTopics.includes(topicId)
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Learning Path
        </h2>

        <nav className="space-y-2">
          {phases.map((phase) => {
            const Icon = phase.icon
            const isExpanded = expandedPhases.includes(phase.id)
            const completedInPhase = phase.topics.filter(t => isTopicCompleted(t.id)).length

            return (
              <div key={phase.id}>
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isExpanded && colorClasses[phase.color]
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    {phase.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {completedInPhase}/{phase.topics.length}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Topics */}
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                    {phase.topics.map((topic) => (
                      <Link
                        key={topic.id}
                        to={`/topic/${phase.id}/${topic.id}`}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          isTopicActive(phase.id, topic.id)
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        <span className="text-base">{topic.icon}</span>
                        <span className="flex-1 truncate">{topic.title}</span>
                        {isTopicCompleted(topic.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
