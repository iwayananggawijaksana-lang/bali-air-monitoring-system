// admin-config.js
// Admin Configuration and Management System

const ADMIN_CONFIG_API = "https://9l5vu3c1zl.execute-api.ap-southeast-1.amazonaws.com/prod/admin-config";

class AdminManager {
  constructor() {
    this.currentAdmin = null;
    this.isAuthenticated = false;
    this.adminFeatures = {};
  }

  // Check if user is admin
  async checkAdminStatus() {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");

    if (token && adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        this.currentAdmin = parsedAdmin;
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error("Error parsing admin data:", error);
        this.logout();
        return false;
      }
    }
    return false;
  }

  // Login function
  async login(username, password) {
    try {
      const response = await fetch(ADMIN_CONFIG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.token) {
        // Store admin data
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem(
          "adminData",
          JSON.stringify({
            username: data.username,
            role: data.role || "admin",
            permissions: data.permissions || ["view", "edit", "delete", "manage_admins"],
          })
        );

        this.currentAdmin = JSON.parse(localStorage.getItem("adminData"));
        this.isAuthenticated = true;

        return {
          success: true,
          message: "Login successful",
          redirect: "index.html",
        };
      } else {
        return {
          success: false,
          message: data.message || "Invalid credentials",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Connection error. Please try again.",
      };
    }
  }

  // Logout function
  logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    this.currentAdmin = null;
    this.isAuthenticated = false;
    window.location.href = "index.html";
  }

  // Check if admin has specific permission
  hasPermission(permission) {
    if (!this.isAuthenticated || !this.currentAdmin) return false;
    return this.currentAdmin.permissions.includes(permission);
  }

  // Get admin features based on permissions
  getAdminFeatures() {
    return {
      canAddLocation: this.hasPermission("manage_locations"),
      canEditLocation: this.hasPermission("edit"),
      canDeleteLocation: this.hasPermission("delete"),
      canEditRecommendations: this.hasPermission("manage_recommendations"),
      canManageAdmins: this.hasPermission("manage_admins"),
      canViewAdminPanel: this.isAuthenticated,
    };
  }

  // Update UI based on admin status
  updateUIForAdmin() {
    const features = this.getAdminFeatures();

    // Show admin bar if authenticated
    const adminBar = document.getElementById("adminBar");
    if (adminBar && features.canViewAdminPanel) {
      adminBar.classList.remove("hidden");
      document.getElementById("adminName").textContent = `👤 ${this.currentAdmin.username}`;
    }

    // Update admin section in header
    const adminSection = document.getElementById("adminSection");
    if (adminSection) {
      if (this.isAuthenticated) {
        adminSection.innerHTML = `
                    <div class="flex items-center space-x-2 text-dark-teal">
                        <span class="w-8 h-8 bg-teal-200 text-dark-teal rounded-full flex items-center justify-center font-bold">
                            ${this.currentAdmin.username.charAt(0).toUpperCase()}
                        </span>
                        <span class="hidden md:inline">${this.currentAdmin.username}</span>
                        <div class="relative group">
                            <button class="bg-teal-700 hover:bg-teal-600 text-white py-1 px-3 rounded-lg text-xs flex items-center transition-all duration-300">
                                Admin Menu ▼
                            </button>
                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 hidden group-hover:block">
                                <div class="py-1">
                                    <a href="#admin-locations" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Manage Locations</a>
                                    <a href="#admin-recommendations" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Recommendations</a>
                                    <a href="#admin-users" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Manage Admins</a>
                                    <div class="border-t"></div>
                                    <button onclick="adminManager.logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      } else {
        adminSection.innerHTML = `
                    <button id="loginBtn" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm flex items-center transition-all duration-300 hover:scale-105">
                        Admin Login
                    </button>
                `;

        // Add login event listener
        setTimeout(() => {
          const loginBtn = document.getElementById("loginBtn");
          if (loginBtn) {
            loginBtn.addEventListener("click", () => {
              window.location.href = "login.html";
            });
          }
        }, 100);
      }
    }

    // Show/hide admin controls based on permissions
    this.toggleAdminControls(features);
  }

  // Toggle admin controls visibility
  toggleAdminControls(features) {
    // Show location management controls
    const locationControls = document.querySelectorAll(".location-controls");
    if (locationControls) {
      locationControls.forEach((control) => {
        if (features.canAddLocation || features.canEditLocation || features.canDeleteLocation) {
          control.classList.remove("hidden");
        } else {
          control.classList.add("hidden");
        }
      });
    }

    // Show recommendation edit controls
    const recommendationControls = document.querySelectorAll(".recommendation-controls");
    if (recommendationControls) {
      recommendationControls.forEach((control) => {
        if (features.canEditRecommendations) {
          control.classList.remove("hidden");
        } else {
          control.classList.add("hidden");
        }
      });
    }

    // Show admin management controls
    const adminControls = document.querySelectorAll(".admin-management-controls");
    if (adminControls) {
      adminControls.forEach((control) => {
        if (features.canManageAdmins) {
          control.classList.remove("hidden");
        } else {
          control.classList.add("hidden");
        }
      });
    }
  }

  // Add new location
  async addNewLocation(locationData) {
    if (!this.hasPermission("manage_locations")) {
      throw new Error("Permission denied");
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(ADMIN_CONFIG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "add_location",
          ...locationData,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding location:", error);
      throw error;
    }
  }

  // Delete location
  async deleteLocation(locationId) {
    if (!this.hasPermission("delete")) {
      throw new Error("Permission denied");
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(ADMIN_CONFIG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "delete_location",
          location_id: locationId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }

  // Edit recommendation text
  async editRecommendation(recommendationId, newText) {
    if (!this.hasPermission("manage_recommendations")) {
      throw new Error("Permission denied");
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(ADMIN_CONFIG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "edit_recommendation",
          recommendation_id: recommendationId,
          text: newText,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error editing recommendation:", error);
      throw error;
    }
  }

  // Add new admin account
  async addNewAdmin(adminData) {
    if (!this.hasPermission("manage_admins")) {
      throw new Error("Permission denied");
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(ADMIN_CONFIG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "add_admin",
          ...adminData,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding admin:", error);
      throw error;
    }
  }

  // Delete admin account
  async deleteAdmin(adminId) {
    if (!this.hasPermission("manage_admins")) {
      throw new Error("Permission denied");
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(ADMIN_CONFIG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "delete_admin",
          admin_id: adminId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting admin:", error);
      throw error;
    }
  }

  // Get all admin accounts
  async getAdmins() {
    if (!this.hasPermission("manage_admins")) {
      throw new Error("Permission denied");
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch(`${ADMIN_CONFIG_API}?action=get_admins`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting admins:", error);
      throw error;
    }
  }
}

// Create global instance
const adminManager = new AdminManager();

// Initialize on page load
document.addEventListener("DOMContentLoaded", async function () {
  await adminManager.checkAdminStatus();
  adminManager.updateUIForAdmin();

  // Add admin controls to pages
  addAdminControlsToPages();
});

// Function to add admin controls to different pages
function addAdminControlsToPages() {
  const path = window.location.pathname;

  if (path.includes("index.html") || path.endsWith("/")) {
    addLocationManagementControls();
  } else if (path.includes("history.html")) {
    addHistoryAdminControls();
  } else if (path.includes("insights.html")) {
    addInsightsAdminControls();
  }
}

// Add location management controls to dashboard
function addLocationManagementControls() {
  if (!adminManager.isAuthenticated) return;

  const locationPanel = document.getElementById("location-panel");
  if (!locationPanel) return;

  // Add location management section
  const managementSection = document.createElement("div");
  managementSection.className = "admin-management-controls bg-white border-t border-gray-200 p-4";
  managementSection.innerHTML = `
        <div class="mb-4">
            <h3 class="font-bold text-gray-800 mb-2">📍 Location Management</h3>
            <button onclick="showAddLocationModal()" class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center transition-all duration-300 mb-2">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Location
            </button>
            <button onclick="showManageLocationsModal()" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center transition-all duration-300">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                Manage Locations
            </button>
        </div>
    `;

  locationPanel.appendChild(managementSection);
}

// Add admin controls to history page
function addHistoryAdminControls() {
  if (!adminManager.isAuthenticated) return;

  const addNewSection = document.getElementById("addNewSection");
  if (addNewSection) {
    addNewSection.classList.remove("hidden");
  }
}

// Add admin controls to insights page
function addInsightsAdminControls() {
  if (!adminManager.isAuthenticated) return;

  const recommendationsContainer = document.getElementById("recommendations-container");
  if (!recommendationsContainer) return;

  const editButton = document.createElement("button");
  editButton.className = "fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110";
  editButton.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
    `;
  editButton.onclick = () => showEditRecommendationsModal();

  document.body.appendChild(editButton);
}

// Modal functions
function showAddLocationModal() {
  const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg w-full max-w-md">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">➕ Add New Location</h3>
                    <form id="addLocationForm">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                <input type="text" id="locationName" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input type="number" step="any" id="locationLat" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input type="number" step="any" id="locationLon" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Initial AQI/Index</label>
                                <input type="number" id="locationAqi" value="50" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea id="locationDesc" rows="2"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
                            </div>
                        </div>
                        <div class="flex space-x-3 mt-6">
                            <button type="submit" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md transition duration-300">
                                Add Location
                            </button>
                            <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-300">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

  const modal = document.createElement("div");
  modal.innerHTML = modalHtml;
  document.body.appendChild(modal);

  // Add form submit handler
  document.getElementById("addLocationForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const locationData = {
      name: document.getElementById("locationName").value,
      lat: parseFloat(document.getElementById("locationLat").value),
      lon: parseFloat(document.getElementById("locationLon").value),
      aqi: parseInt(document.getElementById("locationAqi").value),
      description: document.getElementById("locationDesc").value,
    };

    try {
      const result = await adminManager.addNewLocation(locationData);
      if (result.success) {
        alert("Location added successfully!");
        closeModal();
        // Refresh location data
        if (typeof fetchLocationData === "function") {
          fetchLocationData();
        }
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Error adding location: " + error.message);
    }
  });
}

function showManageLocationsModal() {
  // This would show a modal with list of locations and delete options
  console.log("Show manage locations modal");
}

function showEditRecommendationsModal() {
  const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">📝 Edit Health Recommendations</h3>
                    <div id="recommendationsEditForm">
                        <!-- Recommendations will be loaded here -->
                        <div class="text-center py-8">
                            <div class="loading mx-auto mb-4"></div>
                            <p class="text-gray-500">Loading recommendations...</p>
                        </div>
                    </div>
                    <div class="flex space-x-3 mt-6">
                        <button onclick="saveRecommendations()" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md transition duration-300">
                            Save Changes
                        </button>
                        <button onclick="closeModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-300">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

  const modal = document.createElement("div");
  modal.innerHTML = modalHtml;
  document.body.appendChild(modal);

  // Load recommendations for editing
  loadRecommendationsForEditing();
}

function loadRecommendationsForEditing() {
  const form = document.getElementById("recommendationsEditForm");
  const recommendations = trafficPollutionRecommendations; // From insights.html

  form.innerHTML = `
        <div class="space-y-6">
            ${recommendations
              .map(
                (rec, index) => `
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center mb-3">
                        <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${rec.color}"></div>
                        <h4 class="font-bold" style="color: ${rec.color}">${rec.status}</h4>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Health Effects</label>
                            <textarea class="recommendation-text w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                rows="2" data-type="health_effects" data-index="${index}">${rec.health_effects}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                            <div class="space-y-2">
                                ${rec.recommendations
                                  .map(
                                    (item, itemIndex) => `
                                    <input type="text" class="recommendation-item w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                        value="${item}" data-index="${index}" data-item-index="${itemIndex}">
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    `;
}

async function saveRecommendations() {
  const recommendations = [...trafficPollutionRecommendations];
  const textAreas = document.querySelectorAll(".recommendation-text");
  const inputs = document.querySelectorAll(".recommendation-item");

  // Update health effects
  textAreas.forEach((textarea) => {
    const index = parseInt(textarea.dataset.index);
    const type = textarea.dataset.type;
    if (type === "health_effects") {
      recommendations[index].health_effects = textarea.value;
    }
  });

  // Update recommendations
  inputs.forEach((input) => {
    const index = parseInt(input.dataset.index);
    const itemIndex = parseInt(input.dataset.itemIndex);
    if (recommendations[index] && recommendations[index].recommendations[itemIndex]) {
      recommendations[index].recommendations[itemIndex] = input.value;
    }
  });

  try {
    // Save to API
    for (let i = 0; i < recommendations.length; i++) {
      await adminManager.editRecommendation(i, recommendations[i]);
    }

    alert("Recommendations updated successfully!");
    closeModal();

    // Refresh page to show updated recommendations
    window.location.reload();
  } catch (error) {
    alert("Error saving recommendations: " + error.message);
  }
}

function closeModal() {
  const modal = document.querySelector(".fixed.inset-0.bg-black");
  if (modal) {
    modal.remove();
  }
}

// Add admin management page functionality
function showAdminManagementModal() {
  const modalHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">👥 Admin Account Management</h3>
                    
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-700 mb-3">Add New Admin</h4>
                        <form id="addAdminForm" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input type="text" id="newAdminUsername" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" id="newAdminPassword" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="newAdminEmail" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="permissions" value="view" checked class="mr-2">
                                        <span class="text-sm">View</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="permissions" value="edit" checked class="mr-2">
                                        <span class="text-sm">Edit</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="permissions" value="delete" checked class="mr-2">
                                        <span class="text-sm">Delete</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="permissions" value="manage_locations" checked class="mr-2">
                                        <span class="text-sm">Manage Locations</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="permissions" value="manage_recommendations" checked class="mr-2">
                                        <span class="text-sm">Manage Recommendations</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="permissions" value="manage_admins" class="mr-2">
                                        <span class="text-sm">Manage Admins</span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-300">
                                Add Admin Account
                            </button>
                        </form>
                    </div>
                    
                    <div>
                        <h4 class="font-bold text-gray-700 mb-3">Existing Admins</h4>
                        <div id="adminList" class="space-y-3">
                            <div class="text-center py-8">
                                <div class="loading mx-auto mb-4"></div>
                                <p class="text-gray-500">Loading admin list...</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button onclick="closeModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

  const modal = document.createElement("div");
  modal.innerHTML = modalHtml;
  document.body.appendChild(modal);

  // Load admin list
  loadAdminList();

  // Add form submit handler
  document.getElementById("addAdminForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const checkboxes = document.querySelectorAll('input[name="permissions"]:checked');
    const permissions = Array.from(checkboxes).map((cb) => cb.value);

    const adminData = {
      username: document.getElementById("newAdminUsername").value,
      password: document.getElementById("newAdminPassword").value,
      email: document.getElementById("newAdminEmail").value || undefined,
      permissions: permissions,
    };

    try {
      const result = await adminManager.addNewAdmin(adminData);
      if (result.success) {
        alert("Admin account created successfully!");
        loadAdminList();
        document.getElementById("addAdminForm").reset();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Error adding admin: " + error.message);
    }
  });
}

async function loadAdminList() {
  try {
    const result = await adminManager.getAdmins();
    const adminList = document.getElementById("adminList");

    if (result.success && result.admins) {
      adminList.innerHTML = result.admins
        .map(
          (admin) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <div class="font-medium text-gray-800">${admin.username}</div>
                        <div class="text-xs text-gray-500">${admin.email || "No email"}</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Permissions: ${admin.permissions.join(", ")}
                        </div>
                    </div>
                    <div>
                        <button onclick="deleteAdminAccount('${admin.id}')" 
                                class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition duration-300"
                                ${admin.username === adminManager.currentAdmin.username ? "disabled" : ""}>
                            Delete
                        </button>
                    </div>
                </div>
            `
        )
        .join("");
    } else {
      adminList.innerHTML = '<p class="text-gray-500 text-center">No admins found</p>';
    }
  } catch (error) {
    const adminList = document.getElementById("adminList");
    adminList.innerHTML = `<p class="text-red-500 text-center">Error loading admins: ${error.message}</p>`;
  }
}

async function deleteAdminAccount(adminId) {
  if (!confirm("Are you sure you want to delete this admin account?")) return;

  try {
    const result = await adminManager.deleteAdmin(adminId);
    if (result.success) {
      alert("Admin account deleted successfully!");
      loadAdminList();
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    alert("Error deleting admin: " + error.message);
  }
}
