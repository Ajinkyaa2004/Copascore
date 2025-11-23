"""
Team Statistics Engine for Real-Time Match Data
Processes SportMonks API team data to generate comprehensive team statistics
"""

import json
from typing import Dict, List, Optional
from datetime import datetime


class TeamStatsEngine:
    """
    Processes real team data from SportMonks API to generate:
    - Recent form analysis
    - Performance metrics
    - Head-to-head statistics
    - Expected goals (xG) trends
    """
    
    def __init__(self):
        self.teams_data = {}
        
    def load_team_data(self, filepath: str):
        """Load team data from SportMonks API JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
            team_name = data.get('name')
            self.teams_data[team_name] = data
            
    def get_recent_form(self, team_name: str, num_matches: int = 5) -> Dict:
        """
        Analyze recent form from last N matches
        Returns: wins, draws, losses, goals_for, goals_against, form_string
        """
        team_data = self.teams_data.get(team_name)
        if not team_data or 'latest' not in team_data:
            return None
            
        matches = team_data['latest'][:num_matches]
        team_id = team_data['id']
        
        wins = 0
        draws = 0
        losses = 0
        goals_for = 0
        goals_against = 0
        form = []
        
        for match in matches:
            # Find team's score
            team_score = None
            opponent_score = None
            
            for score in match.get('scores', []):
                if score.get('description') == 'CURRENT':
                    if score.get('participant_id') == team_id:
                        team_score = score.get('score', {}).get('goals', 0)
                    else:
                        opponent_score = score.get('score', {}).get('goals', 0)
            
            if team_score is not None and opponent_score is not None:
                goals_for += team_score
                goals_against += opponent_score
                
                if team_score > opponent_score:
                    wins += 1
                    form.append('W')
                elif team_score < opponent_score:
                    losses += 1
                    form.append('L')
                else:
                    draws += 1
                    form.append('D')
        
        return {
            'matches_played': len(matches),
            'wins': wins,
            'draws': draws,
            'losses': losses,
            'goals_for': goals_for,
            'goals_against': goals_against,
            'goal_difference': goals_for - goals_against,
            'form_string': ''.join(form),
            'points': wins * 3 + draws
        }
    
    def get_match_statistics(self, team_name: str, match_index: int = 0) -> Dict:
        """
        Get detailed statistics for a specific match
        match_index: 0 = most recent, 1 = second most recent, etc.
        """
        team_data = self.teams_data.get(team_name)
        if not team_data or 'latest' not in team_data:
            return None
            
        if match_index >= len(team_data['latest']):
            return None
            
        match = team_data['latest'][match_index]
        team_id = team_data['id']
        
        stats = {
            'match_name': match.get('name'),
            'date': match.get('starting_at'),
            'result': match.get('result_info'),
            'team_stats': {},
            'xg_stats': {}
        }
        
        # Extract team statistics
        for stat in match.get('statistics', []):
            if stat.get('participant_id') == team_id:
                stat_code = stat.get('type', {}).get('code')
                stat_value = stat.get('data', {}).get('value')
                stats['team_stats'][stat_code] = stat_value
        
        # Extract xG statistics
        for xg_stat in match.get('xgfixture', []):
            if xg_stat.get('participant_id') == team_id:
                xg_code = xg_stat.get('type', {}).get('code')
                xg_value = xg_stat.get('data', {}).get('value')
                stats['xg_stats'][xg_code] = xg_value
        
        return stats
    
    def get_average_stats(self, team_name: str, num_matches: int = 5) -> Dict:
        """
        Calculate average statistics over last N matches
        """
        team_data = self.teams_data.get(team_name)
        if not team_data or 'latest' not in team_data:
            return None
            
        matches = team_data['latest'][:num_matches]
        team_id = team_data['id']
        
        # Accumulate stats
        total_stats = {}
        total_xg = {}
        count = 0
        
        for match in matches:
            # Team statistics
            for stat in match.get('statistics', []):
                if stat.get('participant_id') == team_id:
                    stat_code = stat.get('type', {}).get('code')
                    stat_value = stat.get('data', {}).get('value', 0)
                    total_stats[stat_code] = total_stats.get(stat_code, 0) + stat_value
            
            # xG statistics
            for xg_stat in match.get('xgfixture', []):
                if xg_stat.get('participant_id') == team_id:
                    xg_code = xg_stat.get('type', {}).get('code')
                    xg_value = xg_stat.get('data', {}).get('value', 0)
                    total_xg[xg_code] = total_xg.get(xg_code, 0) + xg_value
            
            count += 1
        
        # Calculate averages
        avg_stats = {k: round(v / count, 2) for k, v in total_stats.items()}
        avg_xg = {k: round(v / count, 2) for k, v in total_xg.items()}
        
        return {
            'matches_analyzed': count,
            'average_stats': avg_stats,
            'average_xg': avg_xg
        }
    
    def get_team_comparison(self, team1: str, team2: str) -> Dict:
        """
        Compare two teams based on recent form and statistics
        """
        form1 = self.get_recent_form(team1)
        form2 = self.get_recent_form(team2)
        
        avg1 = self.get_average_stats(team1)
        avg2 = self.get_average_stats(team2)
        
        if not all([form1, form2, avg1, avg2]):
            return None
        
        return {
            'team1': {
                'name': team1,
                'form': form1,
                'averages': avg1
            },
            'team2': {
                'name': team2,
                'form': form2,
                'averages': avg2
            },
            'comparison': {
                'points_difference': form1['points'] - form2['points'],
                'goal_difference_comparison': form1['goal_difference'] - form2['goal_difference'],
                'form_advantage': team1 if form1['points'] > form2['points'] else team2
            }
        }
    
    def get_team_info(self, team_name: str) -> Dict:
        """Get basic team information"""
        team_data = self.teams_data.get(team_name)
        if not team_data:
            return None
            
        return {
            'id': team_data.get('id'),
            'name': team_data.get('name'),
            'short_code': team_data.get('short_code'),
            'founded': team_data.get('founded'),
            'image_path': team_data.get('image_path'),
            'last_played': team_data.get('last_played_at')
        }
