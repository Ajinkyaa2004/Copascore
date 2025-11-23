import pandas as pd
import numpy as np

class FIFAPlayerEngine:
    def __init__(self):
        self.df = None

    def load_fifa_data(self, filepath):
        try:
            self.df = pd.read_csv(filepath)
            
            # Create short_name from name if it doesn't exist
            if 'short_name' not in self.df.columns and 'name' in self.df.columns:
                self.df['short_name'] = self.df['name']
            
            # Standardize column names from CSV to expected names
            rename_map = {}
            if 'overall_rating' in self.df.columns:
                rename_map['overall_rating'] = 'overall'
            if 'nationality' in self.df.columns:
                rename_map['nationality'] = 'nationality_name'
            if 'positions' in self.df.columns:
                rename_map['positions'] = 'player_positions'
                
            if rename_map:
                self.df.rename(columns=rename_map, inplace=True)
            
            # Calculate pace from acceleration and sprint_speed if not present
            if 'pace' not in self.df.columns:
                if 'acceleration' in self.df.columns and 'sprint_speed' in self.df.columns:
                    self.df['pace'] = ((self.df['acceleration'].fillna(0) + self.df['sprint_speed'].fillna(0)) / 2).astype(int)
                else:
                    self.df['pace'] = 70
            
            # Calculate shooting from finishing if not present
            if 'shooting' not in self.df.columns:
                if 'finishing' in self.df.columns:
                    self.df['shooting'] = self.df['finishing'].fillna(70)
                else:
                    self.df['shooting'] = 70
                    
            # Calculate passing from short_passing if not present  
            if 'passing' not in self.df.columns:
                if 'short_passing' in self.df.columns:
                    self.df['passing'] = self.df['short_passing'].fillna(70)
                else:
                    self.df['passing'] = 70
                    
            # Calculate physic from strength and stamina if not present
            if 'physic' not in self.df.columns:
                if 'strength' in self.df.columns and 'stamina' in self.df.columns:
                    self.df['physic'] = ((self.df['strength'].fillna(0) + self.df['stamina'].fillna(0)) / 2).astype(int)
                else:
                    self.df['physic'] = 70
                    
            # Ensure defending column exists
            if 'defending' not in self.df.columns:
                if 'marking' in self.df.columns and 'standing_tackle' in self.df.columns:
                    self.df['defending'] = ((self.df['marking'].fillna(0) + self.df['standing_tackle'].fillna(0)) / 2).astype(int)
                else:
                    self.df['defending'] = 70
                    
            # Map club_name from national_team
            if 'club_name' not in self.df.columns and 'national_team' in self.df.columns:
                self.df['club_name'] = self.df['national_team']
                
        except Exception as e:
            print(f"Error loading FIFA data: {e}")
            self.df = pd.DataFrame()

    def get_player_count(self):
        return len(self.df) if self.df is not None else 0

    def search_players(self, query="", team=None, position=None, nationality=None, min_rating=0, max_results=50):
        if self.df is None or len(self.df) == 0:
            return []
        
        try:
            mask = pd.Series([True] * len(self.df))
            
            if query:
                mask &= self.df['short_name'].str.contains(query, case=False, na=False)
            if team:
                # Search in club_name if it exists
                if 'club_name' in self.df.columns:
                    mask &= self.df['club_name'].str.contains(team, case=False, na=False)
            if position:
                if 'player_positions' in self.df.columns:
                    mask &= self.df['player_positions'].str.contains(position, case=False, na=False)
            if nationality:
                if 'nationality_name' in self.df.columns:
                    mask &= self.df['nationality_name'].str.contains(nationality, case=False, na=False)
            if min_rating > 0:
                if 'overall' in self.df.columns:
                    mask &= (self.df['overall'] >= min_rating)
                
            results = self.df[mask].head(max_results).copy()
            
            # Replace NaN with appropriate defaults
            numeric_cols = results.select_dtypes(include=['float64', 'int64']).columns
            results[numeric_cols] = results[numeric_cols].fillna(0)
            
            string_cols = results.select_dtypes(include=['object']).columns
            results[string_cols] = results[string_cols].fillna('')
            
            # Convert floats to ints where appropriate
            for col in results.select_dtypes(include=['float64']).columns:
                results[col] = results[col].astype(int)
            
            return results.to_dict('records')
        except Exception as e:
            print(f"Error in search_players: {e}")
            import traceback
            traceback.print_exc()
            return []

    def get_player_card(self, player_name):
        if self.df is None:
            return None
        
        try:
            player_df = self.df[self.df['short_name'].str.lower() == player_name.lower()]
            if player_df.empty:
                return None
            
            # Get single row and make a copy
            result_df = player_df.head(1).copy()
            
            # Replace NaN with appropriate defaults
            numeric_cols = result_df.select_dtypes(include=['float64', 'int64']).columns
            result_df[numeric_cols] = result_df[numeric_cols].fillna(0)
            
            string_cols = result_df.select_dtypes(include=['object']).columns  
            result_df[string_cols] = result_df[string_cols].fillna('')
            
            # Convert floats to ints
            for col in result_df.select_dtypes(include=['float64']).columns:
                result_df[col] = result_df[col].astype(int)
            
            return result_df.iloc[0].to_dict()
        except Exception as e:
            print(f"Error in get_player_card: {e}")
            import traceback
            traceback.print_exc()
            return None

    def get_top_players(self, limit=100):
        if self.df is None or len(self.df) == 0:
            return []
        
        try:
            if 'overall' in self.df.columns:
                top_df = self.df.sort_values('overall', ascending=False).head(limit).copy()
            else:
                top_df = self.df.head(limit).copy()
            
            # Replace NaN with appropriate defaults
            # For numeric columns, replace with 0
            numeric_cols = top_df.select_dtypes(include=['float64', 'int64']).columns
            top_df[numeric_cols] = top_df[numeric_cols].fillna(0)
            
            # For string columns, replace with empty string
            string_cols = top_df.select_dtypes(include=['object']).columns
            top_df[string_cols] = top_df[string_cols].fillna('')
            
            # Convert floats to ints where appropriate
            for col in top_df.select_dtypes(include=['float64']).columns:
                top_df[col] = top_df[col].astype(int)
            
            return top_df.to_dict('records')
        except Exception as e:
            print(f"Error in get_top_players: {e}")
            import traceback
            traceback.print_exc()
            return []
