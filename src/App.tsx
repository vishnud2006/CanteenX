import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HomeScreen } from './components/student/HomeScreen';
import { MenuScreen } from './components/student/MenuScreen';
import { AIChatScreen } from './components/student/AIChatScreen';
import { OrderTracker } from './components/student/OrderTracker';
import { ProfileScreen } from './components/student/ProfileScreen';
import { PickupQRModal } from './components/student/PickupQRModal';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { QRScannerModal } from './components/staff/QRScannerModal';
import { SplitScreenView } from './components/demo/SplitScreenView';
import { DemoControlBar } from './components/demo/DemoControlBar';
import { CartDrawer } from './components/student/CartDrawer';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentRole,
    activeView,
    setActiveView,
    notification,
    dismissNotification,
    activeQRModalOrder,
    setActiveQRModalOrder,
    isAdminScannerOpen
  } = useApp();

  // If user is not authenticated, show Login / Signup Auth screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderStudentView = () => {
    switch (activeView) {
      case 'home':
        return <HomeScreen />;
      case 'menu':
        return <MenuScreen />;
      case 'ai':
        return <AIChatScreen />;
      case 'orders':
        return <OrderTracker />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Presentation Demo Bar */}
      <DemoControlBar />

      {/* Global Interactive Notification Toast */}
      {notification && (
        <div className="fixed top-14 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500 text-amber-100'
              : 'bg-slate-900/90 border-slate-700 text-slate-100'
          }`}>
            <div className="mt-0.5">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : notification.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-orange-400" />
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-extrabold">{notification.title}</h4>
              <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">{notification.message}</p>
            </div>

            <button
              onClick={dismissNotification}
              className="p-1 hover:bg-black/20 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Pickup QR Pass Modal */}
      {activeQRModalOrder && (
        <PickupQRModal
          order={activeQRModalOrder}
          onClose={() => setActiveQRModalOrder(null)}
          onViewDetails={() => {
            setActiveQRModalOrder(null);
            setActiveView('orders');
          }}
        />
      )}

      {/* Staff QR Scanner Modal */}
      {isAdminScannerOpen && (
        <QRScannerModal />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Main App Content Layout */}
      {currentRole === 'split' ? (
        <SplitScreenView />
      ) : currentRole === 'staff' ? (
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            <StaffDashboard />
          </main>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">
            {renderStudentView()}
          </main>
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
