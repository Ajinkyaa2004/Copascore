# CopaScore Backend

Football match prediction API powered by XGBoost machine learning model.

## Features

- Match outcome predictions (Home/Draw/Away)
- Player statistics (17,000+ FIFA players)
- Team performance analytics
- AI-powered match analysis
- Betting recommendations

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
# From backend directory
python -m src.api.main

# Or with uvicorn
uvicorn src.api.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /predict` - Get match predictions
- `GET /fifa/top-players` - Get top FIFA players
- `GET /fifa/search` - Search for players
- `GET /fifa/player/{name}` - Get player details
- `POST /chat` - AI match analyst
- `GET /players/{team}` - Get team players

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   └── main.py          # FastAPI application
│   ├── copa_bot.py          # AI chat bot
│   ├── fifa_player_engine.py # Player data engine
│   ├── league_simulator.py   # League simulation
│   ├── real_player_engine.py # Real player data
│   ├── stats_engine.py       # Statistics engine
│   └── team_stats_engine.py  # Team statistics
├── data/
│   ├── fifa_players.csv      # 200 elite players
│   ├── match_data.csv        # Historical matches
│   ├── xgb_model.joblib      # Trained ML model
│   └── ...
└── requirements.txt
```

## Tech Stack

- **Framework**: FastAPI
- **ML**: XGBoost, Scikit-learn
- **Data**: Pandas, NumPy
- **Analysis**: SHAP (explainable AI)
