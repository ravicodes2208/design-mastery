import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { Play, RotateCcw, Loader2, Terminal, Beaker, ChevronRight, Zap, Sparkles, Maximize2, Minimize2, X } from 'lucide-react'
import clsx from 'clsx'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const JUDGE0_API = 'https://ce.judge0.com'
const LANG_CONFIG = {
  java: { langId: 91, monacoLang: 'java', label: 'Java', ext: '.java', color: 'bg-orange-600', icon: '☕' },
  cpp: { langId: 105, monacoLang: 'cpp', label: 'C++', ext: '.cpp', color: 'bg-blue-600', icon: '⚡' },
  kotlin: { langId: 111, monacoLang: 'kotlin', label: 'Kotlin', ext: '.kt', color: 'bg-purple-600', icon: '🟣' },
}

// ── Design Pattern Autocomplete Snippets ──────────────────────────────────
const JAVA_SNIPPETS = [
  { label: 'factory-method', kind: 'Snippet', insertText: 'public static ${1:Product} create(String type) {\n    switch (type.toLowerCase()) {\n        case "${2:type1}": return new ${3:ConcreteProduct1}();\n        case "${4:type2}": return new ${5:ConcreteProduct2}();\n        default: throw new IllegalArgumentException("Unknown: " + type);\n    }\n}', documentation: 'Factory method with switch dispatch' },
  { label: 'registry-map', kind: 'Snippet', insertText: 'private static final Map<String, Supplier<${1:Product}>> registry = new HashMap<>();\n\nstatic {\n    registry.put("${2:type1}", ${3:ConcreteProduct1}::new);\n    registry.put("${4:type2}", ${5:ConcreteProduct2}::new);\n}\n\npublic static ${1:Product} create(String type) {\n    Supplier<${1:Product}> creator = registry.get(type);\n    if (creator == null) throw new IllegalArgumentException("Unknown: " + type);\n    return creator.get();\n}', documentation: 'Registry-based factory with Map<String, Supplier>' },
  { label: 'interface', kind: 'Snippet', insertText: 'interface ${1:Name} {\n    ${2:void method}(${3:params});\n}', documentation: 'Java interface declaration' },
  { label: 'implements-class', kind: 'Snippet', insertText: 'class ${1:ClassName} implements ${2:Interface} {\n    @Override\n    public ${3:void} ${4:method}(${5:params}) {\n        ${6:// implementation}\n    }\n}', documentation: 'Class implementing an interface' },
  { label: 'singleton', kind: 'Snippet', insertText: 'class ${1:Singleton} {\n    private static volatile ${1:Singleton} instance;\n    private ${1:Singleton}() {}\n\n    public static ${1:Singleton} getInstance() {\n        if (instance == null) {\n            synchronized (${1:Singleton}.class) {\n                if (instance == null) {\n                    instance = new ${1:Singleton}();\n                }\n            }\n        }\n        return instance;\n    }\n}', documentation: 'Thread-safe double-checked locking singleton' },
  { label: 'abstract-factory', kind: 'Snippet', insertText: 'interface ${1:AbstractFactory} {\n    ${2:ProductA} create${2:ProductA}();\n    ${3:ProductB} create${3:ProductB}();\n}\n\nclass ${4:ConcreteFactory} implements ${1:AbstractFactory} {\n    public ${2:ProductA} create${2:ProductA}() { return new ${5:ConcreteA}(); }\n    public ${3:ProductB} create${3:ProductB}() { return new ${6:ConcreteB}(); }\n}', documentation: 'Abstract factory pattern' },
  { label: 'sysout', kind: 'Snippet', insertText: 'System.out.println(${1:""});', documentation: 'System.out.println()' },
  { label: 'main', kind: 'Snippet', insertText: 'public static void main(String[] args) {\n    ${1}\n}', documentation: 'Main method' },
  { label: 'for-each', kind: 'Snippet', insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n    ${4}\n}', documentation: 'Enhanced for loop' },
  { label: 'try-catch', kind: 'Snippet', insertText: 'try {\n    ${1}\n} catch (${2:Exception} e) {\n    ${3:e.printStackTrace();}\n}', documentation: 'Try-catch block' },
  { label: 'lambda-supplier', kind: 'Snippet', insertText: '() -> new ${1:ClassName}()', documentation: 'Supplier lambda' },
  { label: 'map-init', kind: 'Snippet', insertText: 'Map<${1:String}, ${2:Object}> ${3:map} = new HashMap<>();\n${3:map}.put(${4:key}, ${5:value});', documentation: 'HashMap initialization' },
]

const CPP_SNIPPETS = [
  { label: 'factory-method', kind: 'Snippet', insertText: 'static std::unique_ptr<${1:Product}> create(const std::string& type) {\n    if (type == "${2:type1}") return std::make_unique<${3:Concrete1}>();\n    if (type == "${4:type2}") return std::make_unique<${5:Concrete2}>();\n    throw std::invalid_argument("Unknown: " + type);\n}', documentation: 'Factory method with unique_ptr' },
  { label: 'registry-map', kind: 'Snippet', insertText: 'using Creator = std::function<std::unique_ptr<${1:Product}>()>;\nstatic std::map<std::string, Creator>& getRegistry() {\n    static std::map<std::string, Creator> registry;\n    return registry;\n}\n\nstatic void registerType(const std::string& type, Creator creator) {\n    getRegistry()[type] = std::move(creator);\n}\n\nstatic std::unique_ptr<${1:Product}> create(const std::string& type) {\n    auto it = getRegistry().find(type);\n    if (it == getRegistry().end()) throw std::invalid_argument("Unknown: " + type);\n    return it->second();\n}', documentation: 'Registry factory with std::map and std::function' },
  { label: 'abstract-class', kind: 'Snippet', insertText: 'class ${1:Base} {\npublic:\n    virtual ~${1:Base}() = default;\n    virtual ${2:void} ${3:method}(${4}) = 0;\n};', documentation: 'Abstract base class with pure virtual' },
  { label: 'derived-class', kind: 'Snippet', insertText: 'class ${1:Derived} : public ${2:Base} {\npublic:\n    ${3:void} ${4:method}(${5}) override {\n        ${6:// implementation}\n    }\n};', documentation: 'Derived class with override' },
  { label: 'unique-ptr', kind: 'Snippet', insertText: 'std::unique_ptr<${1:Type}> ${2:ptr} = std::make_unique<${3:ConcreteType}>(${4});', documentation: 'unique_ptr with make_unique' },
  { label: 'shared-ptr', kind: 'Snippet', insertText: 'std::shared_ptr<${1:Type}> ${2:ptr} = std::make_shared<${3:ConcreteType}>(${4});', documentation: 'shared_ptr with make_shared' },
  { label: 'cout', kind: 'Snippet', insertText: 'std::cout << ${1:""} << std::endl;', documentation: 'std::cout print' },
  { label: 'lambda', kind: 'Snippet', insertText: '[${1}](${2}) {\n    ${3}\n}', documentation: 'Lambda expression' },
  { label: 'for-range', kind: 'Snippet', insertText: 'for (const auto& ${1:item} : ${2:container}) {\n    ${3}\n}', documentation: 'Range-based for loop' },
  { label: 'map-insert', kind: 'Snippet', insertText: 'std::map<${1:std::string}, ${2:int}> ${3:m};\n${3:m}[${4:key}] = ${5:value};', documentation: 'std::map insert' },
]

const KOTLIN_SNIPPETS = [
  { label: 'factory-when', kind: 'Snippet', insertText: 'fun create(type: String): ${1:Product} = when (type.lowercase()) {\n    "${2:type1}" -> ${3:Concrete1}()\n    "${4:type2}" -> ${5:Concrete2}()\n    else -> throw IllegalArgumentException("Unknown: $type")\n}', documentation: 'Factory method with when expression' },
  { label: 'registry-map', kind: 'Snippet', insertText: 'private val registry = mutableMapOf<String, () -> ${1:Product}>(\n    "${2:type1}" to ::${3:Concrete1},\n    "${4:type2}" to ::${5:Concrete2}\n)\n\nfun create(type: String): ${1:Product} =\n    registry[type.lowercase()]?.invoke()\n        ?: throw IllegalArgumentException("Unknown: $type. Available: ${registry.keys}")', documentation: 'Registry factory with Kotlin map' },
  { label: 'data-class', kind: 'Snippet', insertText: 'data class ${1:Name}(\n    val ${2:field1}: ${3:String},\n    val ${4:field2}: ${5:Int}\n)', documentation: 'Kotlin data class' },
  { label: 'sealed-class', kind: 'Snippet', insertText: 'sealed class ${1:Result} {\n    data class Success(val ${2:data}: ${3:String}) : ${1:Result}()\n    data class Error(val message: String) : ${1:Result}()\n}', documentation: 'Sealed class for type-safe results' },
  { label: 'object-singleton', kind: 'Snippet', insertText: 'object ${1:Singleton} {\n    ${2:fun doSomething() {\n        // implementation\n    }}\n}', documentation: 'Kotlin object singleton' },
  { label: 'companion-factory', kind: 'Snippet', insertText: 'companion object {\n    fun create(${1:type}: String): ${2:Product} {\n        ${3}\n    }\n}', documentation: 'Companion object factory' },
  { label: 'println', kind: 'Snippet', insertText: 'println(${1:""})', documentation: 'println()' },
  { label: 'interface', kind: 'Snippet', insertText: 'interface ${1:Name} {\n    fun ${2:method}(${3:params}): ${4:Unit}\n}', documentation: 'Kotlin interface' },
  { label: 'lambda', kind: 'Snippet', insertText: '{ ${1:param} -> ${2:body} }', documentation: 'Lambda expression' },
  { label: 'when-expr', kind: 'Snippet', insertText: 'when (${1:value}) {\n    ${2:condition} -> ${3:result}\n    else -> ${4:default}\n}', documentation: 'When expression' },
  { label: 'extension-fun', kind: 'Snippet', insertText: 'fun ${1:Type}.${2:name}(${3}): ${4:Unit} {\n    ${5}\n}', documentation: 'Extension function' },
]

const SNIPPETS_BY_LANG = {
  java: JAVA_SNIPPETS,
  cpp: CPP_SNIPPETS,
  kotlin: KOTLIN_SNIPPETS,
}

// ── Register Autocomplete Provider with Monaco ────────────────────────────
function registerCompletionProvider(monaco, language, snippets) {
  return monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions = snippets.map((s) => ({
        label: s.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: s.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: s.documentation,
        range,
      }))

      return { suggestions }
    },
  })
}

// ── Sub-components ────────────────────────────────────────────────────────
function TestCasePanel({ testCases, results }) {
  return (
    <div className="space-y-2">
      {testCases.map((tc, i) => {
        const result = results?.[i]
        const passed = result?.passed
        const icon = result === undefined ? '⬜' : passed ? '✅' : '❌'

        return (
          <div
            key={i}
            className={clsx(
              'p-3 rounded-lg border text-sm transition-colors',
              result === undefined
                ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                : passed
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{icon}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{tc.name}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{tc.description}</p>
            {result && !passed && (
              <div className="mt-2 ml-6 p-2 rounded bg-red-100 dark:bg-red-900/20 text-xs font-mono text-red-700 dark:text-red-400">
                Expected output to contain: &quot;{tc.expectedOutput}&quot;
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExperimentPrompt({ experiment, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-3 rounded-lg border-2 transition-all',
        isActive
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/15 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 bg-white dark:bg-gray-800'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{experiment.icon || '🧪'}</span>
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{experiment.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{experiment.prompt}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
      </div>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
function CodeSandbox({ sandbox }) {
  const [activeTemplate, setActiveTemplate] = useState(0)
  const [activeLang, setActiveLang] = useState('java')
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [activeExperiment, setActiveExperiment] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [executionCount, setExecutionCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editorRef = useRef(null)
  const disposablesRef = useRef([])

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  if (!sandbox?.templates?.length) return null

  const template = sandbox.templates[activeTemplate]
  const langCode = template.starterCode?.[activeLang]
  const testCases = template.testCases || []

  // Available languages for this template
  const availableLangs = Object.keys(LANG_CONFIG).filter(
    (lang) => !!template.starterCode?.[lang]
  )

  // Initialize code on first render or template change
  if (!initialized || code === '') {
    if (langCode && code !== langCode) {
      setCode(langCode)
      setInitialized(true)
      setOutput(null)
      setTestResults(null)
    }
  }

  const switchTemplate = (idx) => {
    const newTemplate = sandbox.templates[idx]
    const newCode = newTemplate.starterCode?.[activeLang] || newTemplate.starterCode?.java || ''
    setActiveTemplate(idx)
    setCode(newCode)
    setOutput(null)
    setTestResults(null)
    setActiveExperiment(null)
    setExecutionCount(0)
  }

  const switchLang = (lang) => {
    const newCode = template.starterCode?.[lang]
    if (newCode) {
      setActiveLang(lang)
      setCode(newCode)
      setOutput(null)
      setTestResults(null)
      setExecutionCount(0)
    }
  }

  // ── Monaco onMount — configure IntelliSense ────────────────────────────
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor

    // Dispose previous providers
    disposablesRef.current.forEach((d) => d.dispose())
    disposablesRef.current = []

    // Register snippet providers for all languages
    Object.entries(SNIPPETS_BY_LANG).forEach(([lang, snippets]) => {
      const monacoLang = LANG_CONFIG[lang]?.monacoLang
      if (monacoLang) {
        const disposable = registerCompletionProvider(monaco, monacoLang, snippets)
        disposablesRef.current.push(disposable)
      }
    })

    // Configure editor settings for better autocomplete
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      wordBasedSuggestions: 'currentDocument',
      parameterHints: { enabled: true },
      suggest: {
        showSnippets: true,
        showKeywords: true,
        showClasses: true,
        showInterfaces: true,
        showMethods: true,
        showFunctions: true,
        showVariables: true,
        snippetsPreventQuickSuggestions: false,
        localityBonus: true,
        shareSuggestSelections: true,
        filterGraceful: true,
        preview: true,
      },
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'advanced',
      formatOnPaste: true,
      formatOnType: true,
    })

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Prevent browser save dialog, format code instead
      editor.getAction('editor.action.formatDocument')?.run()
    })

    editor.focus()
  }, [])

  // ── Run Code via Judge0 ─────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setOutput(null)
    setTestResults(null)

    const config = LANG_CONFIG[activeLang]
    try {
      const response = await fetch(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language_id: config.langId,
            source_code: code,
          }),
        }
      )

      if (!response.ok) throw new Error(`API returned ${response.status}`)

      const data = await response.json()
      const status = data.status?.id

      if (status === 3) {
        const stdout = data.stdout || '(No output)'
        setOutput({ type: 'success', text: stdout, time: data.time, memory: data.memory })

        // Run test validation against stdout
        if (testCases.length > 0) {
          const results = testCases.map(tc => ({
            passed: stdout.includes(tc.expectedOutput),
          }))
          setTestResults(results)
        }
        setExecutionCount((c) => c + 1)
      } else if (status === 6) {
        setOutput({ type: 'error', text: data.compile_output || 'Compilation failed' })
      } else if (status === 5) {
        setOutput({ type: 'error', text: 'Time Limit Exceeded. Check for infinite loops.' })
      } else {
        setOutput({
          type: 'error',
          text: (data.stdout ? data.stdout + '\n' : '') + (data.stderr || data.compile_output || `Failed: ${data.status?.description}`),
        })
      }
    } catch (err) {
      setOutput({ type: 'error', text: 'Could not reach execution server. Check internet connection.' })
    } finally {
      setIsRunning(false)
    }
  }, [code, activeLang, testCases])

  const handleReset = () => {
    setCode(langCode || '')
    setOutput(null)
    setTestResults(null)
    setExecutionCount(0)
    editorRef.current?.focus()
  }

  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run()
  }

  const passedCount = testResults ? testResults.filter(r => r.passed).length : 0
  const allPassed = testResults && passedCount === testCases.length

  const editorHeight = isFullscreen ? 'calc(100vh - 220px)' : '450px'

  return (
    <>
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsFullscreen(false)} />
      )}

      <div className={clsx(
        'space-y-6 transition-all duration-300',
        isFullscreen && 'fixed inset-4 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto'
      )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            {sandbox.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sandbox.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Keyboard shortcuts hint */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[10px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[10px]">Enter</kbd>
              <span className="ml-1">Run</span>
            </div>
            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[10px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[10px]">Space</kbd>
              <span className="ml-1">Autocomplete</span>
            </div>
          </div>
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all',
              isFullscreen
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-600'
            )}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen mode'}
          >
            {isFullscreen ? (
              <><Minimize2 className="w-4 h-4" /> Exit</>
            ) : (
              <><Maximize2 className="w-4 h-4" /> Fullscreen</>
            )}
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="flex flex-wrap gap-2">
        {sandbox.templates.map((t, i) => (
          <button
            key={t.id}
            onClick={() => switchTemplate(i)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
              activeTemplate === i
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-300'
            )}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Template Description */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300">{template.description}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Editor + Output (2/3) */}
        <div className="xl:col-span-2 space-y-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5">
              {/* Language Toggle */}
              {Object.entries(LANG_CONFIG).map(([lang, cfg]) => {
                const hasCode = availableLangs.includes(lang)
                return (
                  <button
                    key={lang}
                    onClick={() => hasCode && switchLang(lang)}
                    disabled={!hasCode}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      !hasCode && 'opacity-25 cursor-not-allowed',
                      activeLang === lang
                        ? `${cfg.color} text-white shadow-sm`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Execution count */}
              {executionCount > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {executionCount} run{executionCount !== 1 ? 's' : ''}
                </span>
              )}
              <button
                onClick={handleFormat}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Format code (Ctrl+S)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Format
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                  isRunning
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-wait'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
                )}
              >
                {isRunning ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                ) : (
                  <><Play className="w-3.5 h-3.5" /> Run Code</>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <Suspense fallback={
            <div className={clsx('flex items-center justify-center bg-gray-900 text-gray-400 text-sm', isFullscreen ? 'h-[calc(100vh-220px)]' : 'h-[450px]')}>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading editor...
            </div>
          }>
            <MonacoEditor
              height={editorHeight}
              language={LANG_CONFIG[activeLang]?.monacoLang || 'java'}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                minimap: { enabled: isFullscreen },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 12, bottom: 12 },
                wordWrap: 'on',
                tabSize: 4,
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                autoIndent: 'advanced',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false,
                },
                parameterHints: { enabled: true },
                suggest: {
                  showSnippets: true,
                  showKeywords: true,
                  showClasses: true,
                  showInterfaces: true,
                  showMethods: true,
                  showFunctions: true,
                  showVariables: true,
                  snippetsPreventQuickSuggestions: false,
                  localityBonus: true,
                  preview: true,
                },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                matchBrackets: 'always',
                guides: {
                  bracketPairs: true,
                  indentation: true,
                },
              }}
            />
          </Suspense>

          {/* Output */}
          {output && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Output</span>
                  {output.type === 'success' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                  {output.type === 'error' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
                {output.time && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>⏱ {output.time}s</span>
                    <span>💾 {Math.round((output.memory || 0) / 1024)}MB</span>
                  </div>
                )}
              </div>
              <div className={clsx(
                'px-4 py-3 font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto',
                output.type === 'error' ? 'bg-red-950 text-red-300' : 'bg-gray-900 text-green-300'
              )}>
                {output.text}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Tests + Experiments (1/3) */}
        <div className="space-y-6">
          {/* Test Cases */}
          {testCases.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Beaker className="w-4 h-4" />
                  Test Cases
                </h3>
                {testResults && (
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    allPassed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  )}>
                    {passedCount}/{testCases.length} passed
                  </span>
                )}
              </div>
              <TestCasePanel testCases={testCases} results={testResults} />
            </div>
          )}

          {/* Language Info Card */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{LANG_CONFIG[activeLang]?.icon}</span>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {LANG_CONFIG[activeLang]?.label} Snippets
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Type these triggers and press <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[10px] font-mono">Tab</kbd> to expand:
            </p>
            <div className="flex flex-wrap gap-1">
              {(SNIPPETS_BY_LANG[activeLang] || []).slice(0, 6).map((s) => (
                <span
                  key={s.label}
                  className="inline-block px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300"
                  title={s.documentation}
                >
                  {s.label}
                </span>
              ))}
              {(SNIPPETS_BY_LANG[activeLang] || []).length > 6 && (
                <span className="text-xs text-gray-400">
                  +{(SNIPPETS_BY_LANG[activeLang] || []).length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Experiment Prompts */}
          {template.experiments && template.experiments.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                🧪 Try These Experiments
              </h3>
              <div className="space-y-2">
                {template.experiments.map((exp, i) => (
                  <ExperimentPrompt
                    key={i}
                    experiment={exp}
                    isActive={activeExperiment === i}
                    onClick={() => setActiveExperiment(activeExperiment === i ? null : i)}
                  />
                ))}
              </div>

              {/* Expanded experiment hint */}
              {activeExperiment !== null && template.experiments[activeExperiment]?.hint && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 animate-fade-in">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    💡 <strong>Hint:</strong> {template.experiments[activeExperiment].hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* All tests passed celebration */}
          {allPassed && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-center">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-2">All tests passed!</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                {availableLangs.length > 1
                  ? `Try it in ${availableLangs.filter(l => l !== activeLang).map(l => LANG_CONFIG[l].label).join(' or ')} next!`
                  : 'Try the experiments to deepen your understanding.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default CodeSandbox
