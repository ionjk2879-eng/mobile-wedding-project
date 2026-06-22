import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

const App = React.lazy(() => import('./App'))
const ViewPage = React.lazy(() => import('./pages/ViewPage'))
const AdminPage = React.lazy(() => import('./pages/AdminPage'))

const Loading = () => (
  <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
    <p>불러오는 중...</p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/w/:slug" element={<ViewPage />} />
          <Route path="/admin/:slug" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
