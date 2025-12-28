// src/services/apiConfig.ts
interface ApiEndpoints {
  DATA_API: string;
  LOGIN_API: string;
  UPDATE_API: string;
  UPDATE_RSU_DATA: string;
  UPDATE_USERS_DATA: string;
  DELETE_API: string;
  DELETE_RSU_DATA: string;
  DELETE_USERS_DATA: string;
}

interface ApiConfig {
  ENDPOINTS: ApiEndpoints;
  DEVICES: string[];
  PROXY: {
    ENABLED: boolean;
    URL: string;
  };
}

export const API_CONFIG: ApiConfig = {
  // AWS API Endpoints
  ENDPOINTS: {
    DATA_API: "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/data",
    LOGIN_API: "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/login",
    UPDATE_API: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/update-data",
    UPDATE_RSU_DATA: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/update-data",
    UPDATE_USERS_DATA: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/update-data",
    DELETE_API: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/delete-data",
    DELETE_RSU_DATA: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/delete-data",
    DELETE_USERS_DATA: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/delete-data"
  },
  
  // CORS Proxy untuk development
  PROXY: {
    ENABLED: typeof window !== 'undefined' && 
             (window.location.hostname === "localhost" || 
              window.location.hostname === "127.0.0.1"),
    URL: "http://localhost:3000"
  },
  
  // Device configuration
  DEVICES: ["RSU1", "RSU2", "RSU3"]
};

// Helper function untuk build URL
export const buildApiUrl = (
  endpoint: keyof ApiEndpoints, 
  params: Record<string, string> = {}
): string => {
  let url = API_CONFIG.ENDPOINTS[endpoint];
  
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  if (API_CONFIG.PROXY.ENABLED && API_CONFIG.PROXY.URL) {
    return `${API_CONFIG.PROXY.URL}/?url=${encodeURIComponent(url)}`;
  }
  
  return url;
};

// Type untuk fetch options
interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, any> | string | FormData;
}

// Fetch wrapper dengan TypeScript
export const apiFetch = async <T = any>(
  endpoint: keyof ApiEndpoints,
  params: Record<string, string> = {},
  options: FetchOptions = {}
): Promise<T> => {
  try {
    const url = buildApiUrl(endpoint, params);
    console.log(`🔗 Fetching: ${url}`);
    
    // Handle body serialization
    let body: BodyInit | null | undefined = undefined;
    
    if (options.body) {
      if (typeof options.body === 'string' || options.body instanceof FormData) {
        body = options.body;
      } else {
        body = JSON.stringify(options.body);
      }
    }
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: body,
      ...options
    } as RequestInit);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
    }
    
    const data: T = await response.json();
    console.log(`✅ Success from ${endpoint}:`, 
      Array.isArray(data) ? `${data.length} items` : 'data received');
    return data;
    
  } catch (error) {
    console.error(`❌ Fetch error from ${endpoint}:`, error);
    throw error;
  }
};

// Convenience methods
export const apiService = {
  // GET requests
  getData: <T = any>(params?: Record<string, string>) => 
    apiFetch<T>('DATA_API', params),
  
  // POST/PUT requests dengan data
  postData: <T = any>(
    endpoint: keyof ApiEndpoints, 
    data: Record<string, any>, 
    params?: Record<string, string>
  ) => 
    apiFetch<T>(endpoint, params, { method: 'POST', body: data }),
  
  updateData: <T = any>(
    endpoint: keyof ApiEndpoints,
    data: Record<string, any>,
    params?: Record<string, string>
  ) =>
    apiFetch<T>(endpoint, params, { method: 'PUT', body: data }),
  
  deleteData: <T = any>(
    endpoint: keyof ApiEndpoints,
    data?: Record<string, any>,
    params?: Record<string, string>
  ) =>
    apiFetch<T>(endpoint, params, { 
      method: 'DELETE', 
      body: data 
    }),
  
  // Login khusus
  login: (credentials: { username: string; password: string }) =>
    apiFetch<{ token: string; user: any }>('LOGIN_API', {}, {
      method: 'POST',
      body: credentials
    })
};