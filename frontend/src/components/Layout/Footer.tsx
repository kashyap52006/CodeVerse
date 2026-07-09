export function Footer() {
  return (
    <footer className="border-t border-dark-200 bg-white py-4 dark:border-dark-800 dark:bg-dark-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-dark-500 dark:text-dark-400">
          © {new Date().getFullYear()} CodeVerse — The best way to learn programming is to write
          programs.
        </p>
      </div>
    </footer>
  )
}
