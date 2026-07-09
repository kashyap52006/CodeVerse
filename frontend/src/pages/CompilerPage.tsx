// CompilerPage — Full implementation comes in Phase 3 (Monaco Editor integration)
// This is a placeholder shell that confirms routing works.

export function CompilerPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
          Code Compiler
        </h1>
        <p className="mt-2 text-dark-500 dark:text-dark-400">
          Monaco Editor integration coming in Phase 3
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-dark-300 bg-dark-50 p-8 text-sm text-dark-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-500">
        {'// Write your code here...'}
      </div>
    </div>
  )
}
