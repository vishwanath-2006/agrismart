import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

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
  const { currentRole, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (currentRole === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
  if (currentRole === 'buyer') return <Navigate to="/buyer/marketplace" replace />;
  if (currentRole === 'transporter') return <Navigate to="/transporter/dashboard" replace />;
  return <Navigate to="/login" replace />;
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
            <Route path="/select-role" element={<RoleSelectionPage />} />

            {/* Farmer Routes */}
            <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
            <Route path="/farmer/market-comparison" element={<MarketComparisonPage />} />
            <Route path="/farmer/market-prices" element={<MarketPricesPage />} />
            <Route path="/farmer/price-history" element={<PriceHistoryPage />} />
            <Route path="/farmer/add-produce" element={<AddProducePage />} />
            <Route path="/farmer/live-tracking" element={<LiveTrackingPage />} />
            <Route path="/farmer/profile" element={<FarmerProfilePage />} />

            {/* Buyer Routes */}
            <Route path="/buyer/marketplace" element={<BuyerMarketplacePage />} />
            <Route path="/buyer/negotiation" element={<PriceNegotiationPage />} />
            <Route path="/buyer/transporter-matching" element={<TransporterMatchingPage />} />
            <Route path="/buyer/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/buyer/live-tracking" element={<LiveTrackingPage />} />
            <Route path="/buyer/profile" element={<BuyerProfilePage />} />

            {/* Transporter Routes */}
            <Route path="/transporter/dashboard" element={<TransporterDashboardPage />} />
            <Route path="/transporter/route-optimization" element={<RouteOptimizationPage />} />
            <Route path="/transporter/live-tracking" element={<LiveTrackingPage />} />
            <Route path="/transporter/delivery-confirmation" element={<DeliveryConfirmationPage />} />
            <Route path="/transporter/profile" element={<TransporterProfilePage />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;

