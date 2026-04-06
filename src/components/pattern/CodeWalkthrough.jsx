import { useState } from 'react'
import InteractiveEditor from './InteractiveEditor'
import clsx from 'clsx'

const languages = [
  { id: 'java', label: 'Java', color: 'bg-java' },
  { id: 'cpp', label: 'C++', color: 'bg-cpp' },
  { id: 'kotlin', label: 'Kotlin', color: 'bg-purple-600' }
]

function CodeWalkthrough({ codeImplementation, codeFactoryMethod, codeAbstractFactory }) {
  const [activeLang, setActiveLang] = useState('java')
  const [activeStep, setActiveStep] = useState(null)
  const [activeFlavor, setActiveFlavor] = useState('simple')

  if (!codeImplementation) return null

  // Build flavors array dynamically from available data
  const flavors = [
    { id: 'simple', label: 'Simple Factory + Registry', icon: '\u{1F3ED}', data: codeImplementation },
    codeFactoryMethod && { id: 'factory-method', label: 'Factory Method', icon: '\u{1F527}', data: codeFactoryMethod },
    codeAbstractFactory && { id: 'abstract-factory', label: 'Abstract Factory', icon: '\u{1F3D7}\uFE0F', data: codeAbstractFactory },
  ].filter(Boolean)

  const hasFlavors = flavors.length > 1
  const activeFlavorData = flavors.find(f => f.id === activeFlavor)?.data || codeImplementation
  const currentCode = activeFlavorData[activeLang]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Step-by-Step Code Build
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Edit the code and hit Run to see it execute in real time.
        </p>
      </div>

      {/* Flavor Selector -- only shows when pattern has multiple code flavors */}
      {hasFlavors && (
        <div className="flex flex-wrap gap-2">
          {flavors.map((flavor) => (
            <button
              key={flavor.id}
              onClick={() => {
                setActiveFlavor(flavor.id)
                setActiveStep(null)
                setActiveLang('java')
              }}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2',
                activeFlavor === flavor.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-600'
              )}
            >
              <span className="text-lg">{flavor.icon}</span>
              {flavor.label}
            </button>
          ))}
        </div>
      )}

      {/* Build Steps */}
      {activeFlavorData.steps && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeFlavorData.steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(activeStep === s.step ? null : s.step)}
              className={clsx(
                'text-left rounded-lg border p-3 transition-all',
                activeStep === s.step
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  activeStep === s.step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}>
                  {s.step}
                </span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{s.title}</span>
              </div>
              {activeStep === s.step && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 animate-fade-in">
                  {s.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Language Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Language:</span>
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          {languages.map((lang) => {
            const hasCode = !!activeFlavorData[lang.id]
            return (
              <button
                key={lang.id}
                onClick={() => hasCode && setActiveLang(lang.id)}
                disabled={!hasCode}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded-md transition-colors font-medium',
                  !hasCode && 'opacity-40 cursor-not-allowed',
                  activeLang === lang.id
                    ? `${lang.color} text-white`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {lang.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Interactive Editor */}
      {currentCode && (
        <InteractiveEditor
          key={`${activeFlavor}-${activeLang}`}
          code={currentCode.code}
          language={activeLang}
          title={currentCode.title}
          explanation={currentCode.explanation}
        />
      )}
    </div>
  )
}

export default CodeWalkthrough
