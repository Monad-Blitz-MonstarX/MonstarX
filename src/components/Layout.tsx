import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Trophy, Wallet } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Left Sidebar */}
      <aside className="w-64 bg-dark-surface/80 backdrop-blur-sm border-r border-dark-border/50 flex flex-col shadow-lg shadow-monad-purple-500/5">
        {/* Logo */}
        <div className="p-6 border-b border-dark-border/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-monad-purple-500 to-monad-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-monad-purple-500/30">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-white">Monstar X</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              location.pathname === '/' || location.pathname.startsWith('/yapper')
                ? 'bg-monad-purple-500/30 text-monad-purple-300 border border-monad-purple-500/50 shadow-md shadow-monad-purple-500/20'
                : 'text-gray-300 hover:text-white hover:bg-dark-card/60'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </Link>
          
          <Link
            to="/wallet"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              location.pathname === '/wallet'
                ? 'bg-monad-purple-500/30 text-monad-purple-300 border border-monad-purple-500/50 shadow-md shadow-monad-purple-500/20'
                : 'text-gray-300 hover:text-white hover:bg-dark-card/60'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>My Wallet</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-dark-surface/80 backdrop-blur-sm border-b border-dark-border/50 flex items-center justify-between px-6 shadow-md shadow-monad-purple-500/5">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Monstar X</h1>
            <div className="px-3 py-1 bg-monad-purple-500/30 text-monad-purple-300 text-xs rounded-lg border border-monad-purple-500/40 shadow-sm shadow-monad-purple-500/10">
              Monad Testnet
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-5 py-2 bg-dark-card/80 hover:bg-dark-card rounded-xl text-sm text-gray-200 transition-all duration-200 border border-dark-border/50 hover:border-monad-purple-500/40 hover:shadow-md hover:shadow-monad-purple-500/10">
              Connect Wallet
            </button>
            <div className="w-10 h-10 bg-dark-card/80 rounded-xl flex items-center justify-center cursor-pointer hover:bg-dark-card transition-all duration-200 border border-dark-border/50 hover:border-monad-purple-500/40 hover:shadow-md hover:shadow-monad-purple-500/10">
              <div className="w-6 h-6 bg-monad-purple-500 rounded-lg"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  )
}

