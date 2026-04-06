import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import clsx from 'clsx'

// Lazy-load both heavy libraries
const Excalidraw = lazy(async () => {
  const mod = await import('@excalidraw/excalidraw')
  return { default: mod.Excalidraw }
})

let mermaidInstance = null
async function getMermaid() {
  if (!mermaidInstance) {
    const m = await import('mermaid')
    mermaidInstance = m.default
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      },
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
      fontSize: 13,
    })
  }
  return mermaidInstance
}

// ─── Mermaid Live Editor ─────────────────────────────────────
function MermaidLiveEditor({ templates }) {
  const [code, setCode] = useState('')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)
  const [activeTemplate, setActiveTemplate] = useState(null)
  const debounceRef = useRef(null)

  // Auto-render on code change (debounced)
  useEffect(() => {
    if (!code.trim()) {
      setSvg('')
      setError(null)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const mermaid = await getMermaid()
        const id = `live-${Date.now()}`
        const { svg: rendered } = await mermaid.render(id, code)
        setSvg(rendered)
        setError(null)
      } catch (err) {
        setError(err.message?.split('\n')[0] || 'Syntax error')
      }
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [code])

  const loadTemplate = (tmpl) => {
    setCode(tmpl.code)
    setActiveTemplate(tmpl.id)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Template Selector */}
      {templates && templates.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Templates:</span>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                activeTemplate === t.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Split View */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        {/* Editor */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">MERMAID SYNTAX</span>
            {error && <span className="text-xs text-red-500 truncate ml-2">{error}</span>}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Type Mermaid syntax here...\n\nExample:\nclassDiagram\n    class Notification {\n        <<interface>>\n        +send(msg: String) void\n    }`}
            className="flex-1 p-3 bg-gray-900 text-green-300 font-mono text-sm resize-none focus:outline-none placeholder-gray-600"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">LIVE PREVIEW</span>
          </div>
          <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-auto p-4">
            {svg ? (
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <p className="text-gray-600 text-sm text-center">
                Type Mermaid syntax or pick a template to see the diagram
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Excalidraw Whiteboard ──────────────────────────────────
function WhiteboardEditor() {
  return (
    <div className="h-full">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center bg-white text-gray-500 text-sm">
          Loading whiteboard...
        </div>
      }>
        <Excalidraw
          theme="dark"
          UIOptions={{
            canvasActions: {
              export: { saveFileToDisk: true },
              loadScene: false,
              clearCanvas: true,
            },
          }}
          initialData={{
            appState: {
              viewBackgroundColor: '#1a1a2e',
              currentItemFontFamily: 3,
              gridSize: 20,
            },
          }}
        />
      </Suspense>
    </div>
  )
}

// ─── Main DiagramEditor Component ────────────────────────────
function DiagramEditor({ diagramPractice }) {
  const [mode, setMode] = useState('mermaid') // 'mermaid' | 'whiteboard'

  const templates = diagramPractice?.templates || []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">✏️</span>
          Diagram Practice
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Practice drawing UML diagrams. Use Mermaid for precise syntax or the Whiteboard for freeform sketching.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setMode('mermaid')}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              mode === 'mermaid'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            )}
          >
            📐 Mermaid UML
          </button>
          <button
            onClick={() => setMode('whiteboard')}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              mode === 'whiteboard'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            )}
          >
            🎨 Whiteboard
          </button>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {mode === 'mermaid'
            ? 'Type Mermaid syntax on the left, see live UML on the right'
            : 'Freeform drawing — practice interview whiteboarding'}
        </span>
      </div>

      {/* Editor Area */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: '600px' }}>
        {mode === 'mermaid' ? (
          <MermaidLiveEditor templates={templates} />
        ) : (
          <WhiteboardEditor />
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mode === 'mermaid' ? (
          <>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Class Diagram Syntax</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">{`classDiagram
    class ClassName {
        <<interface>>
        +publicMethod() ReturnType
        -privateField: Type
    }
    ParentClass <|-- ChildClass
    ClassA ..> ClassB : uses`}</pre>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Sequence Diagram Syntax</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">{`sequenceDiagram
    participant C as Client
    participant F as Factory
    C->>F: create("email")
    F-->>C: EmailNotification
    Note over C,F: Client uses interface`}</pre>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Interview Drawing Tips</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Start with interfaces at the top. Draw concrete classes below. Use arrows for relationships. Label everything. Keep it clean — interviewers value clarity over detail.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">What to Draw for Factory</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                1. Product interface (Notification) 2. Concrete products (Email, SMS, Push) 3. Factory class with create() 4. Client that uses Factory. Show the arrow from Factory to each product.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DiagramEditor
