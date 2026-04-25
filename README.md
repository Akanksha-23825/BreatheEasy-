# BreatheEasy+
**Personalized Air Quality Intelligence System**

> An interdisciplinary project that goes beyond raw AQI to deliver biologically personalized air quality risk assessment, cumulative exposure tracking, and proactive health advisories.

**Team CP07 · Semester 6 · RV College of Engineering**  
Akanksha N (IS) · Sahana Manohar Vernekar (CS) · Syeda Nooreen Fathima (BT) · Simna T M (CH)  
**Guide:** Dr. Vanishree K

---

## What is BreatheEasy+?

Most AQI apps show you a single number. BreatheEasy+ asks:
> *"What does this AQI mean for YOUR body and YOUR health condition?"*

A person with asthma faces 80% higher biological exposure than a healthy person at the exact same AQI. BreatheEasy+ accounts for this.

---

## Features

- **Health-Based Personalization** — Vulnerability Factors and sensitivity weights per health condition
- **Weighted Exposure Score (WES)** — Personalizes raw pollutant data to your biology
- **Risk Classification** — Low / Moderate / High based on YOUR exposure, not generic AQI
- **Safe Outdoor Time** — Exact hours you can safely be outside today
- **Cumulative Exposure Score (CES)** — Tracks biological exposure buildup across days
- **Safest Window** — Best time/day to go outside based on forecast
- **7-Day Forecast** — Best and worst days highlighted
- **Weekly Trend Chart** — EL and CES plotted over 7 days
- **Proactive Alerts** — Warns when AQI spikes or CES rises 3 days in a row

---

## Core Formulas

```
WES = (PM2.5 × w_pm25 × VF) + (PM10 × w_pm10 × VF) + (NO2 × w_no2 × VF) + (O3 × w_o3 × VF)

EL  = WES × Outdoor Hours

Safe Hours = DEC / Current AQI

CES[today] = CES[yesterday] × 0.7 + EL[today]
```

---

## Tech Stack

- **Backend** — Python, Flask, PostgreSQL, APScheduler
- **Frontend** — React.js, Recharts
- **ML** — scikit-learn, TensorFlow/Keras
- **APIs** — CPCB/OGD Portal, WAQI, Google Maps

---

## Getting Started

### Backend
```bash
cd breatheasy-backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-sqlalchemy psycopg2-binary requests python-dotenv numpy pandas scikit-learn tensorflow flask-cors apscheduler
flask run
```

### Frontend
```bash
cd breatheasy-frontend
npm install
npm start
```

### Environment Variables
Create `.env` in `breatheasy-backend/`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/breatheasy
CPCB_API_KEY=your_cpcb_api_key
WAQI_TOKEN=your_waqi_token
GOOGLE_MAPS_KEY=your_google_maps_key
SECRET_KEY=your_secret_key
```

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/aqi/<city>` | Live AQI + pollutants |
| `POST /api/register` | Register user with health profile |
| `GET /api/exposure/<id>` | Personalized WES, EL, risk |
| `GET /api/advisory/<id>` | Full daily advisory |
| `GET /api/trend/<id>` | 7-day trend data |
| `GET /api/forecast/<city>` | Multi-day forecast |

---

## Implementation Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Environment Setup | ✅ Done |
| Phase 2 | Database Schema | ✅ Done |
| Phase 3 | CPCB API + User Profile | ✅ Done |
| Phase 4 | WES, EL, Safe Time | ✅ Done |
| Phase 5 | CES Tracker + Advisory | ✅ Done |
| Phase 6 | ML Model (PELM) | ⏳ In Progress |
| Phase 7 | Frontend Dashboard | ✅ Done |
| Phase 8 | Integration Testing | ⏳ In Progress |

---

*Built with ❤️ by Team CP07 — RV College of Engineering, Bengaluru*
