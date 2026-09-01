import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));
const RoleSelectionPage = lazy(() => import('./pages/auth/RoleSelectionPage').then(m => ({ default: m.RoleSelectionPage })));

// Farmer Pages (Lazy Loaded)
const FarmerDashboardPage = lazy(() => import('./pages/farmer/FarmerDashboardPage').then(m => ({ default: m.FarmerDashboardPage })));
const MarketComparisonPage = lazy(() => import('./pages/farmer/MarketComparisonPage').then(m => ({ default: m.MarketComparisonPage })));
const MarketPricesPage = lazy(() => import('./pages/farmer/MarketPricesPage').then(m => ({ default: m.MarketPricesPage })));
const PriceHistoryPage = lazy(() => import('./pages/farmer/PriceHistoryPage').then(m => ({ default: m.PriceHistoryPage })));
const AddProducePage = lazy(() => import('./pages/farmer/AddProducePage').then(m => ({ default: m.AddProducePage })));
const FarmerProfilePage = lazy(() => import('./pages/farmer/FarmerProfilePage').then(m => ({ default: m.FarmerProfilePage })));

// Buyer Pages (Lazy Loaded)
const BuyerMarketplacePage = lazy(() => import('./pages/buyer/BuyerMarketplacePage').then(m => ({ default: m.BuyerMarketplacePage })));
const PriceNegotiationPage = lazy(() => import('./pages/buyer/PriceNegotiationPage').then(m => ({ default: m.PriceNegotiationPage })));
const TransporterMatchingPage = lazy(() => import('./pages/buyer/TransporterMatchingPage').then(m => ({ default: m.TransporterMatchingPage })));
const OrderConfirmationPage = lazy(() => import('./pages/buyer/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const BuyerProfilePage = lazy(() => import('./pages/buyer/BuyerProfilePage').then(m => ({ default: m.BuyerProfilePage })));

// Transporter Pages (Lazy Loaded)
const TransporterDashboardPage = lazy(() => import('./pages/transporter/TransporterDashboardPage').then(m => ({ default: m.TransporterDashboardPage })));
const RouteOptimizationPage = lazy(() => import('./pages/transporter/RouteOptimizationPage').then(m => ({ default: m.RouteOptimizationPage })));
const LiveTrackingPage = lazy(() => import('./pages/transporter/LiveTrackingPage').then(m => ({ default: m.LiveTrackingPage })));
const DeliveryConfirmationPage = lazy(() => import('./pages/transporter/DeliveryConfirmationPage').then(m => ({ default: m.DeliveryConfirmationPage })));
const TransporterProfilePage = lazy(() => import('./pages/transporter/TransporterProfilePage').then(m => ({ default: m.TransporterProfilePage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 gap-3 text-center">
    <span className="w-9 h-9 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    <span className="text-[13px] font-medium text-on-surface-variant">Loading AgriSmart...</span>
  </div>
);

const RootRedirect: React.FC = () => {
  const { currentRole, isAuthLoading, isProfileLoading, supabaseUser, isDemoAuthenticated } = useApp();

  if (isAuthLoading || isProfileLoading) {
    return <PageLoadingFallback />;
  }

  const isAuthenticated = Boolean(supabaseUser || isDemoAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!currentRole) {
    return <Navigate to="/select-role" replace />;
  }

  if (currentRole === 'farmer') {
    return <Navigate to="/farmer/dashboard" replace />;
  }
  if (currentRole === 'buyer') {
    return <Navigate to="/buyer/marketplace" replace />;
  }
  if (currentRole === 'transporter') {
    return <Navigate to="/transporter/dashboard" replace />;
  }
  return <Navigate to="/farmer/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/select-role"
              element={
                <ProtectedRoute>
                  <RoleSelectionPage />
                </ProtectedRoute>
              }
            />

            {/* Farmer Routes */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <FarmerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/market-comparison"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <MarketComparisonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/market-prices"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <MarketPricesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/price-history"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <PriceHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/add-produce"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <AddProducePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/live-tracking"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <LiveTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRole="farmer">
                  <FarmerProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Buyer Routes */}
            <Route
              path="/buyer/marketplace"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <BuyerMarketplacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/negotiation"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <PriceNegotiationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/transporter-matching"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <TransporterMatchingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/order-confirmation"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <OrderConfirmationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/live-tracking"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <LiveTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/profile"
              element={
                <ProtectedRoute allowedRole="buyer">
                  <BuyerProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Transporter Routes */}
            <Route
              path="/transporter/dashboard"
              element={
                <ProtectedRoute allowedRole="transporter">
                  <TransporterDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transporter/route-optimization"
              element={
                <ProtectedRoute allowedRole="transporter">
                  <RouteOptimizationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transporter/live-tracking"
              element={
                <ProtectedRoute allowedRole="transporter">
                  <LiveTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transporter/delivery-confirmation"
              element={
                <ProtectedRoute allowedRole="transporter">
                  <DeliveryConfirmationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transporter/profile"
              element={
                <ProtectedRoute allowedRole="transporter">
                  <TransporterProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;


