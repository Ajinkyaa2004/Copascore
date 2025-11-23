import pandas as pd
import numpy as np

class StatsEngine:
    def __init__(self, data_path="data/match_data.csv"):
        self.df = pd.read_csv(data_path)
        self._prepare_data()

    def _prepare_data(self):
        # Ensure numeric columns are actually numeric
        cols_to_numeric = ['FTHG', 'FTAG', 'HS', 'AS', 'HST', 'AST', 'HC', 'AC', 'HY', 'AY', 'HR', 'AR']
        for col in cols_to_numeric:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')

    def get_team_stats(self, team_name):
        # Filter matches where the team played
        home_matches = self.df[self.df['HomeTeam'] == team_name]
        away_matches = self.df[self.df['AwayTeam'] == team_name]
        
        total_matches = len(home_matches) + len(away_matches)
        
        if total_matches == 0:
            return None

        # Calculate Wins, Draws, Losses
        home_wins = len(home_matches[home_matches['FTR'] == 'H'])
        away_wins = len(away_matches[away_matches['FTR'] == 'A'])
        wins = home_wins + away_wins
        
        home_draws = len(home_matches[home_matches['FTR'] == 'D'])
        away_draws = len(away_matches[away_matches['FTR'] == 'D'])
        draws = home_draws + away_draws
        
        losses = total_matches - wins - draws
        
        # Calculate Goals
        goals_scored = home_matches['FTHG'].sum() + away_matches['FTAG'].sum()
        goals_conceded = home_matches['FTAG'].sum() + away_matches['FTHG'].sum()
        
        # Calculate Shots
        shots = home_matches['HS'].sum() + away_matches['AS'].sum()
        shots_on_target = home_matches['HST'].sum() + away_matches['AST'].sum()
        
        # Calculate Corners
        corners = home_matches['HC'].sum() + away_matches['AC'].sum()
        
        # Calculate Cards
        yellows = home_matches['HY'].sum() + away_matches['AY'].sum()
        reds = home_matches['HR'].sum() + away_matches['AR'].sum()
        
        # Averages per match
        stats = {
            "matches_played": int(total_matches),
            "win_rate": float(wins / total_matches),
            "draw_rate": float(draws / total_matches),
            "loss_rate": float(losses / total_matches),
            "goals_scored_per_match": float(goals_scored / total_matches),
            "goals_conceded_per_match": float(goals_conceded / total_matches),
            "shots_per_match": float(shots / total_matches),
            "shots_on_target_per_match": float(shots_on_target / total_matches),
            "corners_per_match": float(corners / total_matches),
            "cards_per_match": float((yellows + reds) / total_matches), # Total cards
            "yellow_cards_per_match": float(yellows / total_matches),
            "red_cards_per_match": float(reds / total_matches)
        }
        
        return stats

    def get_comparison(self, home_team, away_team):
        home_stats = self.get_team_stats(home_team)
        away_stats = self.get_team_stats(away_team)
        
        if not home_stats or not away_stats:
            return None
            
        return {
            "home_team": home_team,
            "away_team": away_team,
            "home_stats": home_stats,
            "away_stats": away_stats
        }

if __name__ == "__main__":
    engine = StatsEngine()
    print(engine.get_comparison("Arsenal", "Chelsea"))
