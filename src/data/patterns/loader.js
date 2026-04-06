

/**
 * Pattern Data Loader
 *
 * Dynamically imports split pattern data files instead of loading
 * one monolithic JSON. Code files are imported as raw strings via
 * Vite's ?raw suffix — giving us real .java/.cpp/.kt files with
 * full IDE support, clean git diffs, and zero JSON escaping.
 *
 * Usage:
 *   const data = await loadPattern('factory')
 *   // data.meta, data.hook, data.code, data.explanation, etc.
 */

// Vite glob imports for code files (eager: false = lazy chunks)
// ?raw gives us the file content as a string at build time
const codeFiles = import.meta.glob('./*/code/*.*', { query: '?raw', import: 'default' })

// Vite glob imports for JSON data files (lazy)
const jsonFiles = import.meta.glob('./*/*.json')

/**
 * Load a single code file by pattern + filename.
 * Returns the raw source code string.
 */
async function loadCodeFile(patternId, filename) {
  const key = `./${patternId}/code/${filename}`
  const loader = codeFiles[key]
  if (!loader) return null
  return loader()
}

/**
 * Load a JSON data file by pattern + filename.
 */
async function loadJsonFile(patternId, filename) {
  const key = `./${patternId}/${filename}`
  const loader = jsonFiles[key]
  if (!loader) return null
  const mod = await loader()
  return mod.default
}

/**
 * Load all data for a pattern. Returns a flat object matching
 * the shape that PatternPage and its sub-components expect.
 *
 * This is the PUBLIC API — components call this, not the internals.
 */
export async function loadPattern(patternId) {
  // Load meta + code-meta first (small files, needed to know structure)
  const [meta, codeMeta] = await Promise.all([
    loadJsonFile(patternId, 'meta.json'),
    loadJsonFile(patternId, 'code-meta.json')
  ])

  if (!meta) return null

  // Load all JSON sections in parallel
  const [
    hook,
    brainTriggers,
    solidConnections,
    lldProblems,
    patternWeb,
    antiPatterns,
    quiz,
    cheatSheetData,
    practiceQuestions,
    deepThoughtQuestions,
    explanation,
    diff,
    evolution,
    diagrams,
    challenge,
    interview,
    realworld,
    flashcards,
    sandbox
  ] = await Promise.all([
    loadJsonFile(patternId, 'hook.json'),
    loadJsonFile(patternId, 'triggers.json'),
    loadJsonFile(patternId, 'solid.json'),
    loadJsonFile(patternId, 'lld-problems.json'),
    loadJsonFile(patternId, 'pattern-web.json'),
    loadJsonFile(patternId, 'anti-patterns.json'),
    loadJsonFile(patternId, 'quiz.json'),
    loadJsonFile(patternId, 'cheat-sheet.json'),
    loadJsonFile(patternId, 'practice.json'),
    loadJsonFile(patternId, 'deep-thoughts.json'),
    loadJsonFile(patternId, 'explanation.json'),
    loadJsonFile(patternId, 'diff.json'),
    loadJsonFile(patternId, 'evolution.json'),
    loadJsonFile(patternId, 'diagrams.json'),
    loadJsonFile(patternId, 'challenge.json'),
    loadJsonFile(patternId, 'interview.json'),
    loadJsonFile(patternId, 'realworld.json'),
    loadJsonFile(patternId, 'flashcards.json'),
    loadJsonFile(patternId, 'sandbox.json')
  ])

  // Load all code files and assemble into the shape CodeWalkthrough expects:
  // { java: { code, title, explanation }, cpp: {...}, steps: [...] }
  const codeImplementations = {}

  if (codeMeta?.flavors) {
    const flavorEntries = Object.entries(codeMeta.flavors)
    const codeLoadPromises = []

    for (const [flavorId, flavor] of flavorEntries) {
      const langEntries = Object.entries(flavor.languages || {})
      for (const [lang, langMeta] of langEntries) {
        codeLoadPromises.push(
          loadCodeFile(patternId, langMeta.file).then(code => ({
            flavorId,
            lang,
            code,
            title: langMeta.title,
            explanation: langMeta.explanation
          }))
        )
      }
    }

    const codeResults = await Promise.all(codeLoadPromises)

    for (const [flavorId, flavor] of flavorEntries) {
      const flavorData = { steps: flavor.steps }
      for (const result of codeResults) {
        if (result.flavorId === flavorId && result.code) {
          flavorData[result.lang] = {
            code: result.code,
            title: result.title,
            explanation: result.explanation
          }
        }
      }
      codeImplementations[flavorId] = flavorData
    }
  }

  // Assemble the flat object matching the OLD monolithic shape.
  // This means existing components don't need to change their props.
  const result = {
    ...meta,
    hook,
    brainTriggers,
    solidConnections,
    lldProblems,
    patternWeb,
    antiPatterns,
    quiz,
    deepThoughtQuestions,
    explanation,
    practiceQuestions,
    // Spread cheat-sheet compound file
    cheatSheet: cheatSheetData?.cheatSheet,
    bestPractices: cheatSheetData?.bestPractices,
    commonMistakes: cheatSheetData?.commonMistakes,
    // Code — the first flavor is always 'simple' (the default implementation)
    codeImplementation: codeImplementations['simple'] || null,
    codeFactoryMethod: codeImplementations['factory-method'] || null,
    codeAbstractFactory: codeImplementations['abstract-factory'] || null,
    // New interactive features
    diff,
    evolution,
    diagrams,
    challenge,
    interview,
    realworld,
    flashcards,
    sandbox,
  }

  return result
}

/**
 * Load ONLY the meta.json for a pattern (for sidebar/listing).
 * Much cheaper than loading full pattern data.
 */
export async function loadPatternMeta(patternId) {
  return loadJsonFile(patternId, 'meta.json')
}

/**
 * Get list of available pattern IDs by scanning the directory.
 */
export function getAvailablePatterns() {
  const ids = new Set()
  for (const key of Object.keys(jsonFiles)) {
    // key format: ./factory/meta.json
    const match = key.match(/^\.\/([^/]+)\/meta\.json$/)
    if (match) ids.add(match[1])
  }
  return Array.from(ids).sort()
}
