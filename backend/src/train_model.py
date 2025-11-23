import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import shap

def train_model():
    # Load processed data
    df = pd.read_csv("data/processed_data.csv")
    
    # Features and Target
    X = df[['HomeTeam_Code', 'AwayTeam_Code', 'B365H', 'B365D', 'B365A']]
    y = df['FTR_Code']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Data Types:")
    print(X_train.dtypes)
    print(y_train.dtypes)
    print("First 5 rows of X_train:")
    print(X_train.head())
    
    print("Training model...")
    # Train XGBoost
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
    model.fit(X_train, y_train)
    print("Model trained.")
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy}")
    print(classification_report(y_test, y_pred))
    
    # Save Model
    joblib.dump(model, "data/xgb_model.joblib")
    
    # Explainability (SHAP)
    # explainer = shap.TreeExplainer(model)
    # joblib.dump(explainer, "data/shap_explainer.joblib")
    
    print("Model saved.")

if __name__ == "__main__":
    train_model()
