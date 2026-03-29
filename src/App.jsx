import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ProgressProvider } from './context/ProgressContext'
import Navbar from './components/common/Navbar'
import Sidebar from './components/common/Sidebar'
import Home from './pages/Home'
import TopicPage from './pages/TopicPage'
import PracticePage from './pages/PracticePage'

function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/topic/:phase/:topicId" element={<TopicPage />} />
                <Route path="/practice/:phase/:topicId" element={<PracticePage />} />
              </Routes>
            </main>
          </div>
        </div>
      </ProgressProvider>
    </ThemeProvider>
  )
}

export default App
