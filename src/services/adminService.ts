import { Admin, LoginCredentials, UpdateDataRequest, DeleteDataRequest, ApiResponse, AdminLocation, HealthRecommendation } from "../types/admin";

const LOGIN_API = "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/prod/login";
const UPDATE_API = "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/prod/update-data";
const DELETE_API = "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/prod/delete-data";
const GET_API_BASE = "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/prod/data";

// Mock data untuk development - tambahkan admin accounts
const mockAdmins: Admin[] = [
  {
    username: "admin",
    token: "mock-jwt-token-admin",
    role: "super_admin",
    permissions: ["view", "edit", "delete", "manage_admins", "manage_locations", "manage_recommendations"],
  },
];

// Mock data untuk development
const mockLocations: AdminLocation[] = [
  {
    id: "RSU1#2025-10-25",
    name: "RSU Denpasar",
    lat: -8.6705,
    lon: 115.2126,
    aqi: 45,
    status: "Baik",
    timestamp: new Date().toISOString(),
    polutan_utama: "CO",
    polutan_value: "0.5",
    co_value: "0.5",
    pm25_value: "12.3",
  },
  {
    id: "RSU2#2025-10-25",
    name: "RSU Badung",
    lat: -8.5925,
    lon: 115.1631,
    aqi: 78,
    status: "Sedang",
    timestamp: new Date().toISOString(),
    polutan_utama: "PM2.5",
    polutan_value: "25.6",
    co_value: "0.8",
    pm25_value: "25.6",
  },
];

const mockRecommendations: HealthRecommendation[] = [
  {
    id: "1",
    status: "Baik",
    aqi_min: 0,
    aqi_max: 50,
    recommendations: ["Kondisi udara sangat baik untuk semua aktivitas luar", "Ideal untuk olahraga dan aktivitas outdoor", "Jendela dapat dibuka untuk ventilasi alami"],
    color: "#22C55E",
  },
  {
    id: "2",
    status: "Sedang",
    aqi_min: 51,
    aqi_max: 100,
    recommendations: ["Kelompok sensitif mungkin mengalami iritasi ringan", "Tetap dapat beraktivitas normal", "Perhatikan gejala pernapasan pada kelompok sensitif"],
    color: "#FACC15",
  },
  {
    id: "3",
    status: "Tidak Sehat bagi Kelompok Sensitif",
    aqi_min: 101,
    aqi_max: 150,
    recommendations: ["Kelompok sensitif harus membatasi aktivitas luar", "Anak-anak, lansia, dan penderita penyakit pernapasan harus berhati-hati", "Kurangi aktivitas fisik berat di luar ruangan"],
    color: "#FB923C",
  },
  {
    id: "4",
    status: "Tidak Sehat",
    aqi_min: 151,
    aqi_max: 200,
    recommendations: ["Semua orang mungkin mengalami efek kesehatan", "Hindari aktivitas luar yang berlebihan", "Gunakan masker jika harus keluar ruangan"],
    color: "#EF4444",
  },
  {
    id: "5",
    status: "Sangat Tidak Sehat",
    aqi_min: 201,
    aqi_max: 300,
    recommendations: ["Peringatan kesehatan serius - hindari aktivitas luar", "Tetap di dalam ruangan dengan ventilasi yang baik", "Gunakan air purifier jika memungkinkan"],
    color: "#A855F7",
  },
  {
    id: "6",
    status: "Berbahaya",
    aqi_min: 301,
    aqi_max: 500,
    recommendations: ["KRITIS: Kondisi darurat kesehatan masyarakat", "Hindari semua aktivitas luar", "Gunakan masker N95 jika harus keluar", "Segera cari pertolongan medis jika mengalami sesak napas"],
    color: "#DC2626",
  },
];

export const adminService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse | null> {
    try {
      console.log("Attempting login with:", credentials);

      // Check against all admin accounts (mock and custom)
      const admin = await this.validateAdminLogin(credentials.username, credentials.password);
      if (admin) {
        const mockResponse: ApiResponse = {
          message: "Login successful",
          token: admin.token,
          username: admin.username,
        };
        return mockResponse;
      }

      // Fallback to API call for production
      const response = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  },

  async updateData(request: UpdateDataRequest): Promise<boolean> {
    try {
      console.log("Updating data:", request);

      // Mock implementation untuk development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simpan ke localStorage untuk mock data
      const existingData = JSON.parse(localStorage.getItem("bams_custom_locations") || "[]");
      const updatedData = existingData.map((loc: AdminLocation) => (loc.id === request.DeviceID_Tanggal ? { ...loc, ...request.updates } : loc));
      localStorage.setItem("bams_custom_locations", JSON.stringify(updatedData));

      return true;
    } catch (error) {
      console.error("Update error:", error);
      return false;
    }
  },

  async deleteData(request: DeleteDataRequest): Promise<boolean> {
    try {
      console.log("Deleting data:", request);

      // Mock implementation untuk development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Hapus dari localStorage untuk mock data
      const existingData = JSON.parse(localStorage.getItem("bams_custom_locations") || "[]");
      const filteredData = existingData.filter((loc: AdminLocation) => loc.id !== request.DeviceID_Tanggal);
      localStorage.setItem("bams_custom_locations", JSON.stringify(filteredData));

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  },

  async getAllLocations(): Promise<AdminLocation[]> {
    try {
      // Gabungkan mock data dengan custom locations dari localStorage
      const customLocations = JSON.parse(localStorage.getItem("bams_custom_locations") || "[]");
      return [...mockLocations, ...customLocations];
    } catch (error) {
      console.error("Error getting locations:", error);
      return mockLocations;
    }
  },

  getAqiStatus(aqi: number): string {
    if (aqi <= 50) return "Baik";
    if (aqi <= 100) return "Sedang";
    if (aqi <= 150) return "Tidak Sehat bagi Kelompok Sensitif";
    if (aqi <= 200) return "Tidak Sehat";
    if (aqi <= 300) return "Sangat Tidak Sehat";
    return "Berbahaya";
  },

  getRecommendations(): HealthRecommendation[] {
    return mockRecommendations;
  },

  getLocations(): AdminLocation[] {
    return mockLocations;
  },

  addLocation(locationData: Omit<AdminLocation, "id" | "timestamp">): AdminLocation {
    const newLocation: AdminLocation = {
      ...locationData,
      id: `custom-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isCustom: true,
      polutan_utama: locationData.polutan_utama || "CO",
      polutan_value: locationData.polutan_value || "0",
      co_value: locationData.co_value || "0",
      pm25_value: locationData.pm25_value || "0",
    };

    // Simpan ke localStorage
    const existingData = JSON.parse(localStorage.getItem("bams_custom_locations") || "[]");
    existingData.push(newLocation);
    localStorage.setItem("bams_custom_locations", JSON.stringify(existingData));

    return newLocation;
  },

  updateLocation(id: string, updates: Partial<AdminLocation>): AdminLocation | null {
    const existingData = JSON.parse(localStorage.getItem("bams_custom_locations") || "[]");
    const locationIndex = existingData.findIndex((loc: AdminLocation) => loc.id === id);

    if (locationIndex !== -1) {
      existingData[locationIndex] = { ...existingData[locationIndex], ...updates };
      localStorage.setItem("bams_custom_locations", JSON.stringify(existingData));
      return existingData[locationIndex];
    }

    return null;
  },

  updateRecommendation(id: string, updates: Partial<HealthRecommendation>): HealthRecommendation | null {
    const recommendationIndex = mockRecommendations.findIndex((rec) => rec.id === id);

    if (recommendationIndex !== -1) {
      mockRecommendations[recommendationIndex] = {
        ...mockRecommendations[recommendationIndex],
        ...updates,
      };
      return mockRecommendations[recommendationIndex];
    }

    return null;
  },

  getRecommendationByAqi(aqi: number): HealthRecommendation | null {
    return mockRecommendations.find((rec) => aqi >= rec.aqi_min && aqi <= rec.aqi_max) || null;
  },

  deleteLocation(locationId: string): boolean {
    const existingData = JSON.parse(localStorage.getItem("bams_custom_locations") || "[]");
    const filteredData = existingData.filter((loc: AdminLocation) => loc.id !== locationId);

    if (filteredData.length !== existingData.length) {
      localStorage.setItem("bams_custom_locations", JSON.stringify(filteredData));
      return true;
    }

    return false;
  },

  // Admin management functions
  async addAdmin(adminData: { username: string; password: string; email?: string; permissions: string[] }): Promise<boolean> {
    try {
      console.log("Adding new admin:", adminData);

      // Mock implementation untuk development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newAdmin: Admin = {
        username: adminData.username,
        token: "mock-jwt-token-" + Date.now(),
        role: "Admin",
        permissions: adminData.permissions,
      };

      // Simpan ke localStorage untuk mock data
      const existingAdmins = JSON.parse(localStorage.getItem("bams_admin_accounts") || "[]");
      existingAdmins.push(newAdmin);
      localStorage.setItem("bams_admin_accounts", JSON.stringify(existingAdmins));

      return true;
    } catch (error) {
      console.error("Add admin error:", error);
      return false;
    }
  },

  async deleteAdmin(username: string): Promise<boolean> {
    try {
      console.log("Deleting admin:", username);

      // Mock implementation untuk development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Hapus dari localStorage untuk mock data
      const existingAdmins = JSON.parse(localStorage.getItem("bams_admin_accounts") || "[]");
      const filteredAdmins = existingAdmins.filter((admin: Admin) => admin.username !== username);

      if (filteredAdmins.length !== existingAdmins.length) {
        localStorage.setItem("bams_admin_accounts", JSON.stringify(filteredAdmins));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Delete admin error:", error);
      return false;
    }
  },

  async getAdmins(): Promise<Admin[]> {
    try {
      // Gabungkan mock data dengan custom admins dari localStorage
      const customAdmins = JSON.parse(localStorage.getItem("bams_admin_accounts") || "[]");
      return [...mockAdmins, ...customAdmins];
    } catch (error) {
      console.error("Error getting admins:", error);
      return mockAdmins;
    }
  },

  // Check if admin exists for login
  async validateAdminLogin(username: string, password: string): Promise<Admin | null> {
    try {
      const allAdmins = await this.getAdmins();
      const admin = allAdmins.find((a) => a.username === username);

      // Mock password validation - in real app, this would be hashed
      if (admin && password === "password") {
        // Simple mock validation
        return admin;
      }

      return null;
    } catch (error) {
      console.error("Validate admin login error:", error);
      return null;
    }
  },
};
