import { createContext, useContext, useState, useEffect } from 'react'

const ProgressContext = createContext()

const initialProgress = {
  completedTopics: [],
  completedQuestions: [],
  currentPhase: 'fundamentals',
  lastVisited: null
}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('learningProgress')
    return saved ? JSON.parse(saved) : initialProgress
  })

  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(progress))
  }, [progress])

  const markTopicComplete = (topicId) => {
    setProgress(prev => ({
      ...prev,
      completedTopics: [...new Set([...prev.completedTopics, topicId])]
    }))
  }

  const markQuestionComplete = (questionId) => {
    setProgress(prev => ({
      ...prev,
      completedQuestions: [...new Set([...prev.completedQuestions, questionId])]
    }))
  }

  const setLastVisited = (topicId) => {
    setProgress(prev => ({
      ...prev,
      lastVisited: topicId
    }))
  }

  const getProgressPercentage = (totalTopics) => {
    if (totalTopics === 0) return 0
    return Math.round((progress.completedTopics.length / totalTopics) * 100)
  }

  const resetProgress = () => {
    setProgress(initialProgress)
  }

  return (
    <ProgressContext.Provider value={{
      progress,
      markTopicComplete,
      markQuestionComplete,
      setLastVisited,
      getProgressPercentage,
      resetProgress
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
