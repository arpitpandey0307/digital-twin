# 🏙️ CityTwin AI — Digital Twin Decision Intelligence Platform

> An AI-powered simulation platform for city administrators. One AI assistant instead of dozens of dashboards.

## 🎯 What It Does

City administrators face a problem: too many dashboards, too much data, too little time. CityTwin AI solves this by combining:

- **Real-time data ingestion** — weather, AQI, traffic, citizen complaints
- **5 AI Agents** — Analyst, Predictor, Vision AI, Gemini Reasoner, Recommender
- **Decision Intelligence Engine** — orchestrates agents to produce actionable insights
- **What-If Simulator** — change one variable, see cascading effects across the city
- **AI Chat (RAG)** — ask questions in plain English, get data-backed answers

## 🏗 Architecture

```
DATA SOURCES → PROCESSING → KNOWLEDGE BASE → AI AGENTS → DECISION ENGINE → USER
(Weather, AQI,   (FastAPI)    (SQLite +         (5 agents)   (Orchestrator)   (React UI)
 Traffic, Compl.)              Gemini)
```

## 🚀 Quick Start

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env      # Add your Gemini API key
uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## 📱 Pages

| Page | Description |
|------|-------------|
| **Landing** | Hero + feature overview |
| **Dashboard** | Risk score, weather, AQI, complaints, alerts — one screen |
| **AI Chat** | Ask questions in English, get AI answers with city data |
| **Simulator** | What-if scenarios with cascading impact analysis |
| **City Map** | Leaflet map with wards, hospitals, shelters, flood zones |
| **Complaints** | AI auto-classification of citizen issues |
| **Analytics** | Trends, ward comparisons, department performance |
| **Alerts** | Acknowledge/resolve alerts from AI predictions |
| **Reports** | Auto-generated daily/monthly AI reports |
| **Settings** | User profile, notification preferences |

## 🧠 AI Features

- **Gemini 2.5 Flash** — complaint analysis, chat, simulation, vision
- **RAG Pipeline** — context-aware answers using real city data
- **Predictive Models** — flood risk, traffic, AQI per ward
- **Auto-Recommendations** — infrastructure-aware action suggestions
- **Vision AI** — analyze citizen-uploaded images

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Recharts, Leaflet, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **AI**: Google Gemini 2.5 Flash
- **APIs**: OpenWeatherMap, AQICN (with mock fallbacks)

## 👥 Team

Built for the Gen AI APAC Hackathon 2026.
