import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LeaderboardPage from './pages/LeaderboardPage'
import YapperDetailPage from './pages/YapperDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LeaderboardPage />} />
          <Route path="/yapper/:id" element={<YapperDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

