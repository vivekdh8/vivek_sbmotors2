import pandas as pd
import hashlib
import db

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def check_admin():
    try:
        employees = db.read_table("employees")
        print("Employees table loaded.")
        print(employees)
        
        admin = employees[employees["username"] == "admin"]
        if admin.empty:
            print("Admin user NOT found!")
        else:
            print("Admin user found.")
            stored_hash = admin.iloc[0]["password_hash"]
            print(f"Stored hash: {stored_hash}")
            
            input_pw = "admin123"
            calculated_hash = hash_pw(input_pw)
            print(f"Calculated hash for 'admin123': {calculated_hash}")
            
            if stored_hash == calculated_hash:
                print("Password MATCHES!")
            else:
                print("Password DOES NOT MATCH!")
                
                # Update password to be correct
                print("Updating password...")
                employees.loc[employees["username"] == "admin", "password_hash"] = calculated_hash
                db.write_table("employees", employees)
                print("Password updated.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_admin()
