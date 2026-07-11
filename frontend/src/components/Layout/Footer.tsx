export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-4 mt-8 border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} CodeVerse. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              About
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
