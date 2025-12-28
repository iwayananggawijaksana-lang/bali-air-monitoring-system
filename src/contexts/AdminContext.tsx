import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminLocation, HealthRecommendation, SystemSettings } from "../types/admin";
import { adminService } from "../services/adminService";

interface AdminContextType {
  locations: AdminLocation[];
  customLocations: AdminLocation[];
  addLocation: (location: Omit<AdminLocation, "id" | "timestamp">) => AdminLocation | null;
  updateLocation: (locationId: string, updates: Partial<AdminLocation>) => AdminLocation | null;
  deleteLocation: (locationId: string) => boolean;
  getLocation: (locationId: string) => AdminLocation | null;
  recommendations: HealthRecommendation[];
  updateRecommendation: (recommendationId: string, updates: Partial<HealthRecommendation>) => HealthRecommendation | null;
  getRecommendationByAqi: (aqi: number) => HealthRecommendation | null;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  refreshData: () => Promise<void>;
  isDataLoading: boolean;
  lastUpdated: Date | null;
  showNotification: (message: string, type?: NotificationType) => void;
  clearNotifications: () => void;
}

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [customLocations, setCustomLocations] = useState<AdminLocation[]>([]);
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoRefresh: true,
    refreshInterval: 300000,
    mapRadius: 150,
    notificationsEnabled: true,
    dataRetentionDays: 30,
    apiEndpoint: "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/prod",
  });
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (systemSettings.autoRefresh) {
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          refreshData();
        }
      }, systemSettings.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [systemSettings.autoRefresh, systemSettings.refreshInterval]);

  const loadInitialData = async (): Promise<void> => {
    try {
      setIsDataLoading(true);

      const loadedLocations = await adminService.getAllLocations();
      setLocations(loadedLocations);
      setCustomLocations(loadedLocations.filter((loc) => loc.isCustom));

      const loadedRecommendations = adminService.getRecommendations();
      setRecommendations(loadedRecommendations);

      const savedSettings = localStorage.getItem("bams_system_settings");
      if (savedSettings) {
        setSystemSettings((prev: SystemSettings) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading admin data:", error);
      showNotification("Failed to load admin data", "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadInitialData();
    showNotification("Data refreshed successfully", "success");
  };

  const addLocation = (locationData: Omit<AdminLocation, "id" | "timestamp">): AdminLocation | null => {
    try {
      const newLocation = adminService.addLocation(locationData);

      setLocations((prev) => [...prev, newLocation]);
      setCustomLocations((prev) => [...prev, newLocation]);
      setLastUpdated(new Date());

      window.dispatchEvent(new CustomEvent("adminLocationsUpdated"));
      showNotification(`Location "${newLocation.name}" added successfully`, "success");

      return newLocation;
    } catch (error) {
      console.error("Error adding location:", error);
      showNotification("Failed to add location", "error");
      return null;
    }
  };

  const updateLocation = (locationId: string, updates: Partial<AdminLocation>): AdminLocation | null => {
    try {
      const updatedLocation = adminService.updateLocation(locationId, updates);

      if (updatedLocation) {
        setLocations((prev: AdminLocation[]) => prev.map((loc: AdminLocation) => (loc.id === locationId ? updatedLocation : loc)));
        setCustomLocations((prev: AdminLocation[]) => prev.map((loc: AdminLocation) => (loc.id === locationId ? updatedLocation : loc)));
        setLastUpdated(new Date());

        window.dispatchEvent(new CustomEvent("adminLocationsUpdated"));
        showNotification(`Location "${updatedLocation.name}" updated successfully`, "success");
      }

      return updatedLocation;
    } catch (error) {
      console.error("Error updating location:", error);
      showNotification("Failed to update location", "error");
      return null;
    }
  };

  const deleteLocation = (locationId: string): boolean => {
    try {
      const location = locations.find((loc) => loc.id === locationId);

      if (!location) {
        showNotification("Location not found", "error");
        return false;
      }

      if (!window.confirm(`Are you sure you want to delete location "${location.name}"?`)) {
        return false;
      }

      const success = adminService.deleteLocation(locationId);

      if (success) {
        setLocations((prev: AdminLocation[]) => prev.filter((loc: AdminLocation) => loc.id !== locationId));
        setCustomLocations((prev: AdminLocation[]) => prev.filter((loc: AdminLocation) => loc.id !== locationId));
        setLastUpdated(new Date());

        window.dispatchEvent(new CustomEvent("adminLocationsUpdated"));
        showNotification(`Location "${location.name}" deleted successfully`, "success");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting location:", error);
      showNotification("Failed to delete location", "error");
      return false;
    }
  };

  const getLocation = (locationId: string): AdminLocation | null => {
    return locations.find((loc) => loc.id === locationId) || null;
  };

  const updateRecommendation = (recommendationId: string, updates: Partial<HealthRecommendation>): HealthRecommendation | null => {
    try {
      const updatedRecommendation = adminService.updateRecommendation(recommendationId, updates);

      if (updatedRecommendation) {
        setRecommendations((prev: HealthRecommendation[]) => prev.map((rec: HealthRecommendation) => (rec.id === recommendationId ? updatedRecommendation : rec)));
        setLastUpdated(new Date());

        window.dispatchEvent(new CustomEvent("recommendationsUpdated"));
        showNotification(`Recommendations for "${updatedRecommendation.status}" updated successfully`, "success");
      }

      return updatedRecommendation;
    } catch (error) {
      console.error("Error updating recommendation:", error);
      showNotification("Failed to update recommendations", "error");
      return null;
    }
  };

  const getRecommendationByAqi = (aqi: number): HealthRecommendation | null => {
    return recommendations.find((rec) => aqi >= rec.aqi_min && aqi <= rec.aqi_max) || null;
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>): void => {
    try {
      const updatedSettings = { ...systemSettings, ...newSettings };
      setSystemSettings(updatedSettings);

      localStorage.setItem("bams_system_settings", JSON.stringify(updatedSettings));
      showNotification("System settings updated successfully", "success");
    } catch (error) {
      console.error("Error updating system settings:", error);
      showNotification("Failed to update system settings", "error");
    }
  };

  const showNotification = (message: string, type: NotificationType = "info"): void => {
    if (!systemSettings.notificationsEnabled) return;

    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev: Notification[]) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== notification.id));
    }, 5000);

    window.dispatchEvent(
      new CustomEvent("showNotification", {
        detail: { message, type },
      })
    );
  };

  const clearNotifications = (): void => {
    setNotifications([]);
  };

  const contextValue: AdminContextType = {
    locations,
    customLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocation,
    recommendations,
    updateRecommendation,
    getRecommendationByAqi,
    systemSettings,
    updateSystemSettings,
    refreshData,
    isDataLoading,
    lastUpdated,
    showNotification,
    clearNotifications,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : notification.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : notification.type === "warning"
                ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                : "bg-blue-50 border-blue-500 text-blue-700"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-5 h-5 mt-0.5 ${notification.type === "success" ? "text-green-500" : notification.type === "error" ? "text-red-500" : notification.type === "warning" ? "text-yellow-500" : "text-blue-500"}`}>
                {notification.type === "success" && "✓"}
                {notification.type === "error" && "✕"}
                {notification.type === "warning" && "⚠"}
                {notification.type === "info" && "ℹ"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-70 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
              </div>
              <button onClick={() => setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== notification.id))} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);

  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }

  return context;
};

export default AdminContext;
