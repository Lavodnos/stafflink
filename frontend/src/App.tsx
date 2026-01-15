import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignsListPage } from './pages/campaigns/CampaignsListPage';
import { CampaignCreatePage } from './pages/campaigns/CampaignCreatePage';
import { CampaignEditPage } from './pages/campaigns/CampaignEditPage';
import { BlacklistListPage } from './pages/blacklist/BlacklistListPage';
import { BlacklistCreatePage } from './pages/blacklist/BlacklistCreatePage';
import { ConvocatoriasListPage } from './pages/convocatorias/ConvocatoriasListPage';
import { ConvocatoriaCreatePage } from './pages/convocatorias/ConvocatoriaCreatePage';
import { ConvocatoriaEditPage } from './pages/convocatorias/ConvocatoriaEditPage';
import { ConvocatoriaPostulantesPage } from './pages/convocatorias/ConvocatoriaPostulantesPage';
import { CandidatesListPage } from './pages/candidates/CandidatesListPage';
import { CandidateCreatePage } from './pages/candidates/CandidateCreatePage';
import { PublicApplyPage } from './pages/PublicApplyPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
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
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/campaigns"
            element={(
              <RequirePermission required="campaigns.read">
                <CampaignsListPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/campaigns/new"
            element={(
              <RequirePermission required="campaigns.manage">
                <CampaignCreatePage />
              </RequirePermission>
            )}
          />
          <Route
            path="/campaigns/:id/edit"
            element={(
              <RequirePermission required="campaigns.manage">
                <CampaignEditPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/convocatorias"
            element={(
              <RequirePermission required="convocatorias.read">
                <ConvocatoriasListPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/convocatorias/new"
            element={(
              <RequirePermission required="convocatorias.manage">
                <ConvocatoriaCreatePage />
              </RequirePermission>
            )}
          />
          <Route
            path="/convocatorias/:id/edit"
            element={(
              <RequirePermission required="convocatorias.manage">
                <ConvocatoriaEditPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/convocatorias/:convocatoriaId/postulantes"
            element={(
              <RequirePermission required="candidates.read">
                <ConvocatoriaPostulantesPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/candidates"
            element={(
              <RequirePermission required="candidates.read">
                <CandidatesListPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/candidates/new"
            element={(
              <RequirePermission required="candidates.manage">
                <CandidateCreatePage />
              </RequirePermission>
            )}
          />
          <Route
            path="/blacklist"
            element={(
              <RequirePermission required="blacklist.read">
                <BlacklistListPage />
              </RequirePermission>
            )}
          />
          <Route
            path="/blacklist/new"
            element={(
              <RequirePermission required="blacklist.manage">
                <BlacklistCreatePage />
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
