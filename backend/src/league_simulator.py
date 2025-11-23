import pandas as pd
import numpy as np

class LeagueSimulator:
    def __init__(self):
        self.teams = []

    def simulate_season(self):
        # Mock simulation returning a random table
        teams = ["Manchester City", "Arsenal", "Liverpool", "Aston Villa", "Tottenham", "Chelsea", "Newcastle", "Manchester Utd"]
        table = []
        for i, team in enumerate(teams):
            table.append({
                "position": i + 1,
                "team": team,
                "played": 38,
                "won": np.random.randint(20, 30) - i,
                "drawn": np.random.randint(5, 10),
                "lost": np.random.randint(0, 10) + i,
                "points": 0 # Calculate points
            })
        
        for row in table:
            row['points'] = row['won'] * 3 + row['drawn']
            
        # Sort by points
        table.sort(key=lambda x: x['points'], reverse=True)
        
        # Update positions
        for i, row in enumerate(table):
            row['position'] = i + 1
            
        return table
