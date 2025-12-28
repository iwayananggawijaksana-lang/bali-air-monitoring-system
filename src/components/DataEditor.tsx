import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminService } from "../services/adminService";
import { DeviceData } from "../types/admin";

interface DataEditorProps {
  deviceData: DeviceData;
  onUpdate: () => void;
  onDelete: () => void;
}

export const DataEditor: React.FC<DataEditorProps> = ({ deviceData, onUpdate, onDelete }) => {
  const { admin, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    AQI: deviceData.AQI || 0,
    latitude: deviceData.latitude || 0,
    longitude: deviceData.longitude || 0,
    MQ7: deviceData.MQ7 || 0,
    GP2Y1010: deviceData.GP2Y1010 || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      AQI: deviceData.AQI || 0,
      latitude: deviceData.latitude || 0,
      longitude: deviceData.longitude || 0,
      MQ7: deviceData.MQ7 || 0,
      GP2Y1010: deviceData.GP2Y1010 || 0,
    });
  }, [deviceData]);

  if (!isAdmin) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.AQI < 0 || formData.AQI > 500) {
      newErrors.AQI = "AQI must be between 0 and 500";
    }
    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180";
    }
    if (formData.MQ7 < 0) {
      newErrors.MQ7 = "CO value cannot be negative";
    }
    if (formData.GP2Y1010 < 0) {
      newErrors.GP2Y1010 = "PM2.5 value cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!admin?.token || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await adminService.updateData({
        // Removed const success =
        action: "update",
        token: admin.token,
        DeviceID_Tanggal: deviceData.DeviceID_Tanggal || `${deviceData.DeviceID}#${new Date().toISOString().split("T")[0]}`,
        Timestamp: deviceData.Timestamp || new Date().toISOString(),
        updates: {
          AQI: formData.AQI,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
      });
      setIsEditing(false);
      onUpdate();
      window.dispatchEvent(
        new CustomEvent("showNotification", {
          detail: { message: "Data updated successfully!", type: "success" },
        })
      );
    } catch (error) {
      console.error("Update error:", error);
      window.dispatchEvent(
        new CustomEvent("showNotification", {
          detail: { message: "Failed to update data", type: "error" },
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!admin?.token) return;

    if (window.confirm(`Are you sure you want to delete data for ${deviceData.DeviceID}? This action cannot be undone.`)) {
      setIsSubmitting(true);
      try {
        await adminService.deleteData({
          // Removed const success =
          action: "delete",
          token: admin.token,
          DeviceID_Tanggal: deviceData.DeviceID_Tanggal || `${deviceData.DeviceID}#${new Date().toISOString().split("T")[0]}`,
          Timestamp: deviceData.Timestamp || new Date().toISOString(),
        });
        onDelete();
        window.dispatchEvent(
          new CustomEvent("showNotification", {
            detail: { message: "Data deleted successfully!", type: "success" },
          })
        );
      } catch (error) {
        console.error("Delete error:", error);
        window.dispatchEvent(
          new CustomEvent("showNotification", {
            detail: { message: "Failed to delete data", type: "error" },
          })
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      AQI: deviceData.AQI || 0,
      latitude: deviceData.latitude || 0,
      longitude: deviceData.longitude || 0,
      MQ7: deviceData.MQ7 || 0,
      GP2Y1010: deviceData.GP2Y1010 || 0,
    });
    setErrors({});
    setIsEditing(false);
  };

  const getAqiStatus = (aqi: number) => {
    if (aqi <= 50) return { status: "Baik", color: "text-green-600" };
    if (aqi <= 100) return { status: "Sedang", color: "text-yellow-600" };
    if (aqi <= 150) return { status: "Tidak Sehat (Sensitif)", color: "text-orange-600" };
    if (aqi <= 200) return { status: "Tidak Sehat", color: "text-red-600" };
    if (aqi <= 300) return { status: "Sangat Tidak Sehat", color: "text-purple-600" };
    return { status: "Berbahaya", color: "text-red-800" };
  };

  const aqiInfo = getAqiStatus(formData.AQI);

  return (
    <div className="data-editor border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white/50 backdrop-blur-sm">
      {!isEditing ? (
        // View Mode
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-bold text-gray-800">{deviceData.DeviceID}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${aqiInfo.color} bg-opacity-20`}>{aqiInfo.status}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-xs text-gray-500 mb-1">AQI</label>
                <p className="font-semibold text-gray-800">{formData.AQI}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CO (ppm)</label>
                <p className="font-semibold text-gray-800">{formData.MQ7}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">PM2.5 (µg/m³)</label>
                <p className="font-semibold text-gray-800">{formData.GP2Y1010}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Coordinates</label>
                <p className="font-semibold text-gray-800 text-xs">
                  {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            {deviceData.Timestamp && (
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">Last Updated</label>
                <p className="text-xs text-gray-600">{new Date(deviceData.Timestamp).toLocaleString("id-ID")}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 ml-4">
            <button onClick={() => setIsEditing(true)} disabled={isSubmitting} className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm">Edit</span>
            </button>

            <button onClick={handleDelete} disabled={isSubmitting} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm">Delete</span>
            </button>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Edit Data: {deviceData.DeviceID}</h3>
            <div className="flex space-x-2">
              <button onClick={handleCancel} disabled={isSubmitting} className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-1">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* AQI Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AQI Value *</label>
              <input
                type="number"
                min="0"
                max="500"
                value={formData.AQI}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    AQI: parseInt(e.target.value) || 0,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.AQI ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.AQI && <p className="text-red-500 text-xs mt-1">{errors.AQI}</p>}
            </div>

            {/* CO Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CO (ppm) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.MQ7}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    MQ7: parseFloat(e.target.value) || 0,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.MQ7 ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.MQ7 && <p className="text-red-500 text-xs mt-1">{errors.MQ7}</p>}
            </div>

            {/* PM2.5 Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PM2.5 (µg/m³) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.GP2Y1010}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    GP2Y1010: parseFloat(e.target.value) || 0,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.GP2Y1010 ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.GP2Y1010 && <p className="text-red-500 text-xs mt-1">{errors.GP2Y1010}</p>}
            </div>

            {/* Latitude Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: parseFloat(e.target.value) || 0,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.latitude ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
            </div>

            {/* Longitude Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: parseFloat(e.target.value) || 0,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.longitude ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
            </div>

            {/* AQI Status Preview */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">AQI Status Preview</label>
              <div className={`text-lg font-bold ${aqiInfo.color}`}>{aqiInfo.status}</div>
              <div className="text-xs text-gray-500 mt-1">Based on current AQI value</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm font-medium">Editing Tips</p>
                <p className="text-blue-700 text-xs">AQI ranges: 0-50 (Baik), 51-100 (Sedang), 101-150 (Tidak Sehat Sensitif), 151-200 (Tidak Sehat), 201-300 (Sangat Tidak Sehat), 301+ (Berbahaya)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
