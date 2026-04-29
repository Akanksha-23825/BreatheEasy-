# 🌬️ BreatheEasy+ 
> **Smart Navigation for a Healthier You.**

BreatheEasy+ is a specialized navigation system designed for cities with high air pollution (like Bangalore). It doesn't just find the fastest route; it finds the **safest route for your lungs** by analyzing real-time air quality data.

---

## 🚀 The "Big Idea"
Traditional GPS apps care about traffic. We care about **you**. 
If taking a 5-minute longer route reduces your exposure to harmful PM2.5 by 40%, BreatheEasy+ will tell you.

---

## ✨ Features that Wow
*   **🩺 Health Profiles**: Choose your condition (Asthma, Heart Patient, Pregnant, Elderly, or Child). The app customizes its logic for you.
*   **🔥 Live Heatmap Routes**: Watch the road change colors on your map! Green means safe air, while Purple means high pollution zones.
*   **⚡ Lightning Fast**: Uses parallel processing to check air quality at 20+ points along your journey in less than a second.
*   **📊 Smart Advisory**: Get personalized medical advice based on current air quality (e.g., "Safe for 2 hours" or "Wear an N95 mask").

---

## 🛠️ How it works (The Simple Version)
1.  **Search**: You enter where you want to go.
2.  **Analyze**: The system "walks" 3 different routes virtually.
3.  **Calculate**: It fetches real-time sensor data from the nearest CPCB stations every 500 meters.
4.  **Recommend**: It calculates a **Weighted Exposure Score (WES)** and highlights the healthiest path in **Glowing Orange**.

---

## 🏃 Quick Start (Run it in 2 Minutes)

### 1. Backend (The Brain)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 2. Frontend (The Map)
Just open `frontend/directions_demo.html` in your browser. 
*(Make sure the backend is running first!)*

---

## 📂 Project Structure
- 🧠 **`backend/`**: Python server handling all the math and data fetching.
- 🗺️ **`frontend/`**: The interactive map interface.
- 📖 **`PROJECT_OVERVIEW.md`**: Deep technical details (for the curious).

---

## 🛡️ Built With
- **Python / Flask** (Backend Logic)
- **Leaflet.js** (Map Visualization)
- **OpenRouteService** (GPS Routing)
- **WAQI API** (Real-time Air Quality)

---
*Created for the Interdisciplinary Project (IDP) 2025.*
