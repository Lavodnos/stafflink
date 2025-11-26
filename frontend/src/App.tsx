import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { BlacklistPage } from './pages/BlacklistPage';
import { LinksPage } from './pages/LinksPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { PublicApplyPage } from './pages/PublicApplyPage';
import { RequireAuth } from './routes/RequireAuth';
import { Shell } from './components/layout/Shell';
import { Header } from './components/layout/Header';
import { UserMenu } from './components/layout/UserMenu';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply/:slug" element={<PublicApplyPage />} />
      <Route
        path="/"
        element={(
          <RequireAuth>
            <Shell
              renderHeader={(openNav) => (
                <Header
                  title="Dashboard"
                  subtitle="Resumen y accesos rápidos"
                  onMenuClick={openNav}
                  actions={<UserMenu />}
                />
              )}
            >
              <DashboardPage />
            </Shell>
          </RequireAuth>
        )}
      />
      <Route
        path="/campaigns"
        element={(
          <RequireAuth>
            <Shell
              renderHeader={(openNav) => (
                <Header title="Campañas" subtitle="Gestiona campañas" onMenuClick={openNav} actions={<UserMenu />} />
              )}
            >
              <CampaignsPage />
            </Shell>
          </RequireAuth>
        )}
      />
      <Route
        path="/blacklist"
        element={(
          <RequireAuth>
            <Shell
              renderHeader={(openNav) => (
                <Header title="Blacklist" subtitle="Personas vetadas" onMenuClick={openNav} actions={<UserMenu />} />
              )}
            >
              <BlacklistPage />
            </Shell>
          </RequireAuth>
        )}
      />
      <Route
        path="/links"
        element={(
          <RequireAuth>
            <Shell
              renderHeader={(openNav) => (
                <Header title="Links" subtitle="Genera links de reclutamiento" onMenuClick={openNav} actions={<UserMenu />} />
              )}
            >
              <LinksPage />
            </Shell>
          </RequireAuth>
        )}
      />
      <Route
        path="/candidates"
        element={(
          <RequireAuth>
            <Shell
              renderHeader={(openNav) => (
                <Header title="Candidatos" subtitle="Ficha, documentos y proceso" onMenuClick={openNav} actions={<UserMenu />} />
              )}
            >
              <CandidatesPage />
            </Shell>
          </RequireAuth>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
