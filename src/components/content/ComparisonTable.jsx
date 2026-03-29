import clsx from 'clsx'

function ComparisonTable({ comparisons, title = "C++ vs Java Comparison" }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          📊 {title}
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/4">
                Aspect
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold w-[37.5%]">
                <span className="inline-flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cpp text-white text-xs">C++</span>
                </span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold w-[37.5%]">
                <span className="inline-flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-java text-white text-xs">Java</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {comparisons.map((item, index) => (
              <tr
                key={index}
                className={clsx(
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                )}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.aspect}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm text-cpp-dark dark:text-cpp-light font-mono bg-cpp/10 px-2 py-1 rounded">
                    {item.cpp}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm text-java-dark dark:text-java-light font-mono bg-java/10 px-2 py-1 rounded">
                    {item.java}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComparisonTable
