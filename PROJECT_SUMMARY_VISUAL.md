# 🌿 BreatheEasy+ Project Summary

| Feature | Description |
| :--- | :--- |
| **Main Goal** | Minimize air pollution exposure during city travel. |
| **Target Users** | Asthma patients, Children, Elderly, and Health-conscious individuals. |
| **Primary City** | Bangalore, India (Optimized geocoding & fallbacks). |
| **Key Tech** | Python, Flask, Leaflet.js, OpenStreetMap (ORS). |

---

## 🚦 Why BreatheEasy+?

| Standard GPS | BreatheEasy+ |
| :--- | :--- |
| Finds the **Fastest** route. | Finds the **Healthiest** route. |
| Only cares about **Time**. | Cares about **Exposure (PM2.5, NO2, etc.)**. |
| Static Map. | **Live Heatmap** (Green to Purple colors). |

---

## 🧩 The 3 Pillars of the System

### 1. 🔍 Precision Geocoding
- Search for any location in Bangalore.
- Powered by Nominatim (OSM).

### 2. 🧪 The WES Algorithm
- **Weighted Exposure Score**: A unique formula that factors in **Breathing Rate** and **Pollutant Sensitivity**.
- *Example*: A child breathing faster at a busy junction gets a higher (riskier) score than a healthy adult.

### 3. 🗺️ Visual Routing
- High-fidelity map with turn-by-turn directions.
- Clear recommendation flags for the best health route.

---

## ⚡ Technical Highlights
- **Parallel Sampling**: Fetches AQI for entire routes in parallel threads (High Speed).
- **Regional Fallbacks**: If a sensor is offline, the system estimates AQI based on the city zone (North, South, etc.).
- **Responsive UI**: Works perfectly on modern browsers with zero lag.

---
> "Because the shortest path isn't always the safest path."
