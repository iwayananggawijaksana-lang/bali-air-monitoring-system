export interface Admin {
  username: string;
  token: string;
  role?: string;
  permissions?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  isAdmin: boolean;
  admin: Admin | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface UpdateDataRequest {
  action: "update";
  token: string;
  DeviceID_Tanggal: string;
  Timestamp: string;
  updates: {
    AQI?: number;
    latitude?: number;
    longitude?: number;
    MQ7?: number;
    GP2Y1010?: number;
  };
}

export interface DeleteDataRequest {
  action: "delete";
  token: string;
  DeviceID_Tanggal: string;
  Timestamp: string;
}

export interface ApiResponse {
  message: string;
  token?: string;
  username?: string;
}

export interface AdminLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number;
  status: string;
  timestamp: string;
  polutan_utama: string;
  polutan_value: string;
  co_value: string;
  pm25_value: string;
  isCustom?: boolean;
  DeviceID?: string;
}

export interface HealthRecommendation {
  id: string;
  status: string;
  aqi_min: number;
  aqi_max: number;
  recommendations: string[];
  color: string;
}

export interface SystemSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  mapRadius: number;
  notificationsEnabled: boolean;
  dataRetentionDays: number;
  apiEndpoint: string;
}

export interface DeviceData {
  DeviceID: string;
  DeviceID_Tanggal?: string;
  Timestamp?: string;
  AQI: number;
  latitude: number;
  longitude: number;
  MQ7: number;
  GP2Y1010: number;
  status?: string;
}

export interface NotificationType {
  message: string;
  type: "success" | "error" | "warning" | "info";
}
