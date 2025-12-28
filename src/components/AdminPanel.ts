import { adminService } from "../services/adminService";
import { AdminLocation, Admin } from "../types/admin";

export class AdminPanel {
  private isOpen = false;
  private container: HTMLElement;
  private notificationContainer: HTMLElement;

  constructor() {
    this.container = this.createAdminPanel();
    this.notificationContainer = this.createNotificationContainer();
    this.setupEventListeners();
    this.setupGlobalEvents();
  }

  private createAdminPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.id = "admin-panel";
    panel.className = "fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col";
    panel.innerHTML = this.getAdminPanelHTML();

    document.body.appendChild(panel);
    return panel;
  }

  private createNotificationContainer(): HTMLElement {
    const container = document.createElement("div");
    container.id = "admin-notifications";
    container.className = "fixed top-4 right-4 z-60 space-y-2";
    document.body.appendChild(container);
    return container;
  }

  private getAdminPanelHTML(): string {
    return `
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="text-2xl font-bold">Admin Panel</h2>
              <p class="text-teal-100 text-sm mt-1">Bali Air Monitoring System</p>
            </div>
            <button id="admin-panel-close" class="text-white hover:text-teal-200 p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-white/20 p-3 rounded-lg">
              <div class="text-teal-100">Custom Locations</div>
              <div class="text-white font-bold text-xl" id="locations-count">0</div>
            </div>
            <div class="bg-white/20 p-3 rounded-lg">
              <div class="text-teal-100">Health Categories</div>
              <div class="text-white font-bold text-xl" id="recommendations-count">0</div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8">
          <!-- Add Location Section -->
          <section class="bg-white rounded-lg border border-gray-200 p-4">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Tambah Lokasi Baru
            </h3>
            <form id="add-location-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lokasi *</label>
                <input type="text" id="location-name" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Contoh: RSU Denpasar Barat">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                  <input type="number" id="location-lat" step="any" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="-8.795" value="-8.795">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
                  <input type="number" id="location-lon" step="any" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="115.175" value="115.175">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">AQI *</label>
                  <input type="number" id="location-aqi" min="0" max="500" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="50" value="50">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select id="location-status" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors">
                    <option value="Baik">Baik</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tidak Sehat bagi Kelompok Sensitif">Tidak Sehat (Sensitif)</option>
                    <option value="Tidak Sehat">Tidak Sehat</option>
                    <option value="Sangat Tidak Sehat">Sangat Tidak Sehat</option>
                    <option value="Berbahaya">Berbahaya</option>
                  </select>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex items-start space-x-2">
                  <svg class="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-blue-700 text-sm">
                    Lokasi custom akan ditampilkan di peta dengan data simulasi. Data polutan akan dihitung otomatis berdasarkan AQI.
                  </p>
                </div>
              </div>

              <button type="submit"
                class="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>Tambah Lokasi</span>
              </button>
            </form>
          </section>

          <!-- Manage Locations Section -->
          <section class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Kelola Lokasi Custom
              </h3>
              <span class="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium" id="locations-badge">0</span>
            </div>
            <div id="locations-list" class="space-y-3 max-h-80 overflow-y-auto">
              <!-- Locations will be populated here -->
            </div>
          </section>

          <!-- Health Recommendations Section -->
          <section class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                </svg>
                Rekomendasi Kesehatan
              </h3>
              <span class="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium" id="recommendations-badge">6</span>
            </div>
            <div id="recommendations-list" class="space-y-4">
              <!-- Recommendations will be populated here -->
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 p-4 border-t border-gray-200">
          <div class="flex justify-between items-center text-sm text-gray-600">
            <span>BAMS Admin v1.0</span>
            <span id="last-saved">Ready</span>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Close panel
    document.getElementById("admin-panel-close")?.addEventListener("click", () => {
      this.hide();
    });

    // Add location form
    document.getElementById("add-location-form")?.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      this.handleAddLocation();
    });

    // Escape key to close
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.isOpen) {
        this.hide();
      }
    });

    // Load initial data
    this.loadLocations();
    this.loadRecommendations();
    this.updateStats();
  }

  private setupGlobalEvents(): void {
    // Listen for show admin panel event
    window.addEventListener("showAdminPanel", () => {
      this.show();
    });

    // Listen for location updates from map
    window.addEventListener("adminLocationsUpdated", () => {
      this.loadLocations();
      this.updateStats();
    });
  }

  private async handleAddLocation(): Promise<void> {
    const nameInput = document.getElementById("location-name") as HTMLInputElement;
    const latInput = document.getElementById("location-lat") as HTMLInputElement;
    const lonInput = document.getElementById("location-lon") as HTMLInputElement;
    const aqiInput = document.getElementById("location-aqi") as HTMLInputElement;
    const statusSelect = document.getElementById("location-status") as HTMLSelectElement;

    const name = nameInput.value.trim();
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    const aqi = parseInt(aqiInput.value);
    const status = statusSelect.value;

    // Validation
    if (!name) {
      this.showNotification("Nama lokasi harus diisi!", "error");
      nameInput.focus();
      return;
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      this.showNotification("Latitude harus antara -90 dan 90!", "error");
      latInput.focus();
      return;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      this.showNotification("Longitude harus antara -180 dan 180!", "error");
      lonInput.focus();
      return;
    }

    if (isNaN(aqi) || aqi < 0 || aqi > 500) {
      this.showNotification("AQI harus antara 0 dan 500!", "error");
      aqiInput.focus();
      return;
    }

    // Determine pollutant values based on AQI
    const polutan_utama = aqi > 100 ? "PM2.5" : "CO";
    const polutan_value = aqi > 100 ? `${(aqi * 0.2).toFixed(1)} µg/m³` : `${(aqi * 0.03).toFixed(2)} ppm`;

    try {
      const deviceId = name.replace(" ", ""); // Asumsi name jadi DeviceID seperti RSU4
      const currentDate = new Date().toISOString().split("T")[0]; // e.g., 2025-10-25
      const deviceIdTanggal = `${deviceId}#${currentDate}`;
      const timestamp = new Date().toISOString();

      await adminService.updateData({
        action: "update",
        token: localStorage.getItem("adminToken") || "",
        DeviceID_Tanggal: deviceIdTanggal,
        Timestamp: timestamp,
        updates: {
          AQI: aqi,
          latitude: lat,
          longitude: lon,
        },
      });

      // Reset form
      (document.getElementById("add-location-form") as HTMLFormElement).reset();
      latInput.value = "-8.795";
      lonInput.value = "115.175";

      // Reload locations list
      this.loadLocations();
      this.updateStats();

      // Show success message
      this.showNotification(`Lokasi "${name}" berhasil ditambahkan!`, "success");

      // Trigger map refresh
      this.triggerMapRefresh();

      // Update last saved time
      this.updateLastSaved();
    } catch (error) {
      this.showNotification("Gagal menambahkan lokasi. Silakan coba lagi.", "error");
    }
  }

  private async loadLocations(): Promise<void> {
    const container = document.getElementById("locations-list");

    if (!container) return;

    try {
      const locations = await adminService.getAllLocations();
      if (locations.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p class="text-sm">Belum ada lokasi custom</p>
            <p class="text-xs mt-1">Tambahkan lokasi baru menggunakan form di atas</p>
          </div>
        `;
        return;
      }

      container.innerHTML = locations
        .map((location) => {
          const aqiColor = this.getAqiColor(location.aqi);
          return `
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="font-semibold text-gray-800">${location.name}</h4>
                <span class="px-2 py-1 rounded-full text-xs font-bold ${aqiColor}">
                  AQI ${location.aqi}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">${location.status}</p>
              <p class="text-xs text-gray-500">
                ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)} • 
                ${new Date(location.timestamp).toLocaleDateString("id-ID")}
              </p>
            </div>
            <button class="delete-location text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors" 
                    data-id="${location.id}" data-timestamp="${location.timestamp}" title="Hapus lokasi">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        `;
        })
        .join("");

      // Add delete event listeners
      container.querySelectorAll(".delete-location").forEach((button) => {
        button.addEventListener("click", (e: Event) => {
          const target = e.target as HTMLElement;
          const buttonElem = target.closest("button") as HTMLButtonElement;
          const deviceIdTanggal = buttonElem.dataset.id;
          const timestamp = buttonElem.dataset.timestamp;
          if (deviceIdTanggal && timestamp) {
            this.handleDeleteLocation(deviceIdTanggal, timestamp);
          }
        });
      });

      // Update badge
      const badge = document.getElementById("locations-badge");
      if (badge) {
        badge.textContent = locations.length.toString();
      }
    } catch (error) {
      this.showNotification("Gagal memuat lokasi.", "error");
    }
  }

  private async handleDeleteLocation(deviceIdTanggal: string, timestamp: string): Promise<void> {
    if (!window.confirm("Yakin ingin menghapus lokasi ini?")) return;

    try {
      await adminService.deleteData({
        action: "delete",
        token: localStorage.getItem("adminToken") || "",
        DeviceID_Tanggal: deviceIdTanggal,
        Timestamp: timestamp,
      });
      this.loadLocations();
      this.updateStats();
      this.showNotification("Lokasi berhasil dihapus!", "success");
      this.triggerMapRefresh();
    } catch (error) {
      this.showNotification("Gagal menghapus lokasi.", "error");
    }
  }

  private loadRecommendations(): void {
    // Implement or leave as is
  }

  private updateStats(): void {
    // Implement or leave as is
  }

  private showNotification(message: string, type: "success" | "error"): void {
    const notification = document.createElement("div");
    notification.className = `p-4 rounded-lg shadow-md ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`;
    notification.textContent = message;
    this.notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  private triggerMapRefresh(): void {
    window.dispatchEvent(new Event("adminLocationsUpdated"));
  }

  private updateLastSaved(): void {
    const lastSaved = document.getElementById("last-saved");
    if (lastSaved) {
      lastSaved.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
    }
  }

  private getAqiColor(aqi: number): string {
    if (aqi <= 50) return "bg-green-500 text-white";
    // add other conditions
    return "bg-gray-500 text-white";
  }

  private show(): void {
    this.container.classList.remove("translate-x-full");
    this.isOpen = true;
  }

  private hide(): void {
    this.container.classList.add("translate-x-full");
    this.isOpen = false;
  }
}
