# ScoreApp Quick Start Guide

## 🎯 What is ScoreApp?

ScoreApp is an AI-powered football match prediction system that uses real player and team data to predict match outcomes with confidence scores.

## 🚀 Getting Started

### 1. **Match Predictor** (Main Feature)
- Select **Home Team** and **Away Team** from dropdowns
- Adjust betting odds (optional - defaults provided)
- Click **"Predict Match"**
- View:
  - Win/Draw/Away probabilities
  - Prediction confidence meter
  - Head-to-head statistics
  - **Recent form** (W/L/D for last 5 matches)
  - Goals scored/conceded
  - Goal difference

### 2. **Real Data Integration**
The app now uses **real professional data**:
- ✅ **Liverpool** team statistics (recent matches)
- ✅ **Alexander Isak** player card (23 goals, 7 trophies)
- ✅ Expected Goals (xG) calculations
- ✅ Match-by-match performance data

### 3. **Player Comparison**
- Navigate to **"Player Comparison"** tab
- Select teams to see available players
- Compare FIFA-style radar stats:
  - Attack, Technique, Speed
  - Power, Defense, Stamina
- View career statistics and trophies

### 4. **League Simulator**
- Click **"Show Predicted Final Table"**
- See AI-predicted final standings
- Based on current form and statistics

### 5. **Score AI Assistant**
- Ask questions about:
  - Team performance
  - Player statistics
  - Match predictions
  - Historical data

## 📊 Understanding the Interface

### Form Indicators
- **W** = Win (Green)
- **D** = Draw (Yellow)
- **L** = Loss (Red)

### Confidence Meter
- **Green** (>50%) = High confidence
- **Yellow** (40-50%) = Medium confidence
- **Red** (<40%) = Low confidence

### Statistics
- **GD** = Goal Difference
- **W-D-L** = Wins-Draws-Losses
- **xG** = Expected Goals (quality of chances)

## 🎮 Tips for Best Results

1. **Check Recent Form** - Teams on winning streaks are more likely to win
2. **Compare Goal Difference** - Higher GD indicates stronger team
3. **Review Confidence Score** - Higher confidence = more reliable prediction
4. **Use Real Odds** - More accurate odds = better predictions

## 🔧 Technical Details

- **Backend**: Python FastAPI (Port 8007)
- **Frontend**: Next.js (Port 3000)
- **Data Source**: SportMonks API
- **ML Model**: XGBoost with SHAP explanations

## ❓ Troubleshooting

**No predictions showing?**
- Check both backend (port 8007) and frontend (port 3000) are running
- Verify team names are selected
- Check browser console for errors

**No team form data?**
- Currently only Liverpool has real data loaded
- Other teams use historical statistics

**Player cards not loading?**
- Only Alexander Isak has real data currently
- More players will be added soon

## 🎯 Next Features Coming

- [ ] More player data integration
- [ ] Live match tracking
- [ ] xG visualization charts
- [ ] Team comparison view
- [ ] Historical head-to-head records

---

**Enjoy predicting matches with AI! ⚽🤖**
