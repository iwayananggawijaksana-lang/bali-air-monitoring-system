export interface HistoryData {
  DeviceID: string;
  Timestamp: string;
  AQI: number;
  MQ7: number;
  GP2Y1010: number;
  latitude: number;
  longitude: number;
}

export interface HistoryResponse {
  items: HistoryData[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface ChartData {
  labels: string[];
  pm25: number[];
  co: number[];
  note?: string;
}

export const fetchHistoryList = async (
  date: string, 
  period: string, 
  page: number = 1
): Promise<HistoryResponse> => {
  try {
    // Mock implementation untuk development
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: HistoryData[] = [
      {
        DeviceID: 'RSU1',
        Timestamp: new Date().toISOString(),
        AQI: 45,
        MQ7: 0.5,
        GP2Y1010: 12.3,
        latitude: -8.6705,
        longitude: 115.2126
      },
      {
        DeviceID: 'RSU2',
        Timestamp: new Date().toISOString(),
        AQI: 78,
        MQ7: 0.8,
        GP2Y1010: 25.6,
        latitude: -8.5925,
        longitude: 115.1631
      },
      {
        DeviceID: 'RSU3',
        Timestamp: new Date().toISOString(),
        AQI: 120,
        MQ7: 1.2,
        GP2Y1010: 35.8,
        latitude: -8.795,
        longitude: 115.175
      }
    ];

    return {
      items: mockData,
      total: mockData.length,
      page,
      hasMore: false
    };
  } catch (error) {
    console.error('Error fetching history list:', error);
    throw new Error('Failed to fetch history data');
  }
};

export const fetchHistoryDetail = async (
  deviceId: string, 
  date: string, 
  period: string
): Promise<ChartData> => {
  try {
    // Mock implementation untuk development
    await new Promise(resolve => setTimeout(resolve, 300));

    const labels = generateTimeLabels(period);
    const pm25 = generateDemoData('pm25', labels.length);
    const co = generateDemoData('co', labels.length);

    return {
      labels,
      pm25,
      co,
      note: `Data untuk perangkat ${deviceId} - ${period}`
    };
  } catch (error) {
    console.error('Error fetching history detail:', error);
    throw new Error('Failed to fetch chart data');
  }
};

// Helper functions
function generateTimeLabels(period: string): string[] {
  const now = new Date();
  const labels: string[] = [];
  
  switch (period) {
    case 'hour':
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        labels.push(time.getHours().toString().padStart(2, '0') + ':00');
      }
      break;
    case 'day':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 86400000);
        labels.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));
      }
      break;
    case 'week':
      for (let i = 3; i >= 0; i--) {
        labels.push(`Minggu ${i + 1}`);
      }
      break;
    default:
      for (let i = 23; i >= 0; i--) {
        labels.push(`${i}:00`);
      }
  }
  
  return labels;
}

function generateDemoData(type: 'pm25' | 'co', count: number): number[] {
  const data: number[] = [];
  const base = type === 'pm25' ? 20 : 1;
  
  for (let i = 0; i < count; i++) {
    data.push(base + Math.random() * (type === 'pm25' ? 30 : 2));
  }
  
  return data;
}