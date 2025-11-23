import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib

def load_data(filepath):
    return pd.read_csv(filepath)

def preprocess_data(df):
    # Select relevant columns
    # Features: HomeTeam, AwayTeam, B365H, B365D, B365A (Odds as features)
    # Target: FTR (Full Time Result)
    
    features = ['HomeTeam', 'AwayTeam', 'B365H', 'B365D', 'B365A']
    target = 'FTR'
    
    df = df[features + [target]]
    
    # Clean odds columns
    for col in ['B365H', 'B365D', 'B365A']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    df = df.dropna()
    
    # Encode Team Names
    le_home = LabelEncoder()
    le_away = LabelEncoder()
    
    # Fit on all unique teams to ensure consistency
    all_teams = pd.concat([df['HomeTeam'], df['AwayTeam']]).unique()
    le_home.fit(all_teams)
    le_away.fit(all_teams) # Use same encoder or fit separate? Better to use same if teams are same pool
    
    # Actually, let's use one encoder for teams
    le_team = LabelEncoder()
    le_team.fit(all_teams)
    
    df['HomeTeam_Code'] = le_team.transform(df['HomeTeam'])
    df['AwayTeam_Code'] = le_team.transform(df['AwayTeam'])
    
    # Target Encoding
    le_target = LabelEncoder()
    df['FTR_Code'] = le_target.fit_transform(df['FTR'])
    
    return df, le_team, le_target

if __name__ == "__main__":
    df = load_data("data/match_data.csv")
    processed_df, le_team, le_target = preprocess_data(df)
    
    # Save encoders
    joblib.dump(le_team, "data/le_team.joblib")
    joblib.dump(le_target, "data/le_target.joblib")
    processed_df.to_csv("data/processed_data.csv", index=False)
    print("Data processing complete. Encoders and processed data saved.")
