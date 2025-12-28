import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AdminBar } from './components/AdminBar';
import { LoginModal } from './components/LoginModal';
import { AdminProvider } from './contexts/AdminContext';

const MainApp: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app min-h-screen bg-gray-50">
      {isAdmin && <AdminBar />}
      
      <div className="container mx-auto px-4 py-8">
        {!isAdmin ? (
          <div className="text-center max-w-2xl mx-auto mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Bali Air Monitoring System
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Monitor kualitas udara di Bali secara real-time dengan data akurat dan rekomendasi kesehatan.
              </p>
              
              <button
                onClick={() => setShowLogin(true)}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-md"
              >
                Admin Login
              </button>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-2">Real-time Monitoring</h3>
                  <p className="text-teal-700 text-sm">Pantau kualitas udara secara live dari berbagai lokasi di Bali.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Health Insights</h3>
                  <p className="text-blue-700 text-sm">Dapatkan rekomendasi kesehatan berdasarkan kondisi udara.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Historical Data</h3>
                  <p className="text-green-700 text-sm">Analisis tren dan pola kualitas udara dari waktu ke waktu.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              Anda sedang dalam mode administrator dengan akses penuh untuk mengelola data sistem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg mb-2">Data Management</h3>
                <p className="text-teal-100 text-sm">Kelola data lokasi dan perangkat monitoring</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg mb-2">System Settings</h3>
                <p className="text-blue-100 text-sm">Konfigurasi pengaturan sistem</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg mb-2">Health Recommendations</h3>
                <p className="text-green-100 text-sm">Kelola rekomendasi kesehatan</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AdminProvider>
      <MainApp />
    </AdminProvider>
  );
};

export default App;