import { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'

// Spaced repetition intervals (in terms of "sessions")
const SR_INTERVALS = { easy: 3, medium: 2, hard: 1 }

function getStorageKey(patternId) {
  return `flashcards-${patternId || 'global'}`
}

function loadProgress(patternId) {
  try {
    const raw = localStorage.getItem(getStorageKey(patternId))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveProgress(patternId, progress) {
  try {
    localStorage.setItem(getStorageKey(patternId), JSON.stringify(progress))
  } catch { /* storage full */ }
}

function FlashcardStack({ cards, patternId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [swipeDir, setSwipeDir] = useState(null)
  const [progress, setProgress] = useState(() => loadProgress(patternId))
  const [sessionResults, setSessionResults] = useState({ know: 0, review: 0, total: cards.length })
  const cardRef = useRef(null)
  const touchStartRef = useRef(null)

  const currentCard = cards[currentIndex]
  const isComplete = currentIndex >= cards.length

  useEffect(() => {
    saveProgress(patternId, progress)
  }, [progress, patternId])

  const markCard = useCallback((result) => {
    setSwipeDir(result === 'know' ? 'right' : 'left')

    const cardId = currentCard.id
    const prev = progress[cardId] || { streak: 0, nextReview: 0, totalReviews: 0 }
    const newProgress = {
      ...progress,
      [cardId]: {
        streak: result === 'know' ? prev.streak + 1 : 0,
        nextReview: Date.now() + SR_INTERVALS[result === 'know' ? 'easy' : 'hard'] * 86400000,
        totalReviews: prev.totalReviews + 1,
        lastResult: result,
      }
    }
    setProgress(newProgress)
    setSessionResults(prev => ({
      ...prev,
      [result]: prev[result] + 1
    }))

    setTimeout(() => {
      setSwipeDir(null)
      setIsFlipped(false)
      setCurrentIndex(prev => prev + 1)
    }, 300)
  }, [currentCard, progress])

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !isFlipped) return
    const diff = e.changedTouches[0].clientX - touchStartRef.current
    if (Math.abs(diff) > 60) {
      markCard(diff > 0 ? 'know' : 'review')
    }
    touchStartRef.current = null
  }

  // Keyboard
  useEffect(() => {
    const handler = (e) => {
      if (isComplete) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!isFlipped) setIsFlipped(true)
        else return
      }
      if (isFlipped) {
        if (e.key === 'ArrowRight' || e.key === 'k') markCard('know')
        else if (e.key === 'ArrowLeft' || e.key === 'r') markCard('review')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFlipped, isComplete, markCard])

  if (isComplete) {
    const pct = Math.round((sessionResults.know / sessionResults.total) * 100)
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <span className="text-5xl">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Complete!</h3>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-green-600 dark:text-green-400 font-medium">
            ✓ Know: {sessionResults.know}
          </span>
          <span className="text-red-500 dark:text-red-400 font-medium">
            ✗ Review: {sessionResults.review}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Score: {pct}%
          </span>
        </div>
        <button
          onClick={() => {
            setCurrentIndex(0)
            setIsFlipped(false)
            setSessionResults({ know: 0, review: 0, total: cards.length })
          }}
          className="mt-4 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          🔄 Study Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Progress */}
      <div className="w-full max-w-md flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => !isFlipped && setIsFlipped(true)}
        className={clsx(
          'relative w-full max-w-md h-64 cursor-pointer select-none',
          'transition-transform duration-300',
          swipeDir === 'right' && 'translate-x-[120%] rotate-12 opacity-0',
          swipeDir === 'left' && '-translate-x-[120%] -rotate-12 opacity-0',
        )}
        style={{ perspective: '1000px' }}
      >
        <div
          className={clsx(
            'absolute inset-0 transition-transform duration-500',
            '[transform-style:preserve-3d]',
            isFlipped && '[transform:rotateY(180deg)]'
          )}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col items-center justify-center shadow-lg">
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-bold mb-4',
              currentCard.difficulty === 'easy' && 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
              currentCard.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
              currentCard.difficulty === 'hard' && 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
            )}>
              {currentCard.difficulty}
            </span>
            <p className="text-center text-gray-900 dark:text-white font-medium leading-relaxed">
              {currentCard.front}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-2 border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 p-6 flex flex-col justify-center shadow-lg">
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (visible when flipped) */}
      {isFlipped && (
        <div className="flex items-center gap-4 animate-fade-in">
          <button
            onClick={() => markCard('review')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors"
          >
            ← Review Later
          </button>
          <button
            onClick={() => markCard('know')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors"
          >
            Got It! →
          </button>
        </div>
      )}

      {/* Keyboard Hint */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        ⌨️ Space = flip · → = know · ← = review
      </p>
    </div>
  )
}

function Flashcards({ flashcards }) {
  const [activeDeck, setActiveDeck] = useState(null)

  if (!flashcards?.decks?.length) return null

  const deck = activeDeck !== null ? flashcards.decks[activeDeck] : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {flashcards.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{flashcards.subtitle}</p>
      </div>

      {/* Deck Selector */}
      {activeDeck === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {flashcards.decks.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveDeck(i)}
              className="text-left p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{d.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white">{d.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {d.cards.length} cards
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setActiveDeck(null)}
            className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ← Back to Decks
          </button>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">{deck.icon}</span>
            <h3 className="font-bold text-gray-900 dark:text-white">{deck.title}</h3>
            <span className="text-xs text-gray-400 ml-2">{deck.cards.length} cards</span>
          </div>
          <FlashcardStack
            key={deck.id}
            cards={deck.cards}
            patternId={deck.id}
          />
        </div>
      )}
    </div>
  )
}

export default Flashcards
