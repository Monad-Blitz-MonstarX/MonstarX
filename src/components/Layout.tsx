import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Trophy, TrendingUp, BarChart3, Wallet, Settings } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-surface border-r border-dark-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-monad-purple-500 to-monad-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-white">Monstar X</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-monad-purple-500/20 text-monad-purple-400 border border-monad-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-dark-card'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>Leaderboard</span>
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50">
            <TrendingUp className="w-5 h-5" />
            <span>Markets</span>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50">
            <Wallet className="w-5 h-5" />
            <span>My Wallet</span>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Monstar X</h1>
            <div className="px-3 py-1 bg-monad-purple-500/20 text-monad-purple-400 text-xs rounded-full border border-monad-purple-500/30">
              Monad Testnet
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-dark-card hover:bg-dark-card/80 rounded-lg text-sm text-gray-300 transition-colors">
              Connect Wallet
            </button>
            <div className="w-8 h-8 bg-dark-card rounded-full flex items-center justify-center cursor-pointer hover:bg-dark-card/80">
              <div className="w-6 h-6 bg-monad-purple-500 rounded-full"></div>
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

