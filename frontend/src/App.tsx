import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { BlacklistPage } from './pages/BlacklistPage';
import { LinksPage } from './pages/LinksPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { PublicApplyPage } from './pages/PublicApplyPage';
import { RequireAuth } from './routes/RequireAuth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply/:slug" element={<PublicApplyPage />} />
      <Route
        path="/"
        element={(
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/campaigns"
        element={(
          <RequireAuth>
            <CampaignsPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/blacklist"
        element={(
          <RequireAuth>
            <BlacklistPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/links"
        element={(
          <RequireAuth>
            <LinksPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/candidates"
        element={(
          <RequireAuth>
            <CandidatesPage />
          </RequireAuth>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
