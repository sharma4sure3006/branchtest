import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';

// Import components (we'll create these)
import DriftList from './components/Drifts/DriftList';
import DriftDetail from './components/Drifts/DriftDetail';
import DriftForm from './components/Drifts/DriftForm';
import AdminUsers from './components/Admin/UserList';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/drifts" replace />;
  }

  return children;
};

// Layout wrapper
const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <main className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  </div>
);

// Auth check component for bootstrap
const AuthCheck = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If already authenticated, redirect to drifts
  if (isAuthenticated) {
    return <Navigate to="/drifts" replace />;
  }

  // For now, show regular login form
  // In a real app, you might check if users exist first
  return <LoginForm />;
};

const AppContent = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<AuthCheck />} />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Navigate to="/drifts" replace />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/drifts" element={
        <ProtectedRoute>
          <Layout>
            <DriftList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/drifts/new" element={
        <ProtectedRoute>
          <Layout>
            <DriftForm />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/drifts/:id" element={
        <ProtectedRoute>
          <Layout>
            <DriftDetail />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/drifts/:id/edit" element={
        <ProtectedRoute>
          <Layout>
            <DriftForm editMode={true} />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/users" element={
        <AdminRoute>
          <Layout>
            <AdminUsers />
          </Layout>
        </AdminRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Page not found</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;