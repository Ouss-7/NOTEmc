import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './styles/modern-ui.css';
import AppLayout from './components/layout/AppLayout';
import NotesList from './components/notes/NotesList';
import NoteEditor from './components/notes/NoteEditor';
import ProcessingPage from './pages/ProcessingPage';
import AnalysisPage from './pages/AnalysisPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import ToolsPage from './pages/ToolsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthTestPage from './pages/AuthTestPage';
import AIToolTestPage from './pages/AIToolTestPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Configure future flags for React Router v7 compatibility
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter {...routerOptions}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth-test" element={<AuthTestPage />} />
          <Route path="/ai-tool-test" element={<AIToolTestPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/notes" replace />} />
            <Route path="notes" element={
              <ProtectedRoute>
                <NotesList />
              </ProtectedRoute>
            } />
            <Route path="notes/new" element={
              <ProtectedRoute>
                <NoteEditor />
              </ProtectedRoute>
            } />
            <Route path="notes/:id/edit" element={
              <ProtectedRoute>
                <NoteEditor />
              </ProtectedRoute>
            } />
            <Route path="notes/:id/process" element={
              <ProtectedRoute>
                <ProcessingPage />
              </ProtectedRoute>
            } />
            <Route path="notes/:id/analysis" element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            } />
            <Route path="tools" element={
              <ProtectedRoute>
                <ToolsPage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
