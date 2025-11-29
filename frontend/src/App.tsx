import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { BlacklistPage } from './pages/BlacklistPage';
import { LinksPage } from './pages/LinksPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { PublicApplyPage } from './pages/PublicApplyPage';
import { RequireAuth } from './routes/RequireAuth';
import AppLayout from './layout/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply/:slug" element={<PublicApplyPage />} />
      <Route
        element={(
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        )}
      >
        <Route index element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/new" element={<CampaignsPage mode="create" />} />
        <Route path="/campaigns/:id/edit" element={<CampaignsPage mode="create" />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="/links/new" element={<LinksPage mode="create" />} />
        <Route path="/links/:id/edit" element={<LinksPage mode="create" />} />
        <Route path="/links/:linkId/candidates" element={<CandidatesPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/new" element={<CandidatesPage mode="create" />} />
        <Route path="/blacklist" element={<BlacklistPage />} />
        <Route path="/blacklist/new" element={<BlacklistPage mode="create" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
