import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Roommate Rent Manager (Sandbox)', description: 'Local SQLite sandbox build' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh flex">
          <aside className="hidden md:flex md:w-60 lg:w-64 flex-col border-r bg-white/60 backdrop-blur">
            <div className="px-4 h-16 flex items-center font-semibold">🏠 Sandbox</div>
            <nav className="flex-1 space-y-1 px-2">
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/">Dashboard</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/lease">Lease</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/lease/allocation">Allocation</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/payments">Payments</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="/expenses">Expenses</a>
            </nav>
          </aside>
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b flex items-center px-3 gap-2">
              <div className="font-semibold">Roommate Rent Manager — Sandbox (SQLite)</div>
            </header>
            <main className="p-4 lg:p-6 container">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
