import sqlite3
import pandas as pd
from pathlib import Path
import json

DB_FILE = Path("sbmotz.db")
DATA_DIR = Path("./data")

# Map CSV filenames to table names
CSV_MAPPING = {
    "cars.csv": "cars",
    "employees.csv": "employees",
    "sales.csv": "sales",
    "sell_requests.csv": "sell_requests",
    "services.csv": "services",
    "contacts.csv": "contacts",
    "carts.csv": "carts",
    "customers.csv": "customers",
    "employee_sessions.json": "employee_sessions",
    "customer_sessions.json": "customer_sessions"
}

def get_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    # Enable row factory if needed, but pandas handles it
    return conn

def init_db():
    """
    Initialize the database.
    If tables don't exist, try to migrate from CSV/JSON files in DATA_DIR.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if we need to migrate
    # We can check if 'cars' table exists as a proxy for "db initialized"
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cars'")
    if cursor.fetchone():
        conn.close()
        return

    print("Initializing database and migrating data...")

    # Migrate CSVs
    for csv_file, table_name in CSV_MAPPING.items():
        file_path = DATA_DIR / csv_file
        if file_path.exists():
            if csv_file.endswith(".json"):
                # Handle JSON sessions
                try:
                    data = json.loads(file_path.read_text())
                    # Convert dict {token: {data}} to list of dicts with token as column
                    rows = []
                    for token, info in data.items():
                        row = info.copy()
                        row["token"] = token
                        rows.append(row)
                    if rows:
                        df = pd.DataFrame(rows)
                        df.to_sql(table_name, conn, index=False, if_exists="replace")
                except Exception as e:
                    print(f"Failed to migrate {csv_file}: {e}")
            else:
                # Handle CSVs
                try:
                    df = pd.read_csv(file_path)
                    df.to_sql(table_name, conn, index=False, if_exists="replace")
                except Exception as e:
                    print(f"Failed to migrate {csv_file}: {e}")
    
    conn.close()

# Helper to read table safely
def read_table(table_name, default_cols=None):
    conn = get_connection()
    try:
        df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
        conn.close()
        return df
    except Exception:
        conn.close()
        if default_cols:
            return pd.DataFrame(columns=default_cols)
        return pd.DataFrame()

# Helper to write table
def write_table(table_name, df):
    conn = get_connection()
    df.to_sql(table_name, conn, index=False, if_exists="replace")
    conn.close()

# Session helpers specific to DB
def load_session_table(table_name):
    df = read_table(table_name, default_cols=["token"])
    if df.empty:
        return {}
    # Convert back to dict {token: {data}}
    # We need to preserve all columns except token as the value dict
    records = df.to_dict(orient="records")
    result = {}
    for r in records:
        token = r.pop("token")
        result[token] = r
    return result

def save_session_table(table_name, data_dict):
    # Convert dict {token: {data}} to DataFrame
    rows = []
    for token, info in data_dict.items():
        row = info.copy()
        row["token"] = token
        rows.append(row)
    
    if not rows:
        # If empty, write an empty table with columns if possible, or just drop table?
        # Better to write empty DF with columns if we knew them.
        # For now, if empty, we can just drop the table or write nothing.
        # But write_table expects a DF.
        # If we don't know columns, we can't create a valid empty DF easily without schema.
        # But usually we have at least one session.
        # If completely empty, let's just do nothing or try to write empty DF if we can infer cols.
        # Let's just return if empty to avoid errors, but that might leave stale data if we don't drop.
        # Safest: execute DELETE FROM table
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(f"DELETE FROM {table_name}")
            conn.commit()
        except:
            pass
        conn.close()
        return

    df = pd.DataFrame(rows)
    write_table(table_name, df)
