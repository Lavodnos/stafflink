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
import { ToastContainer } from './components/ToastContainer';
import { RequirePermission } from './components/RequirePermission';

function App() {
  return (
    <>
      <ToastContainer />
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
          <Route
            path="/campaigns"
            element={(
              <RequirePermission required="campaigns.read">
                <CampaignsPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/campaigns/new"
            element={(
              <RequirePermission required="campaigns.manage">
                <CampaignsPage mode="create" />
              </RequirePermission>
            )}
          />
          <Route
            path="/campaigns/:id/edit"
            element={(
              <RequirePermission required="campaigns.manage">
                <CampaignsPage mode="create" />
              </RequirePermission>
            )}
          />
          <Route
            path="/links"
            element={(
              <RequirePermission required="links.read">
                <LinksPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/links/new"
            element={(
              <RequirePermission required="links.manage">
                <LinksPage mode="create" />
              </RequirePermission>
            )}
          />
          <Route
            path="/links/:id/edit"
            element={(
              <RequirePermission required="links.manage">
                <LinksPage mode="create" />
              </RequirePermission>
            )}
          />
          <Route
            path="/links/:linkId/candidates"
            element={(
              <RequirePermission required="candidates.read">
                <CandidatesPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/candidates"
            element={(
              <RequirePermission required="candidates.read">
                <CandidatesPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/candidates/new"
            element={(
              <RequirePermission required="candidates.manage">
                <CandidatesPage mode="create" />
              </RequirePermission>
            )}
          />
          <Route
            path="/blacklist"
            element={(
              <RequirePermission required="blacklist.read">
                <BlacklistPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/blacklist/new"
            element={(
              <RequirePermission required="blacklist.manage">
                <BlacklistPage mode="create" />
              </RequirePermission>
            )}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
