import re
import pandas as pd
import joblib
from src.stats_engine import StatsEngine
from src.league_simulator import LeagueSimulator

class ScoreBot:
    def __init__(self):
        self.stats_engine = StatsEngine()
        self.league_simulator = LeagueSimulator()
        self.le_team = joblib.load("data/le_team.joblib")
        self.teams = list(self.le_team.classes_)
        self.teams_lower = [t.lower() for t in self.teams]

    def _find_teams(self, query):
        found_teams = []
        query_lower = query.lower()
        for i, team in enumerate(self.teams_lower):
            if team in query_lower:
                found_teams.append(self.teams[i])
        return found_teams

    def ask(self, query):
        query = query.lower()
        found_teams = self._find_teams(query)

        # Intent: Prediction / Winner
        if "predict" in query or "win" in query or "winner" in query:
            if len(found_teams) == 2:
                # Simulate a match prediction
                # We need odds, but for the bot we'll use average odds from the simulator
                home, away = found_teams[0], found_teams[1]
                
                # Get average odds for home team at home
                h_odds = self.league_simulator.avg_odds[home]['home']
                
                # Create input for model (reusing logic from api/simulator would be best, but duplicating for speed here)
                home_code = self.le_team.transform([home])[0]
                away_code = self.le_team.transform([away])[0]
                
                input_data = pd.DataFrame({
                    'HomeTeam_Code': [home_code],
                    'AwayTeam_Code': [away_code],
                    'B365H': [h_odds['win']],
                    'B365D': [h_odds['draw']],
                    'B365A': [h_odds['loss']]
                })
                
                probs = self.league_simulator.model.predict_proba(input_data)[0]
                # Classes: Away, Draw, Home
                prob_a = probs[0]
                prob_d = probs[1]
                prob_h = probs[2]
                
                winner = "Draw"
                if prob_h > prob_a and prob_h > prob_d:
                    winner = home
                elif prob_a > prob_h and prob_a > prob_d:
                    winner = away
                
                return f"Based on my analysis for {home} vs {away}, I predict **{winner}** to win. \n\nProbabilities:\n- {home}: {prob_h*100:.1f}%\n- {away}: {prob_a*100:.1f}%\n- Draw: {prob_d*100:.1f}%"
            
            elif len(found_teams) == 1:
                return f"Who is {found_teams[0]} playing against? Please specify two teams for a prediction."

        # Intent: Stats
        if "stats" in query or "performance" in query:
            if len(found_teams) > 0:
                team = found_teams[0]
                stats = self.stats_engine.get_stats(team)
                if stats:
                    return (f"**{team} 2020-2021 Stats:**\n"
                            f"- Win Rate: {stats['win_rate']*100:.1f}%\n"
                            f"- Goals/Match: {stats['goals_scored_per_match']:.2f}\n"
                            f"- Shots/Match: {stats['shots_per_match']:.2f}\n"
                            f"- Corners/Match: {stats['corners_per_match']:.2f}")
                else:
                    return f"I couldn't find stats for {team}."

        # Intent: Comparison
        if "compare" in query or "better" in query:
            if len(found_teams) == 2:
                t1, t2 = found_teams[0], found_teams[1]
                s1 = self.stats_engine.get_stats(t1)
                s2 = self.stats_engine.get_stats(t2)
                
                better_team = t1 if s1['win_rate'] > s2['win_rate'] else t2
                
                return (f"**Comparison: {t1} vs {t2}**\n\n"
                        f"**{t1}**:\n- Win Rate: {s1['win_rate']*100:.1f}%\n- Goals: {s1['goals_scored_per_match']:.2f}\n\n"
                        f"**{t2}**:\n- Win Rate: {s2['win_rate']*100:.1f}%\n- Goals: {s2['goals_scored_per_match']:.2f}\n\n"
                        f"Historically, **{better_team}** has a better win rate.")

        # Intent: League Table
        if "table" in query or "standings" in query or "rank" in query:
            return "You can view the full predicted league table by clicking the 'Show Predicted Final Table' button on the Predictions page! I can simulate the whole season for you."

        # Default
        return "I can help you with match predictions, team stats, and comparisons. Try asking: 'Predict Arsenal vs Chelsea' or 'Stats for Liverpool'."

if __name__ == "__main__":
    bot = ScoreBot()
    print(bot.ask("Predict Arsenal vs Chelsea"))
    print(bot.ask("Stats for Liverpool"))
