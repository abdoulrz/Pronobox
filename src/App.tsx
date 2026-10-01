import React, { useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChannelDataProvider } from './contexts/ChannelContext';

// ── Lazy-loaded pages for optimized bundle splitting ────────────────────────
const Home = React.lazy(() => import('./pages/Home'));
const Matches = React.lazy(() => import('./pages/Matches'));
const MatchDetails = React.lazy(() => import('./pages/MatchDetails'));
const LeagueDetails = React.lazy(() => import('./pages/LeagueDetails'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Auth = React.lazy(() => import('./pages/Auth'));
const CompareAccounts = React.lazy(() => import('./pages/CompareAccounts'));
const Pronos = React.lazy(() => import('./pages/Pronos'));
const Channels = React.lazy(() => import('./pages/Channels'));
const ChannelView = React.lazy(() => import('./pages/ChannelView'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const BetEduc = React.lazy(() => import('./components/BetEduc'));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">PronosBox</span>
    </div>
  </div>
);

// Composant pour vérifier l'authentification initiale
const AuthChecker: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, clearFallbackMode } = useAuth();
  
  useEffect(() => {
    console.log("AuthChecker - État d'authentification:", isAuthenticated);
    // Always attempt to use the real API on fresh load
    clearFallbackMode();
  }, [isAuthenticated, clearFallbackMode]);
  
  return <>{children}</>;
};
export function App() {
  return (
    <GoogleOAuthProvider clientId="380256594201-dnalojsu0p5266j4mhjlcg8fnapd5rf3.apps.googleusercontent.com">
      <ThemeProvider>
        <AuthProvider>
        <PaymentProvider>
          <NotificationProvider>
            <ChannelDataProvider>
              <Router>
                <AuthChecker>
                  <React.Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route
                        path="/"
                        element={
                          <Layout>
                            <Home />
                          </Layout>
                        } />
                      <Route
                        path="/matches"
                        element={
                          <Layout>
                            <Matches />
                          </Layout>
                        } />

                      <Route
                        path="/match/:id"
                        element={
                          <Layout>
                            <MatchDetails />
                          </Layout>
                        } />

                      <Route
                        path="/league/:id"
                        element={
                          <Layout>
                            <LeagueDetails />
                          </Layout>
                        } />

                      <Route path="/predictions" element={<Navigate to="/pronos" replace />} />

                      <Route path="/box" element={<Navigate to="/channels" replace />} />

                      <Route path="/news" element={<Navigate to="/channels" replace />} />

                    <Route
                      path="/beteduc"
                      element={
                        <Layout>
                          <BetEduc />
                        </Layout>
                      } />

                    <Route
                      path="/settings"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/transactions"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Transactions />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/profile"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/compare-accounts"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <CompareAccounts />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/pronos"
                      element={
                        <Layout>
                          <Pronos />
                        </Layout>
                      } />

                    <Route
                      path="/channels"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Channels />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/channel/:id"
                      element={
                      <ProtectedRoute>
                          <ChannelView />
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/channels/:id"
                      element={
                      <ProtectedRoute>
                          <ChannelView />
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <Layout>
                            <AdminDashboard />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </React.Suspense>
              </AuthChecker>
              </Router>
            </ChannelDataProvider>
          </NotificationProvider>
        </PaymentProvider>
      </AuthProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>);

}