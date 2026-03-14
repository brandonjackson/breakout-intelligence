import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResponseProvider } from './context/ResponseContext';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import EventHome from './pages/EventHome';
import SessionView from './pages/SessionView';
import ResultsPage from './pages/ResultsPage';
import DevTools from './components/dev/DevTools';

export default function App() {
  return (
    <ResponseProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/invite/:slug" element={<EventHome />} />
            <Route path="/invite/:slug/session/:sessionId" element={<SessionView />} />
            <Route path="/invite/:slug/session/:sessionId/results" element={<ResultsPage />} />
          </Route>
        </Routes>
        <DevTools />
      </BrowserRouter>
    </ResponseProvider>
  );
}
