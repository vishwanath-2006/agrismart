import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage';
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';

// Farmer Pages
import { FarmerDashboardPage } from './pages/farmer/FarmerDashboardPage';
import { MarketComparisonPage } from './pages/farmer/MarketComparisonPage';
import { MarketPricesPage } from './pages/farmer/MarketPricesPage';
import { PriceHistoryPage } from './pages/farmer/PriceHistoryPage';
import { AddProducePage } from './pages/farmer/AddProducePage';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';

// Buyer Pages
import { BuyerMarketplacePage } from './pages/buyer/BuyerMarketplacePage';
import { PriceNegotiationPage } from './pages/buyer/PriceNegotiationPage';
import { TransporterMatchingPage } from './pages/buyer/TransporterMatchingPage';
import { OrderConfirmationPage } from './pages/buyer/OrderConfirmationPage';
import { BuyerProfilePage } from './pages/buyer/BuyerProfilePage';

// Transporter Pages
import { TransporterDashboardPage } from './pages/transporter/TransporterDashboardPage';
import { RouteOptimizationPage } from './pages/transporter/RouteOptimizationPage';
import { LiveTrackingPage } from './pages/transporter/LiveTrackingPage';
import { DeliveryConfirmationPage } from './pages/transporter/DeliveryConfirmationPage';
import { TransporterProfilePage } from './pages/transporter/TransporterProfilePage';

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
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
