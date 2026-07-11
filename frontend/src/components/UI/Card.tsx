// Card will be completed in Prompt 7
import type { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border bg-white p-6 dark:bg-gray-900">{children}</div>;
}
