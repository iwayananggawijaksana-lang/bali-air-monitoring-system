// apiConfig.js
const API_CONFIG = {
  DEVICES: ["RMU1", "RMU2", "OBU"], // sesuaikan

  ENDPOINTS: {
    DATA_API: "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/data",
    LOGIN_API: "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/login",
    UPDATE_API: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/update-data",
    DELETE_API: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/delete-data",
    DOWNLOAD_API: "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/download-report",
    UPLOAD_URL_API: "https://gp312oazlj.execute-api.ap-southeast-1.amazonaws.com/upload-url",
  },

  async fetchData(key, params = {}, options = {}) {
    const baseUrl = this.ENDPOINTS[key];
    if (!baseUrl) throw new Error(`Unknown API key: ${key}`);

    const method = (options.method || "GET").toUpperCase();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const url = new URL(baseUrl);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });

    const fetchOptions = { method, headers };

    if (options.body !== undefined) {
      fetchOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    const res = await fetch(url.toString(), fetchOptions);

    // untuk error yang tetap kirim json body
    const text = await res.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      const msg = (parsed && parsed.message) ? parsed.message : `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return parsed;
  },
};

window.API_CONFIG = API_CONFIG;
