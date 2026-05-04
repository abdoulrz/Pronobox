import React, { useEffect, ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Matches from './pages/Matches';
import Predictions from './pages/Predictions';
import Box from './pages/Box';
import News from './pages/News';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import CompareAccounts from './pages/CompareAccounts';
import Channels from './pages/Channels';
import ChannelView from './pages/ChannelView';
import ProtectedRoute from './components/ProtectedRoute';
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
  }, [isAuthenticated]);
  
  return <>{children}</>;
};
export function App() {
  return (
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
                      <ProtectedRoute>
                          <Layout>
                            <Matches />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/predictions"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Predictions />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/box"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <Box />
                          </Layout>
                        </ProtectedRoute>
                      } />

                    <Route
                      path="/news"
                      element={
                      <ProtectedRoute>
                          <Layout>
                            <News />
                          </Layout>
                        </ProtectedRoute>
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
                            <Profile />
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

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AuthChecker>
              </Router>
            </ChannelDataProvider>
          </NotificationProvider>
        </PaymentProvider>
      </AuthProvider>
    </ThemeProvider>);

}