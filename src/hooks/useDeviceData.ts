import { adminService } from '../services/adminService';

interface AqiColorInfo {
  color: string;
  bgClass: string;
  textClass: string;
}

const aqiColorMap: { [key: string]: AqiColorInfo } = {
  'Baik': {
    color: '#22C55E',
    bgClass: 'bg-green-50',
    textClass: 'text-green-800'
  },
  'Sedang': {
    color: '#FACC15',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-800'
  },
  'Tidak Sehat bagi Kelompok Sensitif': {
    color: '#FB923C',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800'
  },
  'Tidak Sehat': {
    color: '#EF4444',
    bgClass: 'bg-red-50',
    textClass: 'text-red-800'
  },
  'Sangat Tidak Sehat': {
    color: '#A855F7',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-800'
  },
  'Berbahaya': {
    color: '#DC2626',
    bgClass: 'bg-red-100',
    textClass: 'text-red-900'
  }
};

const statusDescriptions: { [key: string]: string } = {
  'Baik': '🌿 Kondisi udara sangat baik untuk semua aktivitas',
  'Sedang': '⚠️ Kelompok sensitif mungkin mengalami iritasi ringan',
  'Tidak Sehat bagi Kelompok Sensitif': '🚫 Kelompok sensitif harus membatasi aktivitas luar',
  'Tidak Sehat': '🚨 Semua orang mungkin mengalami efek kesehatan',
  'Sangat Tidak Sehat': '💀 Peringatan kesehatan serius - hindari aktivitas luar',
  'Berbahaya': '💀 KRITIS: Kondisi darurat kesehatan masyarakat'
};

export function loadDynamicRecommendations(): void {
  try {
    const recommendations = adminService.getRecommendations();
    const container = document.getElementById('recommendations-container');
    
    if (!container) {
      console.warn('Recommendations container not found');
      return;
    }

    console.log('Loading recommendations:', recommendations);

    container.innerHTML = recommendations.map((rec, index) => {
      const colorInfo = aqiColorMap[rec.status] || aqiColorMap['Baik'];
      const description = statusDescriptions[rec.status] || 'Informasi kesehatan terkait kualitas udara';
      
      return `
        <div class="insight-card ${colorInfo.bgClass} border-l-8 rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl" 
             style="border-left-color: ${rec.color}">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div class="flex items-center mb-3 lg:mb-0">
              <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${rec.color}"></div>
              <h3 class="text-2xl font-bold ${colorInfo.textClass}">
                ${index + 1}. ${rec.status}
              </h3>
            </div>
            <span class="px-4 py-2 text-white text-sm font-semibold rounded-full shadow-md" 
                  style="background-color: ${rec.color}">
              AQI ${rec.aqi_min} - ${rec.aqi_max}
            </span>
          </div>
          
          <p class="font-semibold ${colorInfo.textClass} mb-6 text-lg leading-relaxed">
            ${description}
          </p>
          
          <div class="space-y-4">
            ${rec.recommendations.map((recText, recIndex) => `
              <div class="flex items-start bg-white/70 rounded-xl p-4 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md">
                <span class="flex-shrink-0 w-6 h-6 ${colorInfo.textClass} bg-white rounded-full text-center text-sm font-bold mr-3 mt-0.5 shadow-sm">
                  ${recIndex + 1}
                </span>
                <span class="${colorInfo.textClass} leading-relaxed font-medium">${recText}</span>
              </div>
            `).join('')}
          </div>

          <div class="mt-6 pt-4 border-t ${colorInfo.textClass.replace('text-', 'border-')} border-opacity-30">
            <div class="flex flex-wrap gap-2">
              <span class="text-xs ${colorInfo.textClass} bg-white/50 px-3 py-1 rounded-full font-medium">
                💡 Tips Kesehatan
              </span>
              <span class="text-xs ${colorInfo.textClass} bg-white/50 px-3 py-1 rounded-full font-medium">
                🏥 Rekomendasi Medis
              </span>
              <span class="text-xs ${colorInfo.textClass} bg-white/50 px-3 py-1 rounded-full font-medium">
                ⏰ Update Real-time
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    setTimeout(() => {
      const cards = container.querySelectorAll('.insight-card');
      cards.forEach((card, index) => {
        (card as HTMLElement).style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in-up');
      });
    }, 100);
  } catch (error) {
    console.error('Error loading recommendations:', error);
  }
}

export function loadAqiStatistics(): void {
  const statsContainer = document.getElementById('aqi-statistics');
  if (!statsContainer) return;

  try {
    const locations = adminService.getLocations();
    const aqiValues = locations.map(loc => loc.aqi);
    
    const stats = {
      average: aqiValues.length > 0 ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) : 0,
      min: aqiValues.length > 0 ? Math.min(...aqiValues) : 0,
      max: aqiValues.length > 0 ? Math.max(...aqiValues) : 0,
      totalLocations: locations.length,
      statusDistribution: locations.reduce((acc, loc) => {
        acc[loc.status] = (acc[loc.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number })
    };

    statsContainer.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-teal-600">${stats.average}</div>
          <div class="text-sm text-gray-600">Rata-rata AQI</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-green-600">${stats.min}</div>
          <div class="text-sm text-gray-600">AQI Terendah</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-red-600">${stats.max}</div>
          <div class="text-sm text-gray-600">AQI Tertinggi</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">${stats.totalLocations}</div>
          <div class="text-sm text-gray-600">Total Lokasi</div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Distribusi Status Kualitas Udara</h3>
        <div class="space-y-3">
          ${Object.entries(stats.statusDistribution).map(([status, count]) => {
            const colorInfo = aqiColorMap[status] || aqiColorMap['Baik'];
            const percentage = Math.round((count / stats.totalLocations) * 100);
            return `
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-3" style="background-color: ${colorInfo.color}"></div>
                  <span class="text-sm font-medium text-gray-700">${status}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full" style="background-color: ${colorInfo.color}; width: ${percentage}%"></div>
                  </div>
                  <span class="text-sm font-semibold text-gray-600 w-12">${percentage}%</span>
                  <span class="text-sm text-gray-500 w-8 text-right">${count}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading AQI statistics:', error);
    statsContainer.innerHTML = '<p class="text-red-500">Error loading statistics</p>';
  }
}

export function loadHealthTips(): void {
  const tipsContainer = document.getElementById('health-tips');
  if (!tipsContainer) return;

  try {
    const locations = adminService.getLocations();
    const averageAqi = locations.length > 0 
      ? Math.round(locations.reduce((sum, loc) => sum + loc.aqi, 0) / locations.length)
      : 0;

    const recommendation = adminService.getRecommendationByAqi(averageAqi);
    const colorInfo = aqiColorMap[recommendation?.status || 'Baik'];

    tipsContainer.innerHTML = `
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <span class="text-lg">💡</span>
          </div>
          <h3 class="text-xl font-bold">Tips Kesehatan Hari Ini</h3>
        </div>
        
        <div class="mb-4">
          <div class="text-sm opacity-90">Status Kualitas Udara Saat Ini</div>
          <div class="text-2xl font-bold">${recommendation?.status || 'Baik'} (AQI ${averageAqi})</div>
        </div>

        <div class="space-y-3">
          ${recommendation ? recommendation.recommendations.slice(0, 3).map(tip => `
            <div class="flex items-start bg-white/10 rounded-lg p-3">
              <span class="text-teal-200 mr-2 mt-1">•</span>
              <span class="text-sm">${tip}</span>
            </div>
          `).join('') : `
            <div class="text-center py-4 opacity-90">
              <p>Data kualitas udara sedang dimuat...</p>
            </div>
          `}
        </div>

        <div class="mt-4 pt-4 border-t border-white/20">
          <p class="text-sm opacity-90 text-center">
            Terakhir diperbarui: ${new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading health tips:', error);
    tipsContainer.innerHTML = '<p class="text-red-500">Error loading health tips</p>';
  }
}

export function initializeInsights(): void {
  console.log('Initializing Insights Page...');
  
  loadDynamicRecommendations();
  loadAqiStatistics();
  loadHealthTips();

  if (!document.getElementById('insights-styles')) {
    const style = document.createElement('style');
    style.id = 'insights-styles';
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      .insight-card {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
  }

  console.log('Insights Page initialized successfully');
}

window.addEventListener('recommendationsUpdated', () => {
  loadDynamicRecommendations();
  loadAqiStatistics();
  loadHealthTips();
});

window.addEventListener('adminLocationsUpdated', () => {
  loadAqiStatistics();
  loadHealthTips();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeInsights);
} else {
  initializeInsights();
}

(window as any).Insights = {
  loadDynamicRecommendations,
  loadAqiStatistics,
  loadHealthTips,
  initializeInsights
};