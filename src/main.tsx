import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import { SiteLangProvider } from './i18n'
import './index.css'

const LandingPage = React.lazy(() => import('./pages/LandingPage'))
const App = React.lazy(() => import('./App'))
const ViewPage = React.lazy(() => import('./pages/ViewPage'))
const AdminPage = React.lazy(() => import('./pages/AdminPage'))
const ManagePage = React.lazy(() => import('./pages/ManagePage'))
const AuthCallbackPage = React.lazy(() => import('./pages/AuthCallbackPage'))
const TermsPage = React.lazy(() => import('./pages/TermsPage'))
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'))
const SuperAdminPage = React.lazy(() => import('./pages/SuperAdminPage'))
const TemplatePreviewPage = React.lazy(() => import('./pages/TemplatePreviewPage'))
const TemplatesPage = React.lazy(() => import('./pages/TemplatesPage'))
const EventsPage = React.lazy(() => import('./pages/EventsPage'))
const InvitePage = React.lazy(() => import('./pages/InvitePage'))
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'))
const AnniversaryEditPage = React.lazy(() => import('./pages/AnniversaryEditPage'))

const Loading = () => (
  <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
    <p>불러오는 중...</p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SiteLangProvider>
  <BrowserRouter>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<AuthGate><App /></AuthGate>} />
        <Route path="/edit/:slug" element={<AuthGate><App /></AuthGate>} />
        <Route path="/manage" element={<AuthGate><ManagePage /></AuthGate>} />
        <Route path="/manage/:slug/anniversary" element={<AuthGate><AnniversaryEditPage /></AuthGate>} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/template-preview/:presetId" element={<TemplatePreviewPage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="/gallery/:slug" element={<GalleryPage />} />
        <Route path="/:slug" element={<ViewPage />} />
        <Route path="/admin/:slug" element={<AuthGate><AdminPage /></AuthGate>} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/superadmin" element={<AuthGate><SuperAdminPage /></AuthGate>} />
      </Routes>
    </Suspense>
  </BrowserRouter>
  </SiteLangProvider>,
)
