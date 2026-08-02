import React, { useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Matches from './pages/Matches';
import Home from './pages/Home';
import Box from './pages/Box';
import MatchDetails from './pages/MatchDetails';
import LeagueDetails from './pages/LeagueDetails';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Auth from './pages/Auth';
import CompareAccounts from './pages/CompareAccounts';
import Pronos from './pages/Pronos';
import Channels from './pages/Channels';
import ChannelView from './pages/ChannelView';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BetEduc from './components/BetEduc';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ChannelDataProvider } from './contexts/ChannelContext';

// Composant pour vérifier l'authentification initiale
const AuthChecker: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log("AuthChecker - État d'authentification:", isAuthenticated);
    // Always attempt to use the real API on fresh load
    localStorage.removeItem('fallbackMode');
  }, [isAuthenticated]);
  
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

                    <Route
                      path="/box"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Box />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route path="/news" element={<Navigate to="/box" replace />} />

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
                </AuthChecker>
              </Router>
            </ChannelDataProvider>
          </NotificationProvider>
        </PaymentProvider>
      </AuthProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>);

}