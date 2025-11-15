import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LeaderboardPage from './pages/LeaderboardPage'
import YapperDetailPage from './pages/YapperDetailPage'
import MyWalletPage from './pages/MyWalletPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/yapper/:id" element={<YapperDetailPage />} />
          <Route path="/wallet" element={<MyWalletPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

