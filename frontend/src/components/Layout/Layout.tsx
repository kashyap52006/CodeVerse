import type { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-dark-950">
      <Navigation />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
