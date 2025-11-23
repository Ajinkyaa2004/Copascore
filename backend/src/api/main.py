from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import xgboost as xgb
import shap
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from src.stats_engine import StatsEngine
from src.league_simulator import LeagueSimulator
from src.copa_bot import ScoreBot
from src.real_player_engine import RealPlayerEngine
from src.team_stats_engine import TeamStatsEngine
from src.fifa_player_engine import FIFAPlayerEngine

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and engines
model = None
le_team = None
le_target = None
stats_engine = None
league_simulator = None
score_bot = None
player_engine = None
team_stats_engine = None
fifa_player_engine = None
explainer = None

@app.on_event("startup")
async def load_artifacts():
    global model, le_team, le_target, stats_engine, league_simulator, score_bot, player_engine, team_stats_engine, fifa_player_engine, explainer
    
    print("Loading artifacts...")
    try:
        model = joblib.load("data/xgb_model.joblib")
        print("Model loaded.")
        
        le_team = joblib.load("data/le_team.joblib")
        print("Team encoder loaded.")
        
        le_target = joblib.load("data/le_target.joblib")
        print("Target encoder loaded.")
        
        # Try to load SHAP explainer
        try:
            explainer = joblib.load("data/shap_explainer.joblib")
            print("SHAP explainer loaded.")
        except:
            explainer = None
            print("SHAP explainer not found.")
        
        stats_engine = StatsEngine()
        print("Stats engine initialized.")
        
        league_simulator = LeagueSimulator()
        print("League simulator initialized.")
    
        score_bot = ScoreBot()
        print("ScoreBot initialized.")
        
        # Initialize RealPlayerEngine with Alexander Isak data
        player_engine = RealPlayerEngine()
        try:
            player_engine.load_api_data("data/alexander_isak.json")
            print("Real player data loaded successfully!")
        except Exception as e:
            print(f"Could not load real player data: {e}")
        print("Player engine initialized.")
        
        # Initialize TeamStatsEngine with Liverpool data
        team_stats_engine = TeamStatsEngine()
        try:
            team_stats_engine.load_team_data("data/liverpool_team.json")
            print("Team statistics engine loaded with Liverpool data!")
        except Exception as e:
            print(f"Could not load team data: {e}")
        print("Team stats engine initialized.")
        
        # Initialize FIFAPlayerEngine with all 17,956 players
        fifa_player_engine = FIFAPlayerEngine()
        try:
            fifa_player_engine.load_fifa_data("data/fifa_players.csv")
            print(f"FIFA player engine loaded with {fifa_player_engine.get_player_count()} players!")
        except Exception as e:
            print(f"Could not load FIFA data: {e}")
        print("FIFA player engine initialized.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")

class MatchRequest(BaseModel):
    home_team: str
    away_team: str
    b365h: float
    b365d: float
    b365a: float

class StatsRequest(BaseModel):
    home_team: str
    away_team: str

class ChatRequest(BaseModel):
    message: str

class PlayerRequest(BaseModel):
    team: str
    player: str

@app.get("/teams")
def get_teams():
    return {"teams": list(le_team.classes_)}

@app.post("/predict")
def predict_match(request: MatchRequest):
    try:
        # Encode teams
        home_code = le_team.transform([request.home_team])[0]
        away_code = le_team.transform([request.away_team])[0]
        
        # Create dataframe for prediction
        input_data = pd.DataFrame({
            'HomeTeam_Code': [home_code],
            'AwayTeam_Code': [away_code],
            'B365H': [request.b365h],
            'B365D': [request.b365d],
            'B365A': [request.b365a]
        })
        
        # Predict probabilities
        probs = model.predict_proba(input_data)[0]
        
        # Map probabilities to classes
        classes = le_target.classes_
        result = {class_name: float(prob) for class_name, prob in zip(classes, probs)}
        
        # SHAP values
        shap_explanation = []
        if explainer:
            try:
                shap_values = explainer.shap_values(input_data)
                # Format SHAP values for frontend (simplified)
                # shap_values is a list of arrays for each class. We'll take the max prob class explanation
                max_prob_idx = np.argmax(probs)
                shap_explanation = shap_values[max_prob_idx][0].tolist() if isinstance(shap_values, list) else shap_values[0].tolist()
            except Exception as e:
                print(f"SHAP error: {e}")
        
        return {
            "probabilities": result,
            "shap_values": shap_explanation,
            "feature_names": input_data.columns.tolist()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/stats")
def get_match_stats(request: StatsRequest):
    try:
        stats = stats_engine.get_comparison(request.home_team, request.away_team)
        if not stats:
            raise HTTPException(status_code=404, detail="Stats not found for one or both teams")
        return stats
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/simulate")
def simulate_season():
    try:
        table = league_simulator.simulate_season()
        return {"table": table}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_with_ai(request: ChatRequest):
    try:
        # Try using ScoreBot first
        if score_bot:
            response = score_bot.ask(request.message)
            return {"response": response}
    except Exception as e:
        print(f"ScoreBot error: {e}")
    
    # Fallback: Provide detailed match analysis based on message content
    message_lower = request.message.lower()
    
    # Extract team names and provide analysis
    if "home" in message_lower or "away" in message_lower or "match" in message_lower or "predict" in message_lower:
        return {
            "response": """**Match Analysis**

Based on the current prediction data, here's a comprehensive analysis:

**Key Factors:**
1. **Form & Momentum**: Recent performance trends heavily influence match outcomes. Teams on winning streaks typically show 15-20% higher win probability.

2. **Head-to-Head Record**: Historical matchups between these teams provide crucial context for tactical approaches and psychological advantages.

3. **Home Advantage**: Playing at home typically provides a 10-15% boost to win probability due to familiar conditions and crowd support.

4. **Tactical Matchups**: Consider how each team's playing style (possession-based vs counter-attacking) matches up against the opponent's strengths and weaknesses.

**Betting Insights:**
- If Home Win probability > 45%, consider backing the home team
- Draw probability > 30% suggests a tight, defensive match
- Check the Over/Under 2.5 goals based on both teams' recent scoring patterns

**Key Players to Watch:**
- Look for top-rated players (90+ overall) who can change the game
- Pay attention to player matchups in key positions (striker vs defender)

Would you like me to analyze specific tactical aspects or player matchups?"""
        }
    
    elif "stats" in message_lower or "performance" in message_lower:
        return {
            "response": """**Team Performance Metrics**

Here are the key statistical categories to consider:

**Offensive Stats:**
- Goals per match
- Shots on target percentage
- Expected goals (xG)
- Conversion rate

**Defensive Stats:**
- Goals conceded per match
- Clean sheet percentage
- Tackles and interceptions
- Expected goals against (xGA)

**Overall Form:**
- Win/Draw/Loss record in last 5 matches
- Points per game
- Goal difference

You can view detailed statistics for specific teams on the Standings page!"""
        }
    
    elif "bet" in message_lower or "odds" in message_lower:
        return {
            "response": """**Betting Strategy Tips**

**Value Betting:**
Look for matches where the prediction probability differs significantly from bookmaker odds. For example:
- If model shows 50% home win, but odds suggest 40%, that's value!

**Recommended Bet Types:**
1. **1X2 (Match Result)**: Straightforward but requires accurate prediction
2. **Both Teams To Score**: Good for high-scoring teams
3. **Over/Under Goals**: Analyze team's scoring patterns
4. **Asian Handicap**: Reduces draw risk

**Bankroll Management:**
- Never bet more than 2-5% of total bankroll on single match
- Track all bets to identify profitable strategies
- Consider combination bets for higher odds

Check the "Best Bets Today" section for AI-recommended wagers!"""
        }
    
    # Default helpful response
    return {
        "response": """👋 Hello! I'm your AI Match Analyst powered by advanced prediction models.

**I can help you with:**

🎯 **Match Predictions** - Ask about specific matchups
📊 **Team Statistics** - Request performance data and trends  
⚽ **Player Analysis** - Get insights on key players
💰 **Betting Insights** - Understand value bets and strategies
🏆 **Tactical Analysis** - Learn about team formations and styles

**Try asking:**
- "What are the key factors for this match?"
- "Tell me about betting strategies"
- "Analyze the teams' recent performance"

How can I assist you today?"""
    }

@app.get("/players/{team}")
def get_team_players(team: str):
    try:
        players = player_engine.get_team_players(team)
        return {"players": players}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/player-card")
def get_player_card(request: PlayerRequest):
    try:
        card = player_engine.get_player_card(request.team, request.player)
        if not card:
            raise HTTPException(status_code=404, detail="Player not found")
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/team-form/{team}")
def get_team_form(team: str, matches: int = 5):
    """Get recent form for a team"""
    try:
        form = team_stats_engine.get_recent_form(team, matches)
        if not form:
            raise HTTPException(status_code=404, detail="Team not found")
        return form
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/team-stats/{team}")
def get_team_average_stats(team: str, matches: int = 5):
    """Get average statistics for a team over last N matches"""
    try:
        stats = team_stats_engine.get_average_stats(team, matches)
        if not stats:
            raise HTTPException(status_code=404, detail="Team not found")
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/team-info/{team}")
def get_team_information(team: str):
    """Get basic team information"""
    try:
        info = team_stats_engine.get_team_info(team)
        if not info:
            raise HTTPException(status_code=404, detail="Team not found")
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FIFA Player Endpoints
@app.get("/fifa/search")
def search_fifa_players(
    query: str = "",
    team: str = None,
    position: str = None,
    nationality: str = None,
    min_rating: int = 0,
    max_results: int = 50
):
    """Search FIFA players with filters"""
    try:
        results = fifa_player_engine.search_players(
            query=query,
            team=team,
            position=position,
            nationality=nationality,
            min_rating=min_rating,
            max_results=max_results
        )
        return {"players": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fifa/player/{player_name}")
def get_fifa_player_card(player_name: str):
    """Get detailed FIFA player card"""
    try:
        card = fifa_player_engine.get_player_card(player_name)
        if not card:
            raise HTTPException(status_code=404, detail="Player not found")
        return card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fifa/top-players")
def get_top_fifa_players(limit: int = 100):
    """Get top rated FIFA players"""
    try:
        players = fifa_player_engine.get_top_players(limit=limit)
        return {"players": players, "count": len(players)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fifa/stats")
def get_fifa_database_stats():
    """Get FIFA database statistics"""
    try:
        return {
            "total_players": fifa_player_engine.get_player_count(),
            "database": "FIFA Players Database",
            "version": "2019"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
