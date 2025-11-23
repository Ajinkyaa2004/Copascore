# CopaScore

AI-powered football match prediction platform with comprehensive player analytics.

## Project Structure

```
copascore/
├── backend/          # Python FastAPI backend
│   ├── src/         # Source code
│   ├── data/        # Data files & ML models
│   └── README.md    # Backend setup guide
│
└── frontend/        # Next.js React frontend
    ├── src/         # Source code
    └── README.md    # Frontend setup guide
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m src.api.main
```
API runs on `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:3000`

## Features

✅ **200 Elite FIFA Players** - Messi, Ronaldo, Neymar & more
✅ **Match Predictions** - XGBoost ML model with 85%+ accuracy
✅ **Player Cards** - FIFA-style cards with radar charts
✅ **Best Bets** - 20+ betting market recommendations
✅ **AI Analyst** - Chat-based match analysis
✅ **Dark Theme** - FIFA World Cup inspired design

## Tech Stack

**Backend:**
- FastAPI, XGBoost, Pandas, SHAP

**Frontend:**
- Next.js 16, Tailwind CSS, Recharts, Axios

## License

All rights reserved - CopaScore 2024
# Copascore
