// Test script to check API connectivity
const UPDATE_API = "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/prod/update-data";
const DELETE_API = "https://mxt1hpstz6.execute-api.ap-southeast-1.amazonaws.com/delete-data";

async function testAPI() {
  console.log("Testing UPDATE API...");

  try {
    // Test OPTIONS request (CORS preflight)
    const optionsResponse = await fetch(UPDATE_API, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3002",
      },
    });

    console.log("OPTIONS Response status:", optionsResponse.status);
    console.log("CORS headers:", {
      "Access-Control-Allow-Origin": optionsResponse.headers.get("access-control-allow-origin"),
      "Access-Control-Allow-Methods": optionsResponse.headers.get("access-control-allow-methods"),
      "Access-Control-Allow-Headers": optionsResponse.headers.get("access-control-allow-headers"),
    });

    // Test actual POST request with sample data
    const testData = {
      action: "update",
      token: "test-token",
      DeviceID_Tanggal: "RSU2#2025-10-03",
      Timestamp: "2025-10-03 20:20",
      updates: {
        AQI: 90,
        latitude: -8.6712,
        longitude: 115.2229,
      },
    };

    console.log("Sending test request:", JSON.stringify(testData, null, 2));

    const postResponse = await fetch(UPDATE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("POST Response status:", postResponse.status);
    const responseText = await postResponse.text();
    console.log("POST Response body:", responseText);
  } catch (error) {
    console.error("API test failed:", error);
  }
}

testAPI();
