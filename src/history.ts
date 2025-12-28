import Chart from "chart.js/auto";
import { fetchHistoryList, fetchHistoryDetail } from "./services/api";

// Global variables
let allLocationData: any[] = [];
let currentPeriod = "day";
let activeCharts: { [key: string]: Chart } = {};
let currentDate = new Date().toISOString().split("T")[0];

/**
 * Create chart function
 */
function createChart(canvasId: string, label: string, labels: string[], data: number[], color: string): Chart | null {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!ctx) {
    console.error(`Canvas element with id "${canvasId}" not found.`);
    return null;
  }

  // Destroy old chart if exists
  if (activeCharts[canvasId]) {
    activeCharts[canvasId].destroy();
  }

  const newChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: `${color}20`,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          title: {
            display: true,
            text: "Konsentrasi",
          },
        },
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: color,
          borderWidth: 1,
        },
      },
    },
  });

  activeCharts[canvasId] = newChart;
  return newChart;
}

/**
 * Load table data from API
 */
async function loadTableData(): Promise<void> {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  // Show loading
  tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-gray-500">
    <div class="flex flex-col items-center">
      <div class="loading w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-2"></div>
      <span>Loading data from API...</span>
    </div>
  </td></tr>`;

  try {
    console.log("Loading table data for date:", currentDate, "period:", currentPeriod);

    const data = await fetchHistoryList(currentDate, currentPeriod, 1);
    allLocationData = data.items || [];
    console.log("Received data:", allLocationData);

    renderTable();
  } catch (error) {
    console.error("Failed to load table data:", error);
    tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-red-500">
      <div class="flex flex-col items-center">
        <svg class="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <span>Failed to load data: ${(error as Error).message}</span>
        <button onclick="loadTableData()" class="mt-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700">
          Try Again
        </button>
      </div>
    </td></tr>`;
  }
}

/**
 * Render table data
 */
function renderTable(): void {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (allLocationData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-gray-500">
      No data available for the selected date and period.
    </td></tr>`;
    return;
  }

  allLocationData.forEach((item: any, index: number) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition-colors";

    const time = item.Timestamp ? new Date(item.Timestamp).toLocaleString("id-ID") : "N/A";
    const deviceId = item.DeviceID || "Unknown";
    const aqi = item.AQI || 0;
    const latitude = item.latitude || 0;
    const longitude = item.longitude || 0;
    const mq7 = item.MQ7 || 0;
    const gp2y1010 = item.GP2Y1010 || 0;

    // Determine AQI status color
    let statusColor = "text-green-600";
    if (aqi > 100) statusColor = "text-yellow-600";
    if (aqi > 150) statusColor = "text-orange-600";
    if (aqi > 200) statusColor = "text-red-600";
    if (aqi > 300) statusColor = "text-purple-600";

    row.innerHTML = `
      <td class="p-3 border-b border-gray-200 text-center">${index + 1}</td>
      <td class="p-3 border-b border-gray-200 font-medium">${deviceId}</td>
      <td class="p-3 border-b border-gray-200">${time}</td>
      <td class="p-3 border-b border-gray-200 text-center">
        <span class="font-semibold ${statusColor}">${aqi}</span>
      </td>
      <td class="p-3 border-b border-gray-200 text-center">${mq7.toFixed(2)}</td>
      <td class="p-3 border-b border-gray-200 text-center">${gp2y1010.toFixed(2)}</td>
      <td class="p-3 border-b border-gray-200 text-center">${latitude.toFixed(4)}</td>
      <td class="p-3 border-b border-gray-200 text-center">${longitude.toFixed(4)}</td>
      <td class="p-3 border-b border-gray-200 text-center">
        <button onclick="viewDetail('${deviceId}', '${item.Timestamp || ""}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
          View Detail
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

/**
 * View detail function (placeholder)
 */
function viewDetail(deviceId: string, timestamp: string): void {
  console.log("Viewing detail for device:", deviceId, "at timestamp:", timestamp);
  // TODO: Implement detail view modal or navigation
}

// Make functions globally available
(window as any).loadTableData = loadTableData;
(window as any).renderTable = renderTable;
(window as any).viewDetail = viewDetail;

console.log("History module loaded successfully");
