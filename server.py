"""
server.py

A single-file FastAPI application that uses SQLite as a local data store.
Features:
 - Home page
 - Buy car (list cars) with Add-to-Cart and view Cart / Checkout
 - Sell car (submit a car to be added to the listing)
 - Car service booking
 - Contact form
 - Employee login panel and dashboard (simple username/password stored locally)
 - Admin employee (username="admin") can add/remove other employees and manage orders/cars
 - Customer registration & login using phone+password (required for buy/sell/cart)
 - Admin can download/upload CSVs (exports/imports from DB) and edit data inline
 - Admin can edit cars, sell requests, services, sales, contacts and employees via edit forms

How it stores data: SQLite database (sbmotz.db). Uses pandas for read/write.

Run: python server.py
Then open http://127.0.0.1:8000
"""

from fastapi import FastAPI, Request, Form, Response, Cookie, HTTPException, UploadFile, File, Body
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from pathlib import Path
import uuid
import hashlib
import json
from datetime import datetime
from typing import Optional
import io
import db
import shutil
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
Path("static/car_images").mkdir(parents=True, exist_ok=True)
Path("static/videos").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize DB
db.init_db()

# Table names
CARS_TABLE = "cars"
EMPLOYEES_TABLE = "employees"
SALES_TABLE = "sales"
SELL_REQUESTS_TABLE = "sell_requests"
SERVICES_TABLE = "services"
CONTACTS_TABLE = "contacts"
CARTS_TABLE = "carts"
CUSTOMERS_TABLE = "customers"
SETTINGS_TABLE = "settings"

EMP_SESSIONS_TABLE = "employee_sessions"
CUSTOMER_SESSIONS_TABLE = "customer_sessions"

# Helper: read/write using db module
def read_table(table_name, default_cols=None):
    return db.read_table(table_name, default_cols)

def write_table(table_name, df):
    db.write_table(table_name, df)

# Initialize some tables with defaults if missing/empty
if read_table(CARS_TABLE).empty:
    sample = pd.DataFrame([
        {"id": "car-1", "make": "Toyota", "model": "Corolla", "year": 2019, "price": 800000, "mileage": 35000, "status": "available"},
        {"id": "car-2", "make": "Honda", "model": "City", "year": 2018, "price": 700000, "mileage": 42000, "status": "available"},
        {"id": "car-3", "make": "Hyundai", "model": "Creta", "year": 2020, "price": 1200000, "mileage": 22000, "status": "available"},
    ])
    write_table(CARS_TABLE, sample)

# Ensure employees table and admin exists
if read_table(EMPLOYEES_TABLE).empty:
    # store username and sha256(password)
    default_pw = hashlib.sha256("admin123".encode()).hexdigest()
    emp = pd.DataFrame([{"username": "admin", "password_hash": default_pw, "name": "Administrator"}])
    write_table(EMPLOYEES_TABLE, emp)

# Ensure other tables exist (by reading with defaults, db.read_table handles creation/empty return)
read_table(CUSTOMERS_TABLE, default_cols=["phone", "password_hash", "name", "created_at"]) 
read_table(SALES_TABLE, default_cols=["order_id", "session_id", "car_id", "price", "timestamp"]) 
read_table(SELL_REQUESTS_TABLE, default_cols=["request_id", "owner_name", "phone", "make", "model", "year", "asking_price", "notes", "status", "timestamp"]) 
read_table(SERVICES_TABLE, default_cols=["service_id", "owner_name", "phone", "car_id", "service_date", "notes", "status", "timestamp"]) 
read_table(CONTACTS_TABLE, default_cols=["contact_id", "name", "email", "message", "timestamp"]) 
read_table(CARTS_TABLE, default_cols=["session_id", "items_json", "updated_at"]) 
read_table(SETTINGS_TABLE, default_cols=["key", "value"]) 


# Utility: cookie names
SESSION_COOKIE_NAME = "session_id"           # legacy anonymous session
EMP_SESSION_COOKIE = "employee_session"
CUSTOMER_SESSION_COOKIE = "customer_session"


# --- Authentication helpers ---

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# Employee session helpers
def load_emp_sessions():
    return db.load_session_table(EMP_SESSIONS_TABLE)


def save_emp_sessions(d):
    db.save_session_table(EMP_SESSIONS_TABLE, d)


# Customer session helpers
def load_customer_sessions():
    return db.load_session_table(CUSTOMER_SESSIONS_TABLE)


def save_customer_sessions(d):
    db.save_session_table(CUSTOMER_SESSIONS_TABLE, d)


# employee_required returns the username string or raises
def employee_required(request: Request):
    token = request.cookies.get(EMP_SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    d = load_emp_sessions()
    if token not in d:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return d[token]["username"]


# customer_required returns a dict {"token":..., "phone":...}
def customer_required(request: Request):
    token = request.cookies.get(CUSTOMER_SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    d = load_customer_sessions()
    if token not in d:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"token": token, "phone": d[token]["phone"]}


# helper to create customer session token and set cookie
def create_customer_session(response: Response, phone: str):
    token = str(uuid.uuid4())
    d = load_customer_sessions()
    d[token] = {"phone": phone, "login_at": datetime.utcnow().isoformat()}
    save_customer_sessions(d)
    response.set_cookie(CUSTOMER_SESSION_COOKIE, token, max_age=60 * 60 * 24 * 30)
    return token


# --- HTML rendering helpers (very small, inline templates) ---

def layout(title: str, body_html: str):
    nav = f"""
    <nav>
      <a href="/">Home</a> | <a href="/cars">Buy Car</a> | <a href="/sell">Sell Car</a> | <a href="/service">Car Service</a> | <a href="/contact">Contact</a> | <a href="/cart">Cart</a> | <a href="/employee/login">Employee Login</a> | <a href="/customer/login">Customer Login</a>
    </nav>
    <hr>
    """
    return f"<html><head><title>{title}</title></head><body><h1>{title}</h1>{nav}{body_html}</body></html>"


# --- Routes ---
@app.get("/", response_class=HTMLResponse)
def home():
    body = """
    <p>Welcome to the local FastAPI Car Shop demo powered by <code>SQLite</code> storage.</p>
    <ul>
      <li><a href="/cars">Buy Car</a> - browse available cars</li>
      <li><a href="/sell">Sell Your Car</a> - submit your car for sale (requires login)</li>
      <li><a href="/service">Book Car Service</a></li>
      <li><a href="/contact">Contact Us</a></li>
      <li><a href="/cart">Your Cart</a> (requires login)</li>
      <li><a href="/employee/login">Employee Login</a></li>
      <li><a href="/customer/login">Customer Login / Register</a></li>
    </ul>
    """
    return HTMLResponse(layout("Home", body))


@app.get("/cars", response_class=HTMLResponse)
def list_cars(request: Request):
    cars = read_table(CARS_TABLE)
    if cars.empty:
        body = "<p>No cars available.</p>"
    else:
        # render as table with Add-to-cart button for available cars
        rows = []
        rows.append("<table border='1' cellpadding='5'><tr><th>ID</th><th>Make</th><th>Model</th><th>Year</th><th>Price</th><th>Mileage</th><th>Status</th><th>Action</th></tr>")
        for _, r in cars.iterrows():
            action = ""
            if str(r.get("status", "available")).lower() == "available":
                action = f"<form method='post' action='/cart/add' style='display:inline'><input type='hidden' name='car_id' value='{r.id}'><button type='submit'>Add to cart</button></form>"
            rows.append(f"<tr><td>{r.id}</td><td>{r.make}</td><td>{r.model}</td><td>{int(r.year) if not pd.isna(r.year) else ''}</td><td>₹{int(r.price)}</td><td>{int(r.mileage)}</td><td>{r.status}</td><td>{action}</td></tr>")
        rows.append("</table>")
        body = ''.join(rows)
    return HTMLResponse(layout("Buy Cars", body))


# Customer cart/add/checkout require customer login
@app.post("/cart/add")
def add_to_cart(request: Request, car_id: str = Form(...)):
    # require customer
    try:
        cust = customer_required(request)
    except HTTPException:
        return RedirectResponse(url="/customer/login", status_code=303)
    resp = RedirectResponse(url="/cart", status_code=303)
    session_id = cust["token"]

    # check car exists and available
    cars = read_table(CARS_TABLE)
    if car_id not in cars["id"].astype(str).tolist():
        return HTMLResponse(layout("Error", f"<p>Car id {car_id} not found.</p>"))

    carts = read_table(CARTS_TABLE)
    found = carts[carts["session_id"] == session_id]
    if not found.empty:
        items = json.loads(found.iloc[0]["items_json"]) if found.iloc[0]["items_json"] else []
        items.append(car_id)
        carts.loc[carts["session_id"] == session_id, "items_json"] = json.dumps(items)
        carts.loc[carts["session_id"] == session_id, "updated_at"] = datetime.utcnow().isoformat()
    else:
        new = {"session_id": session_id, "items_json": json.dumps([car_id]), "updated_at": datetime.utcnow().isoformat()}
        carts = pd.concat([carts, pd.DataFrame([new])], ignore_index=True)
    write_table(CARTS_TABLE, carts)
    return resp


@app.get("/cart", response_class=HTMLResponse)
def view_cart(request: Request):
    try:
        cust = customer_required(request)
    except HTTPException:
        return RedirectResponse(url="/customer/login")
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    sel = carts[carts["session_id"] == session_id]
    if sel.empty:
        body = "<p>Your cart is empty.</p>"
        return HTMLResponse(layout("Cart", body))
    items = json.loads(sel.iloc[0]["items_json"]) if sel.iloc[0]["items_json"] else []
    cars = read_table(CARS_TABLE).set_index("id")
    lines = []
    total = 0
    for cid in items:
        if cid in cars.index:
            c = cars.loc[cid]
            lines.append(f"<li>{c.make} {c.model} ({int(c.year)}) - ₹{int(c.price)}</li>")
            total += int(c.price)
        else:
            lines.append(f"<li>Unknown car id {cid}</li>")
    body = f"<ul>{''.join(lines)}</ul><p><strong>Total:</strong> ₹{total}</p>"
    # replace checkout with update (per request) — keep original checkout logic but change UI to Update
    body += "<form method='post' action='/cart/update'><button type='submit'>Update</button></form>"
    body += "<form method='post' action='/cart/clear' style='margin-top:10px'><button type='submit'>Clear Cart</button></form>"
    body += "<form method='post' action='/cart/checkout' style='margin-top:10px'><button type='submit'>Checkout</button></form>"
    return HTMLResponse(layout("Your Cart", body))


@app.post("/cart/update")
def cart_update(request: Request):
    # this stub updates the cart (no-op for now) — keeps compatibility with original checkout endpoint
    try:
        cust = customer_required(request)
    except HTTPException:
        return RedirectResponse(url="/customer/login", status_code=303)
    # For demo: simply redirect back to cart (could be extended to modify quantities)
    return RedirectResponse(url="/cart", status_code=303)


@app.post("/cart/clear")
def clear_cart(request: Request):
    try:
        cust = customer_required(request)
    except HTTPException:
        return RedirectResponse(url="/customer/login", status_code=303)
    resp = RedirectResponse(url="/cart", status_code=303)
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    carts = carts[carts["session_id"] != session_id]
    write_table(CARTS_TABLE, carts)
    return resp


@app.post("/cart/checkout")
def checkout(request: Request):
    try:
        cust = customer_required(request)
    except HTTPException:
        return RedirectResponse(url="/customer/login", status_code=303)
    resp = RedirectResponse(url="/cart", status_code=303)
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    sel = carts[carts["session_id"] == session_id]
    if sel.empty:
        return HTMLResponse(layout("Error", "<p>Your cart is empty.</p>"))
    items = json.loads(sel.iloc[0]["items_json"]) if sel.iloc[0]["items_json"] else []
    cars = read_table(CARS_TABLE)
    sales = read_table(SALES_TABLE)
    for cid in items:
        car_row = cars[cars["id"] == cid]
        if car_row.empty:
            continue
        price = int(car_row.iloc[0]["price"])
        order = {"order_id": str(uuid.uuid4()), "session_id": session_id, "car_id": cid, "price": price, "timestamp": datetime.utcnow().isoformat()}
        sales = pd.concat([sales, pd.DataFrame([order])], ignore_index=True)
        # mark car as sold
        cars.loc[cars["id"] == cid, "status"] = "sold"
    write_table(SALES_TABLE, sales)
    write_table(CARS_TABLE, cars)
    # clear cart
    carts = carts[carts["session_id"] != session_id]
    write_table(CARTS_TABLE, carts)
    return resp


# Sell form: show form regardless, but POST requires customer login
@app.get("/sell", response_class=HTMLResponse)
def sell_form(request: Request):
    body = """
    <form method='post' action='/sell'>
      Your name:<br><input name='owner_name' required><br>
      Phone:<br><input name='phone' required><br>
      Make:<br><input name='make' required><br>
      Model:<br><input name='model' required><br>
      Year:<br><input name='year' type='number' required><br>
      Asking price (INR):<br><input name='asking_price' type='number' required><br>
      Notes:<br><textarea name='notes'></textarea><br>
      <button type='submit'>Submit</button>
    </form>
    """
    return HTMLResponse(layout("Sell Your Car", body))


@app.post("/sell")
def sell_car(request: Request, owner_name: str = Form(...), phone: str = Form(...), make: str = Form(...), model: str = Form(...), year: int = Form(...), asking_price: int = Form(...), notes: Optional[str] = Form(None)):
    # require customer login
    try:
        cust = customer_required(request)
    except HTTPException:
        return RedirectResponse(url="/customer/login", status_code=303)
    # ensure phone matches logged-in phone or allow admin override
    if phone != cust["phone"]:
        # for demo: disallow mismatch
        return HTMLResponse(layout("Error", "<p>Phone number must match logged-in customer.</p>"))
    reqs = read_table(SELL_REQUESTS_TABLE)
    req = {"request_id": str(uuid.uuid4()), "owner_name": owner_name, "phone": phone, "make": make, "model": model, "year": year, "asking_price": asking_price, "notes": notes or "", "status": "pending", "timestamp": datetime.utcnow().isoformat()}
    reqs = pd.concat([reqs, pd.DataFrame([req])], ignore_index=True)
    write_table(SELL_REQUESTS_TABLE, reqs)
    return HTMLResponse(layout("Sell Submitted", f"<p>Thank you, {owner_name}. Your sell request is submitted and pending approval.</p>"))


@app.get("/service", response_class=HTMLResponse)
def service_form():
    body = """
    <form method='post' action='/service'>
      Your name:<br><input name='owner_name' required><br>
      Phone:<br><input name='phone' required><br>
      Car ID (if known):<br><input name='car_id'><br>
      Preferred service date (YYYY-MM-DD):<br><input name='service_date' type='date'><br>
      Notes:<br><textarea name='notes'></textarea><br>
      <button type='submit'>Book Service</button>
    </form>
    """
    return HTMLResponse(layout("Book Service", body))


@app.post("/service")
def book_service(owner_name: str = Form(...), phone: str = Form(...), car_id: Optional[str] = Form(None), service_date: Optional[str] = Form(None), notes: Optional[str] = Form(None)):
    services = read_table(SERVICES_TABLE)
    entry = {"service_id": str(uuid.uuid4()), "owner_name": owner_name, "phone": phone, "car_id": car_id or "", "service_date": service_date or "", "notes": notes or "", "status": "scheduled", "timestamp": datetime.utcnow().isoformat()}
    services = pd.concat([services, pd.DataFrame([entry])], ignore_index=True)
    write_table(SERVICES_TABLE, services)
    return HTMLResponse(layout("Service Booked", f"<p>Thanks {owner_name}, your service is booked.</p>"))


@app.get("/contact", response_class=HTMLResponse)
def contact_form():
    body = """
    <form method='post' action='/contact'>
      Name:<br><input name='name' required><br>
      Email:<br><input type='email' name='email' required><br>
      Message:<br><textarea name='message' required></textarea><br>
      <button type='submit'>Send</button>
    </form>
    """
    return HTMLResponse(layout("Contact Us", body))


@app.post("/contact")
def submit_contact(name: str = Form(...), email: str = Form(...), message: str = Form(...)):
    contacts = read_table(CONTACTS_TABLE)
    entry = {"contact_id": str(uuid.uuid4()), "name": name, "email": email, "message": message, "timestamp": datetime.utcnow().isoformat()}
    contacts = pd.concat([contacts, pd.DataFrame([entry])], ignore_index=True)
    write_table(CONTACTS_TABLE, contacts)
    return HTMLResponse(layout("Thanks", "<p>Your message was received. We'll get back to you soon.</p>"))


# --- Employee login panel and admin tools ---
@app.get("/employee/login", response_class=HTMLResponse)
def employee_login_form():
    body = """
    <form method='post' action='/employee/login'>
      Username:<br><input name='username' required><br>
      Password:<br><input type='password' name='password' required><br>
      <button type='submit'>Login</button>
    </form>
    """
    return HTMLResponse(layout("Employee Login", body))


@app.post("/employee/login")
def employee_login(response: Response, username: str = Form(...), password: str = Form(...)):
    employees = read_table(EMPLOYEES_TABLE)
    found = employees[employees["username"] == username]
    if found.empty:
        return HTMLResponse(layout("Login Failed", "<p>Invalid credentials.</p>"))
    expected = found.iloc[0]["password_hash"]
    if hash_pw(password) != expected:
        return HTMLResponse(layout("Login Failed", "<p>Invalid credentials.</p>"))
    # set employee session cookie (simple)
    token = str(uuid.uuid4())
    response = RedirectResponse(url="/employee/dashboard", status_code=303)
    response.set_cookie(EMP_SESSION_COOKIE, token, max_age=60 * 60 * 8)
    d = load_emp_sessions()
    d[token] = {"username": username, "login_at": datetime.utcnow().isoformat()}
    save_emp_sessions(d)
    return response


@app.get("/employee/dashboard", response_class=HTMLResponse)
def employee_dashboard(request: Request):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    # show sell requests, services, sales, contacts
    reqs = read_table(SELL_REQUESTS_TABLE)
    services = read_table(SERVICES_TABLE)
    sales = read_table(SALES_TABLE)
    contacts = read_table(CONTACTS_TABLE)
    cars = read_table(CARS_TABLE)
    employees = read_table(EMPLOYEES_TABLE)
    body = "<h2>Welcome, {}</h2>".format(username)
    # Admin-only: add/remove employees
    if username == "admin":
        body += "<h3>Manage Employees (Admin)</h3>"
        body += "<form method='post' action='/employee/add_employee'>Username:<br><input name='new_username' required><br>Password:<br><input name='new_password' type='password' required><br>Name:<br><input name='new_name'><br><button type='submit'>Add Employee</button></form>"
        body += "<form method='post' action='/employee/remove_employee' style='margin-top:10px'>Username to remove:<br><input name='rm_username' required><br><button type='submit'>Remove Employee</button></form>"
        body += "<h4>Existing employees:</h4>"
        # render employees as table with update buttons
        rows = [f"<tr><td>{r.username}</td><td>{r.name}</td><td><form method='get' action='/employee/edit_employee' style='display:inline'><input type='hidden' name='username' value='{r.username}'><button type='submit'>Edit</button></form></td></tr>" for _, r in employees.iterrows()]
        body += "<table border='1' cellpadding='5'><tr><th>Username</th><th>Name</th><th>Action</th></tr>" + ''.join(rows) + "</table>"
        # Admin can add orders directly
        body += "<h3>Manage Orders (Admin)</h3>"
        body += "<form method='post' action='/employee/add_order'>Session ID (customer token):<br><input name='session_id' required><br>Car ID:<br><input name='car_id' required><br>Price:<br><input name='price' type='number' required><br><button type='submit'>Add Order</button></form>"
        # CSV management
        body += "<h3>Data Management (Admin)</h3>"
        body += "<form method='get' action='/employee/download_csv'>Select Table to download (as CSV):<br><select name='csv_name'><option value='cars.csv'>cars.csv</option><option value='sales.csv'>sales.csv</option><option value='employees.csv'>employees.csv</option><option value='customers.csv'>customers.csv</option><option value='services.csv'>services.csv</option><option value='contacts.csv'>contacts.csv</option><option value='sell_requests.csv'>sell_requests.csv</option><option value='carts.csv'>carts.csv</option></select><br><button type='submit'>Download</button></form>"
        body += "<form method='post' action='/employee/upload_csv' enctype='multipart/form-data' style='margin-top:10px'>Replace Table (upload CSV):<br><select name='csv_name'><option value='cars.csv'>cars.csv</option><option value='sales.csv'>sales.csv</option><option value='employees.csv'>employees.csv</option><option value='customers.csv'>customers.csv</option><option value='services.csv'>services.csv</option><option value='contacts.csv'>contacts.csv</option><option value='sell_requests.csv'>sell_requests.csv</option><option value='carts.csv'>carts.csv</option></select><br><input type='file' name='file'><br><button type='submit'>Upload & Replace</button></form>"
        # Inline CSV editor link
        body += "<h4>Edit Data Inline:</h4><p><a href='/employee/edit_csv'>Open Data editor</a></p>"

    # Create tabs for Sell Requests, Services, Sales, Contacts and Cars table with edit buttons
    body += """
    <style>
      .tab { display:none }
      .tablinks { margin-right:10px }
      .tabactive { font-weight:bold }
    </style>
    <div>
      <button class='tablinks' onclick="showTab('sell')">Sell Requests</button>
      <button class='tablinks' onclick="showTab('services')">Services</button>
      <button class='tablinks' onclick="showTab('sales')">Sales / Orders</button>
      <button class='tablinks' onclick="showTab('contacts')">Contacts</button>
      <button class='tablinks' onclick="showTab('cars')">Cars</button>
    </div>
    <script>
      function showTab(name){
        document.querySelectorAll('.tab').forEach(t=>t.style.display='none');
        document.getElementById(name).style.display='block';
      }
      // open first tab by default
      window.addEventListener('load', function(){ showTab('sell'); });
    </script>
    """
    # Sell requests tab
    body += "<div id='sell' class='tab'>"
    body += "<h3>Sell Requests</h3>"
    if reqs.empty:
        body += "<p>No sell requests.</p>"
    else:
        rows = []
        for _, r in reqs.iterrows():
            rows.append(f"<tr><td>{r.request_id}</td><td>{r.owner_name}</td><td>{r.make}</td><td>{r.model}</td><td>{r.year}</td><td>₹{r.asking_price}</td><td>{r.status}</td><td><form method='get' action='/employee/edit_sell_request' style='display:inline'><input type='hidden' name='request_id' value='{r.request_id}'><button type='submit'>Edit</button></form> <form method='post' action='/employee/approve_sell' style='display:inline'><input type='hidden' name='request_id' value='{r.request_id}'><button type='submit'>Approve</button></form></td></tr>")
        body += "<table border='1' cellpadding='5'><tr><th>ID</th><th>Owner</th><th>Make</th><th>Model</th><th>Year</th><th>Asking</th><th>Status</th><th>Action</th></tr>" + ''.join(rows) + "</table>"
    body += "</div>"
    # Services tab
    body += "<div id='services' class='tab'>"
    body += "<h3>Services</h3>"
    if services.empty:
        body += "<p>No services.</p>"
    else:
        rows = [f"<tr><td>{r.service_id}</td><td>{r.owner_name}</td><td>{r.phone}</td><td>{r.car_id or 'N/A'}</td><td>{r.service_date or 'N/A'}</td><td>{r.status}</td><td><form method='get' action='/employee/edit_service' style='display:inline'><input type='hidden' name='service_id' value='{r.service_id}'><button type='submit'>Edit</button></form></td></tr>" for _, r in services.iterrows()]
        body += "<table border='1' cellpadding='5'><tr><th>ID</th><th>Owner</th><th>Phone</th><th>Car ID</th><th>Date</th><th>Status</th><th>Action</th></tr>" + ''.join(rows) + "</table>"
    body += "</div>"
    # Sales tab
    body += "<div id='sales' class='tab'>"
    body += "<h3>Sales / Orders</h3>"
    if sales.empty:
        body += "<p>No orders.</p>"
    else:
        rows = [f"<tr><td>{r.order_id}</td><td>{r.session_id}</td><td>{r.car_id}</td><td>₹{r.price}</td><td>{r.timestamp}</td><td><form method='get' action='/employee/edit_sale' style='display:inline'><input type='hidden' name='order_id' value='{r.order_id}'><button type='submit'>Edit</button></form> <form method='post' action='/employee/delete_order' style='display:inline'><input type='hidden' name='order_id' value='{r.order_id}'><button type='submit'>Delete</button></form></td></tr>" for _, r in sales.iterrows()]
        body += "<table border='1' cellpadding='5'><tr><th>Order ID</th><th>Session</th><th>Car ID</th><th>Price</th><th>Timestamp</th><th>Action</th></tr>" + ''.join(rows) + "</table>"
    body += "</div>"
    # Contacts tab
    body += "<div id='contacts' class='tab'>"
    body += "<h3>Contacts</h3>"
    if contacts.empty:
        body += "<p>No contacts.</p>"
    else:
        rows = [f"<tr><td>{r.contact_id}</td><td>{r.name}</td><td>{r.email}</td><td>{r.message}</td><td><form method='get' action='/employee/edit_contact' style='display:inline'><input type='hidden' name='contact_id' value='{r.contact_id}'><button type='submit'>Edit</button></form></td></tr>" for _, r in contacts.iterrows()]
        body += "<table border='1' cellpadding='5'><tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th><th>Action</th></tr>" + ''.join(rows) + "</table>"
    body += "</div>"
    # Cars tab
    body += "<div id='cars' class='tab'>"
    body += "<h3>Cars in inventory</h3>"
    if cars.empty:
        body += "<p>No cars.</p>"
    else:
        rows = [f"<tr><td>{r.id}</td><td>{r.make}</td><td>{r.model}</td><td>{r.year}</td><td>₹{int(r.price)}</td><td>{r.mileage}</td><td>{r.status}</td><td><form method='get' action='/employee/edit_car' style='display:inline'><input type='hidden' name='car_id' value='{r.id}'><button type='submit'>Edit</button></form> <form method='post' action='/employee/delete_car' style='display:inline'><input type='hidden' name='car_id' value='{r.id}'><button type='submit'>Delete</button></form></td></tr>" for _, r in cars.iterrows()]
        body += "<table border='1' cellpadding='5'><tr><th>ID</th><th>Make</th><th>Model</th><th>Year</th><th>Price</th><th>Mileage</th><th>Status</th><th>Action</th></tr>" + ''.join(rows) + "</table>"
    body += "</div>"

    return HTMLResponse(layout("Employee Dashboard", body))


@app.post("/employee/add_employee")
def add_employee(request: Request, new_username: str = Form(...), new_password: str = Form(...), new_name: Optional[str] = Form(None)):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can add employees.</p>"))
    employees = read_table(EMPLOYEES_TABLE)
    if new_username in employees["username"].astype(str).tolist():
        return HTMLResponse(layout("Error", "<p>Username already exists.</p>"))
    new = {"username": new_username, "password_hash": hash_pw(new_password), "name": new_name or ""}
    employees = pd.concat([employees, pd.DataFrame([new])], ignore_index=True)
    write_table(EMPLOYEES_TABLE, employees)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.post("/employee/remove_employee")
def remove_employee(request: Request, rm_username: str = Form(...)):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can remove employees.</p>"))
    employees = read_table(EMPLOYEES_TABLE)
    employees = employees[employees["username"] != rm_username]
    write_table(EMPLOYEES_TABLE, employees)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.post("/employee/delete_order")
def delete_order(request: Request, order_id: str = Form(...)):
    try:
        _ = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    sales = read_table(SALES_TABLE)
    sales = sales[sales["order_id"] != order_id]
    write_table(SALES_TABLE, sales)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.post("/employee/delete_car")
def delete_car(request: Request, car_id: str = Form(...)):
    try:
        _ = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    cars = read_table(CARS_TABLE)
    cars = cars[cars["id"] != car_id]
    write_table(CARS_TABLE, cars)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.post("/employee/add_order")
def add_order(request: Request, session_id: str = Form(...), car_id: str = Form(...), price: int = Form(...)):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    # only admin or employees allowed (admin included)
    # check car exists
    cars = read_table(CARS_TABLE)
    if car_id not in cars["id"].astype(str).tolist():
        return HTMLResponse(layout("Error", "<p>Car id not found.</p>"))
    sales = read_table(SALES_TABLE)
    order = {"order_id": str(uuid.uuid4()), "session_id": session_id, "car_id": car_id, "price": int(price), "timestamp": datetime.utcnow().isoformat()}
    sales = pd.concat([sales, pd.DataFrame([order])], ignore_index=True)
    # optionally mark car sold
    cars.loc[cars["id"] == car_id, "status"] = "sold"
    write_table(SALES_TABLE, sales)
    write_table(CARS_TABLE, cars)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.get("/employee/download_csv")
def download_csv(request: Request, csv_name: str):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can download CSVs.</p>"))
    # map name to path
    allowed = {
        "cars.csv": CARS_TABLE,
        "sales.csv": SALES_TABLE,
        "employees.csv": EMPLOYEES_TABLE,
        "customers.csv": CUSTOMERS_TABLE,
        "services.csv": SERVICES_TABLE,
        "contacts.csv": CONTACTS_TABLE,
        "sell_requests.csv": SELL_REQUESTS_TABLE,
        "carts.csv": CARTS_TABLE,
    }
    if csv_name not in allowed:
        return HTMLResponse(layout("Error", "<p>Invalid csv name.</p>"))
    table_name = allowed[csv_name]
    df = read_table(table_name)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = Response(content=stream.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={csv_name}"
    return response


@app.post("/employee/upload_csv")
def upload_csv(request: Request, csv_name: str = Form(...), file: UploadFile = File(...)):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can upload CSVs.</p>"))
    allowed = {
        "cars.csv": CARS_TABLE,
        "sales.csv": SALES_TABLE,
        "employees.csv": EMPLOYEES_TABLE,
        "customers.csv": CUSTOMERS_TABLE,
        "services.csv": SERVICES_TABLE,
        "contacts.csv": CONTACTS_TABLE,
        "sell_requests.csv": SELL_REQUESTS_TABLE,
        "carts.csv": CARTS_TABLE,
    }
    if csv_name not in allowed:
        return HTMLResponse(layout("Error", "<p>Invalid csv name.</p>"))
    table_name = allowed[csv_name]
    # read uploaded bytes and write to table (replace)
    content = file.file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
        write_table(table_name, df)
    except Exception as e:
        return HTMLResponse(layout("Error", f"<p>Failed to write file: {e}</p>"))
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.post("/employee/approve_sell")
def approve_sell(request: Request, request_id: str = Form(...)):
    try:
        _ = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    reqs = read_table(SELL_REQUESTS_TABLE)
    sel = reqs[reqs["request_id"] == request_id]
    if sel.empty:
        return HTMLResponse(layout("Error", "<p>Sell request not found.</p>"))
    row = sel.iloc[0]
    # add to cars
    cars = read_table(CARS_TABLE)
    new_car = {"id": f"car-{str(uuid.uuid4())[:8]}", "make": row.make, "model": row.model, "year": row.year, "price": row.asking_price, "mileage": 0, "status": "available"}
    cars = pd.concat([cars, pd.DataFrame([new_car])], ignore_index=True)
    write_table(CARS_TABLE, cars)
    # mark request approved
    reqs.loc[reqs["request_id"] == request_id, "status"] = "approved"
    write_table(SELL_REQUESTS_TABLE, reqs)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


# --- Customer registration/login ---
@app.get("/customer/register", response_class=HTMLResponse)
def customer_register_form():
    body = """
    <form method='post' action='/customer/register'>
      Name:<br><input name='name' required><br>
      Phone (will be your login):<br><input name='phone' required><br>
      Password:<br><input type='password' name='password' required><br>
      <button type='submit'>Register</button>
    </form>
    """
    return HTMLResponse(layout("Customer Register", body))


@app.post("/customer/register")
def customer_register(response: Response, name: str = Form(...), phone: str = Form(...), password: str = Form(...)):
    customers = read_table(CUSTOMERS_TABLE)
    if phone in customers["phone"].astype(str).tolist():
        return HTMLResponse(layout("Error", "<p>Phone already registered. Please login.</p>"))
    new = {"phone": phone, "password_hash": hash_pw(password), "name": name, "created_at": datetime.utcnow().isoformat()}
    customers = pd.concat([customers, pd.DataFrame([new])], ignore_index=True)
    write_table(CUSTOMERS_TABLE, customers)
    # create session and redirect
    resp = RedirectResponse(url="/", status_code=303)
    create_customer_session(resp, phone)
    return resp


@app.get("/customer/login", response_class=HTMLResponse)
def customer_login_form():
    body = """
    <form method='post' action='/customer/login'>
      Phone:<br><input name='phone' required><br>
      Password:<br><input type='password' name='password' required><br>
      <button type='submit'>Login</button>
    </form>
    <p>Or <a href='/customer/register'>Register here</a></p>
    """
    return HTMLResponse(layout("Customer Login", body))


@app.post("/customer/login")
def customer_login(response: Response, phone: str = Form(...), password: str = Form(...)):
    customers = read_table(CUSTOMERS_TABLE)
    found = customers[customers["phone"] == phone]
    if found.empty:
        return HTMLResponse(layout("Login Failed", "<p>Invalid credentials.</p>"))
    expected = found.iloc[0]["password_hash"]
    if hash_pw(password) != expected:
        return HTMLResponse(layout("Login Failed", "<p>Invalid credentials.</p>"))
    resp = RedirectResponse(url="/", status_code=303)
    create_customer_session(resp, phone)
    return resp


@app.get("/customer/logout")
def customer_logout(request: Request):
    token = request.cookies.get(CUSTOMER_SESSION_COOKIE)
    if token:
        d = load_customer_sessions()
        if token in d:
            del d[token]
            save_customer_sessions(d)
    resp = RedirectResponse(url="/", status_code=303)
    resp.delete_cookie(CUSTOMER_SESSION_COOKIE)
    return resp


# CSV inline editor for admin
@app.get("/employee/edit_csv", response_class=HTMLResponse)
def edit_csv_get(request: Request, csv_name: Optional[str] = None):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can edit CSVs inline.</p>"))
    allowed = {
        "cars.csv": CARS_TABLE,
        "sales.csv": SALES_TABLE,
        "employees.csv": EMPLOYEES_TABLE,
        "customers.csv": CUSTOMERS_TABLE,
        "services.csv": SERVICES_TABLE,
        "contacts.csv": CONTACTS_TABLE,
        "sell_requests.csv": SELL_REQUESTS_TABLE,
        "carts.csv": CARTS_TABLE,
    }
    # selector
    options = "".join([f"<option value='{n}' {'selected' if n==csv_name else ''}>{n}</option>" for n in allowed.keys()])
    if csv_name is None:
        csv_name = 'cars.csv'
    if csv_name not in allowed:
        return HTMLResponse(layout("Error", "<p>Invalid csv name.</p>"))
    table_name = allowed[csv_name]
    content = ''
    try:
        df = read_table(table_name)
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        content = stream.getvalue()
    except Exception:
        content = ''
    body = f"""
    <form method='get' action='/employee/edit_csv'>Select Table (CSV view): <select name='csv_name'>{options}</select> <button type='submit'>Open</button></form>
    <hr>
    <form method='post' action='/employee/edit_csv'>
      <input type='hidden' name='csv_name' value='{csv_name}'>
      <textarea name='csv_content' rows='30' cols='120'>{content}</textarea><br>
      <button type='submit'>Save Changes</button>
    </form>
    """
    return HTMLResponse(layout("Edit CSV", body))

# --- JSON API Endpoints ---

class SellRequestModel(BaseModel):
    owner_name: str
    phone: str
    make: str
    model: str
    year: int
    asking_price: int
    notes: Optional[str] = None

class ServiceRequestModel(BaseModel):
    owner_name: str
    phone: str
    car_id: Optional[str] = None
    service_date: Optional[str] = None
    notes: Optional[str] = None

class ContactRequestModel(BaseModel):
    name: str
    email: str
    message: str

@app.get("/api/cars")
def api_list_cars(type: str = None):
    cars = read_table(CARS_TABLE)
    if cars.empty:
        return []
    
    # Filter by type if provided and not 'all'
    if type and type.lower() != 'all':
        # Ensure 'type' column exists before filtering
        if 'type' in cars.columns:
            cars = cars[cars['type'].str.lower() == type.lower()]
        else:
            # If type column missing, maybe return empty or all? 
            # For now, let's assume we return all if column missing to avoid breaking
            pass

    # Convert to list of dicts
    return cars.to_dict(orient="records")

@app.post("/api/sell")
def api_sell_car(req: SellRequestModel):
    reqs = read_table(SELL_REQUESTS_TABLE)
    new_req = {
        "request_id": str(uuid.uuid4()),
        "owner_name": req.owner_name,
        "phone": req.phone,
        "make": req.make,
        "model": req.model,
        "year": req.year,
        "asking_price": req.asking_price,
        "notes": req.notes or "",
        "status": "pending",
        "timestamp": datetime.utcnow().isoformat()
    }
    reqs = pd.concat([reqs, pd.DataFrame([new_req])], ignore_index=True)
    write_table(SELL_REQUESTS_TABLE, reqs)
    return {"message": "Sell request submitted successfully", "request_id": new_req["request_id"]}

class CustomerRegisterModel(BaseModel):
    name: str
    phone: str
    password: str

class CustomerLoginModel(BaseModel):
    phone: str
    password: str

class CartAddModel(BaseModel):
    car_id: str

@app.post("/api/register")
def api_register(response: Response, req: CustomerRegisterModel):
    customers = read_table(CUSTOMERS_TABLE)
    if req.phone in customers["phone"].astype(str).tolist():
        return JSONResponse(status_code=400, content={"message": "Phone number already registered"})
    
    new_cust = {
        "phone": req.phone,
        "password_hash": hash_pw(req.password),
        "name": req.name,
        "created_at": datetime.utcnow().isoformat()
    }
    customers = pd.concat([customers, pd.DataFrame([new_cust])], ignore_index=True)
    write_table(CUSTOMERS_TABLE, customers)
    
    # Auto-login
    create_customer_session(response, req.phone)
    return {"message": "Registration successful", "user": {"name": req.name, "phone": req.phone}}

@app.post("/api/login")
def api_login(response: Response, req: CustomerLoginModel):
    customers = read_table(CUSTOMERS_TABLE)
    found = customers[customers["phone"] == req.phone]
    if found.empty:
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
    
    expected = found.iloc[0]["password_hash"]
    if hash_pw(req.password) != expected:
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
    
    create_customer_session(response, req.phone)
    return {"message": "Login successful", "user": {"name": found.iloc[0]["name"], "phone": req.phone}}

@app.post("/api/logout")
def api_logout(response: Response):
    response.delete_cookie(CUSTOMER_SESSION_COOKIE)
    return {"message": "Logged out"}

@app.get("/api/profile")
def api_get_profile(request: Request):
    """Get customer profile with orders, sell requests, and services"""
    try:
        cust = customer_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    phone = cust["phone"]
    session_id = cust["token"]
    
    # Get customer info
    customers = read_table(CUSTOMERS_TABLE)
    customer_data = customers[customers["phone"] == phone]
    if customer_data.empty:
        return JSONResponse(status_code=404, content={"message": "Customer not found"})
    
    customer_info = {
        "name": customer_data.iloc[0]["name"],
        "phone": phone,
        "created_at": customer_data.iloc[0].get("created_at", "")
    }
    
    # Get orders (sales linked by session_id)
    sales = read_table(SALES_TABLE)
    customer_sales = sales[sales["session_id"] == session_id]
    orders = []
    if not customer_sales.empty:
        cars = read_table(CARS_TABLE)
        for _, sale in customer_sales.iterrows():
            car_data = cars[cars["id"] == sale["car_id"]]
            if not car_data.empty:
                car = car_data.iloc[0]
                orders.append({
                    "order_id": sale["order_id"],
                    "car_id": sale["car_id"],
                    "car_name": f"{car.get('make', '')} {car.get('model', '')}".strip(),
                    "year": int(car.get("year", 0)) if not pd.isna(car.get("year")) else 0,
                    "price": int(sale["price"]),
                    "timestamp": sale["timestamp"]
                })
    
    # Get sell requests (linked by phone)
    sell_requests = read_table(SELL_REQUESTS_TABLE)
    customer_sell_requests = sell_requests[sell_requests["phone"] == phone]
    sell_reqs = []
    if not customer_sell_requests.empty:
        for _, req in customer_sell_requests.iterrows():
            sell_reqs.append({
                "request_id": req["request_id"],
                "make": req["make"],
                "model": req["model"],
                "year": int(req["year"]) if not pd.isna(req.get("year")) else 0,
                "asking_price": int(req["asking_price"]),
                "status": req["status"],
                "timestamp": req["timestamp"]
            })
    
    # Get service bookings (linked by phone)
    services = read_table(SERVICES_TABLE)
    customer_services = services[services["phone"] == phone]
    service_bookings = []
    if not customer_services.empty:
        for _, svc in customer_services.iterrows():
            service_bookings.append({
                "service_id": svc["service_id"],
                "car_id": svc.get("car_id", ""),
                "service_date": svc.get("service_date", ""),
                "notes": svc.get("notes", ""),
                "status": svc["status"],
                "timestamp": svc["timestamp"]
            })
    
    return {
        "user": customer_info,
        "orders": orders,
        "sell_requests": sell_reqs,
        "services": service_bookings
    }

@app.get("/api/user")
def api_get_user(request: Request):
    try:
        cust = customer_required(request)
        customers = read_table(CUSTOMERS_TABLE)
        found = customers[customers["phone"] == cust["phone"]]
        if found.empty:
             raise HTTPException(status_code=401)
        return {"name": found.iloc[0]["name"], "phone": cust["phone"]}
    except:
        return JSONResponse(status_code=401, content={"message": "Not logged in"})

@app.get("/api/cart")
def api_get_cart(request: Request):
    try:
        cust = customer_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Login required"})
    
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    sel = carts[carts["session_id"] == session_id]
    
    if sel.empty:
        return []
        
    items = json.loads(sel.iloc[0]["items_json"]) if sel.iloc[0]["items_json"] else []
    cars = read_table(CARS_TABLE)
    
    cart_items = []
    for cid in items:
        car = cars[cars["id"] == cid]
        if not car.empty:
            cart_items.append(car.iloc[0].to_dict())
            
    return cart_items

@app.post("/api/cart/add")
def api_add_to_cart(request: Request, req: CartAddModel):
    try:
        cust = customer_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Login required"})
        
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    found = carts[carts["session_id"] == session_id]
    
    if not found.empty:
        items = json.loads(found.iloc[0]["items_json"]) if found.iloc[0]["items_json"] else []
        if req.car_id not in items:
            items.append(req.car_id)
        carts.loc[carts["session_id"] == session_id, "items_json"] = json.dumps(items)
        carts.loc[carts["session_id"] == session_id, "updated_at"] = datetime.utcnow().isoformat()
    else:
        new = {"session_id": session_id, "items_json": json.dumps([req.car_id]), "updated_at": datetime.utcnow().isoformat()}
        carts = pd.concat([carts, pd.DataFrame([new])], ignore_index=True)
        
    write_table(CARTS_TABLE, carts)
    return {"message": "Added to cart"}

@app.post("/api/cart/remove")
def api_remove_from_cart(request: Request, req: CartAddModel):
    try:
        cust = customer_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Login required"})
        
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    found = carts[carts["session_id"] == session_id]
    
    if not found.empty:
        items = json.loads(found.iloc[0]["items_json"]) if found.iloc[0]["items_json"] else []
        if req.car_id in items:
            items.remove(req.car_id)
        carts.loc[carts["session_id"] == session_id, "items_json"] = json.dumps(items)
        write_table(CARTS_TABLE, carts)
        
    return {"message": "Removed from cart"}

@app.post("/api/cart/checkout")
def api_checkout(request: Request):
    try:
        cust = customer_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Login required"})
        
    session_id = cust["token"]
    carts = read_table(CARTS_TABLE)
    sel = carts[carts["session_id"] == session_id]
    
    if sel.empty:
        return JSONResponse(status_code=400, content={"message": "Cart is empty"})
        
    items = json.loads(sel.iloc[0]["items_json"]) if sel.iloc[0]["items_json"] else []
    if not items:
        return JSONResponse(status_code=400, content={"message": "Cart is empty"})

    cars = read_table(CARS_TABLE)
    sales = read_table(SALES_TABLE)
    
    for cid in items:
        car_row = cars[cars["id"] == cid]
        if car_row.empty:
            continue
        price = int(car_row.iloc[0]["price"])
        order = {"order_id": str(uuid.uuid4()), "session_id": session_id, "car_id": cid, "price": price, "timestamp": datetime.utcnow().isoformat()}
        sales = pd.concat([sales, pd.DataFrame([order])], ignore_index=True)
        # mark car as sold
        cars.loc[cars["id"] == cid, "status"] = "sold"
        
    write_table(SALES_TABLE, sales)
    write_table(CARS_TABLE, cars)
    
    # clear cart
    carts = carts[carts["session_id"] != session_id]
    write_table(CARTS_TABLE, carts)
    
    return {"message": "Checkout successful! Our team will contact you shortly."}


@app.post("/api/service")
def api_book_service(req: ServiceRequestModel):
    services = read_table(SERVICES_TABLE)
    entry = {
        "service_id": str(uuid.uuid4()),
        "owner_name": req.owner_name,
        "phone": req.phone,
        "car_id": req.car_id or "",
        "service_date": req.service_date or "",
        "notes": req.notes or "",
        "status": "scheduled",
        "timestamp": datetime.utcnow().isoformat()
    }
    services = pd.concat([services, pd.DataFrame([entry])], ignore_index=True)
    write_table(SERVICES_TABLE, services)
    return {"status": "success", "message": "Service booked"}

@app.post("/api/contact")
def api_contact(req: ContactRequestModel):
    contacts = read_table(CONTACTS_TABLE)
    entry = {
        "contact_id": str(uuid.uuid4()),
        "name": req.name,
        "email": req.email,
        "message": req.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    contacts = pd.concat([contacts, pd.DataFrame([entry])], ignore_index=True)
    write_table(CONTACTS_TABLE, contacts)
    return {"status": "success", "message": "Message received"}

# Employee Login JSON API
@app.post("/api/employee/login")
async def api_employee_login(request: Request, response: Response):
    """Employee login for frontend dashboard"""
    try:
        # Try to parse as form data first
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        
        # If not form data, try JSON
        if not username or not password:
            try:
                body = await request.json()
                username = body.get("username")
                password = body.get("password")
            except:
                return JSONResponse(status_code=400, content={"message": "Invalid request format"})
        
        # Debug logging
        print(f"Login attempt: username='{username}', password='{password}'")
        
        if not username or not password:
            return JSONResponse(status_code=400, content={"message": "Username and password required"})
        
        employees = read_table(EMPLOYEES_TABLE)
        found = employees[employees["username"] == username]
        if found.empty:
            print(f"User '{username}' not found")
            return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
        
        expected_hash = found.iloc[0]["password_hash"]
        hashed_pw = hash_pw(password)
        print(f"Expected hash: {expected_hash}")
        print(f"Calculated hash: {hashed_pw}")
        
        if hashed_pw != expected_hash:
            print("Hash mismatch")
            return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
        
        # Create session
        token = str(uuid.uuid4())
        d = load_emp_sessions()
        d[token] = {"username": username, "login_at": datetime.utcnow().isoformat()}
        save_emp_sessions(d)
        response.set_cookie(
            key=EMP_SESSION_COOKIE, 
            value=token, 
            max_age=60 * 60 * 24, 
            path="/"
        )
        
        return {"message": "Login successful", "user": {"name": found.iloc[0]["name"], "username": username}}
    except Exception as e:
        print(f"Login error: {e}")
        return JSONResponse(status_code=500, content={"message": "Server error"})

# Serve static files for car images
from fastapi.staticfiles import StaticFiles
import os

# Create static directory if it doesn't exist
os.makedirs("static/car_images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/employee/edit_csv")
def edit_csv_post(request: Request, csv_name: str = Form(...), csv_text: str = Form(...)):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can edit CSVs inline.</p>"))
    allowed = {
        "cars.csv": CARS_TABLE,
        "sales.csv": SALES_TABLE,
        "employees.csv": EMPLOYEES_TABLE,
        "customers.csv": CUSTOMERS_TABLE,
        "services.csv": SERVICES_TABLE,
        "contacts.csv": CONTACTS_TABLE,
        "sell_requests.csv": SELL_REQUESTS_TABLE,
        "carts.csv": CARTS_TABLE,
    }
    if csv_name not in allowed:
        return HTMLResponse(layout("Error", "<p>Invalid csv name.</p>"))
    table_name = allowed[csv_name]
    try:
        df = pd.read_csv(io.StringIO(csv_text))
        write_table(table_name, df)
    except Exception as e:
        return HTMLResponse(layout("Error", f"<p>Failed to save CSV: {e}</p>"))
    return RedirectResponse(url="/employee/dashboard", status_code=303)


# NEW: Edit endpoints for cars, sell requests, services, sales, contacts, employees
@app.get("/employee/edit_car", response_class=HTMLResponse)
def edit_car_get(request: Request, car_id: str):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can edit cars.</p>"))
    cars = read_table(CARS_TABLE)
    sel = cars[cars["id"] == car_id]
    if sel.empty:
        return HTMLResponse(layout("Error", "<p>Car not found.</p>"))
    c = sel.iloc[0]
    body = f"""
    <form method='post' action='/employee/edit_car'>
      <input type='hidden' name='car_id' value='{c.id}'>
      Make:<br><input name='make' value='{c.make}' required><br>
      Model:<br><input name='model' value='{c.model}' required><br>
      Year:<br><input name='year' type='number' value='{int(c.year)}'><br>
      Price:<br><input name='price' type='number' value='{int(c.price)}'><br>
      Mileage:<br><input name='mileage' type='number' value='{int(c.mileage)}'><br>
      Status:<br><input name='status' value='{c.status}'><br>
      <button type='submit'>Save</button>
    </form>
    """
    return HTMLResponse(layout(f"Edit Car {car_id}", body))


@app.post("/employee/edit_car")
def edit_car_post(request: Request, car_id: str = Form(...), make: str = Form(...), model: str = Form(...), year: int = Form(...), price: int = Form(...), mileage: int = Form(...), status: str = Form(...)):
    try:
        username = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if username != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can edit cars.</p>"))
    cars = read_table(CARS_TABLE)
    cars.loc[cars["id"] == car_id, "make"] = make
    cars.loc[cars["id"] == car_id, "model"] = model
    cars.loc[cars["id"] == car_id, "year"] = year
    cars.loc[cars["id"] == car_id, "price"] = price
    cars.loc[cars["id"] == car_id, "mileage"] = mileage
    cars.loc[cars["id"] == car_id, "status"] = status
    write_table(CARS_TABLE, cars)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


@app.get("/employee/edit_employee", response_class=HTMLResponse)
def edit_employee_get(request: Request, username: str):
    try:
        uname = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if uname != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can edit employees.</p>"))
    employees = read_table(EMPLOYEES_TABLE)
    sel = employees[employees["username"] == username]
    if sel.empty:
        return HTMLResponse(layout("Error", "<p>Employee not found.</p>"))
    e = sel.iloc[0]
    body = f"""
    <form method='post' action='/employee/edit_employee'>
      <input type='hidden' name='username' value='{e.username}'>
      Name:<br><input name='name' value='{e.name}'><br>
      New password (leave blank to keep):<br><input name='password' type='password'><br>
      <button type='submit'>Save</button>
    </form>
    """
    return HTMLResponse(layout(f"Edit Employee {username}", body))


@app.post("/employee/edit_employee")
def edit_employee_post(request: Request, username: str = Form(...), name: Optional[str] = Form(None), password: Optional[str] = Form(None)):
    try:
        uname = employee_required(request)
    except HTTPException:
        return RedirectResponse(url="/employee/login")
    if uname != "admin":
        return HTMLResponse(layout("Forbidden", "<p>Only admin can edit employees.</p>"))
    employees = read_table(EMPLOYEES_TABLE)
    if name is not None:
        employees.loc[employees["username"] == username, "name"] = name
    if password:
        employees.loc[employees["username"] == username, "password_hash"] = hash_pw(password)
    write_table(EMPLOYEES_TABLE, employees)
    return RedirectResponse(url="/employee/dashboard", status_code=303)


# Placeholders for other edit endpoints to avoid 404s
@app.get("/employee/edit_sell_request", response_class=HTMLResponse)
def edit_sell_request_stub():
    return HTMLResponse(layout("Not Implemented", "<p>Edit Sell Request not implemented yet.</p>"))

@app.get("/employee/edit_service", response_class=HTMLResponse)
def edit_service_stub():
    return HTMLResponse(layout("Not Implemented", "<p>Edit Service not implemented yet.</p>"))

@app.get("/employee/edit_sale", response_class=HTMLResponse)
def edit_sale_stub():
    return HTMLResponse(layout("Not Implemented", "<p>Edit Sale not implemented yet.</p>"))

@app.get("/employee/edit_contact", response_class=HTMLResponse)
def edit_contact_stub():
    return HTMLResponse(layout("Not Implemented", "<p>Edit Contact not implemented yet.</p>"))




from fastapi import UploadFile, File
import shutil
from pathlib import Path

# Create static directory for car images
STATIC_DIR = Path("static/car_images")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/api/employee/check")
def check_employee_session(request: Request):
    """Check if employee is logged in"""
    try:
        username = employee_required(request)
        employees = read_table(EMPLOYEES_TABLE)
        emp_data = employees[employees["username"] == username]
        if emp_data.empty:
            return JSONResponse(status_code=401, content={"message": "Unauthorized"})
        return {
            "authenticated": True,
            "username": username,
            "name": emp_data.iloc[0].get("name", username)
        }
    except HTTPException:
        return JSONResponse(status_code=401, content={"authenticated": False})

@app.get("/api/employee/stats")
def get_dashboard_stats(request: Request):
    """Get dashboard statistics"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    cars = read_table(CARS_TABLE)
    sales = read_table(SALES_TABLE)
    sell_requests = read_table(SELL_REQUESTS_TABLE)
    services = read_table(SERVICES_TABLE)
    
    return {
        "total_cars": len(cars),
        "available_cars": len(cars[cars["status"] == "available"]) if "status" in cars.columns else len(cars),
        "total_sales": len(sales),
        "pending_sell_requests": len(sell_requests[sell_requests["status"] == "pending"]) if not sell_requests.empty else 0,
        "pending_services": len(services[services["status"] == "pending"]) if not services.empty else 0
    }

@app.get("/api/employee/cars")
def get_all_cars_employee(request: Request):
    """Get all cars for employee dashboard"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    cars = read_table(CARS_TABLE)
    if cars.empty:
        return []
    return cars.to_dict(orient="records")

@app.post("/api/employee/cars")
def add_car_employee(request: Request, car_data: dict = Body(...)):
    """Add a new car"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    cars = read_table(CARS_TABLE)
    new_car = {
        "id": f"car-{uuid.uuid4().hex[:8]}",
        "make": car_data.get("make", ""),
        "model": car_data.get("model", ""),
        "year": int(car_data.get("year", 2020)),
        "price": int(car_data.get("price", 0)),
        "mileage": int(car_data.get("mileage", 0)),
        "fuel": car_data.get("fuel", "Petrol"),
        "transmission": car_data.get("transmission", "Manual"),
        "owner": car_data.get("owner", "1st Owner"),
        "type": car_data.get("type", "sedan"),
        "image": car_data.get("image", ""),
        "description": car_data.get("description", ""),
        "status": car_data.get("status", "available")
    }
    cars = pd.concat([cars, pd.DataFrame([new_car])], ignore_index=True)
    write_table(CARS_TABLE, cars)
    return {"message": "Car added successfully", "car": new_car}

@app.put("/api/employee/cars/{car_id}")
def update_car_employee(request: Request, car_id: str, car_data: dict = Body(...)):
    """Update a car"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    cars = read_table(CARS_TABLE)
    car_idx = cars[cars["id"] == car_id].index
    if car_idx.empty:
        return JSONResponse(status_code=404, content={"message": "Car not found"})
    
    idx = car_idx[0]
    for key, value in car_data.items():
        if key in cars.columns:
            cars.at[idx, key] = value
    
    write_table(CARS_TABLE, cars)
    return {"message": "Car updated successfully"}

@app.delete("/api/employee/cars/{car_id}")
def delete_car_employee(request: Request, car_id: str):
    """Delete a car"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    cars = read_table(CARS_TABLE)
    cars = cars[cars["id"] != car_id]
    write_table(CARS_TABLE, cars)
    return {"message": "Car deleted successfully"}

@app.post("/api/employee/upload-image")
async def upload_car_image(request: Request, file: UploadFile = File(...)):
    """Upload car image"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = STATIC_DIR / filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    return {"url": f"/static/car_images/{filename}", "filename": filename}

@app.get("/api/employee/sales")
def get_all_sales_employee(request: Request):
    """Get all sales"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    sales = read_table(SALES_TABLE)
    if sales.empty:
        return []
    
    # Join with cars to get car details
    cars = read_table(CARS_TABLE)
    customers = read_table(CUSTOMERS_TABLE)
    
    result = []
    for _, sale in sales.iterrows():
        car_data = cars[cars["id"] == sale["car_id"]]
        car_name = f"{car_data.iloc[0]['make']} {car_data.iloc[0]['model']}" if not car_data.empty else "Unknown"
        
        result.append({
            "order_id": sale["order_id"],
            "car_id": sale["car_id"],
            "car_name": car_name,
            "price": int(sale["price"]),
            "timestamp": sale["timestamp"],
            "session_id": sale.get("session_id", "")
        })
    
    return result

@app.get("/api/employee/sell-requests")
def get_all_sell_requests_employee(request: Request):
    """Get all sell requests"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    sell_requests = read_table(SELL_REQUESTS_TABLE)
    if sell_requests.empty:
        return []
    return sell_requests.to_dict(orient="records")

@app.put("/api/employee/sell-requests/{request_id}/status")
def update_sell_request_status(request: Request, request_id: str, status_data: dict = Body(...)):
    """Update sell request status"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    sell_requests = read_table(SELL_REQUESTS_TABLE)
    req_idx = sell_requests[sell_requests["request_id"] == request_id].index
    if req_idx.empty:
        return JSONResponse(status_code=404, content={"message": "Request not found"})
    
    idx = req_idx[0]
    sell_requests.at[idx, "status"] = status_data.get("status", "pending")
    write_table(SELL_REQUESTS_TABLE, sell_requests)
    return {"message": "Status updated successfully"}

@app.get("/api/employee/services")
def get_all_services_employee(request: Request):
    """Get all service bookings"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    services = read_table(SERVICES_TABLE)
    if services.empty:
        return []
    return services.to_dict(orient="records")

@app.put("/api/employee/services/{service_id}/status")
def update_service_status(request: Request, service_id: str, status_data: dict = Body(...)):
    """Update service status"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    services = read_table(SERVICES_TABLE)
    svc_idx = services[services["service_id"] == service_id].index
    if svc_idx.empty:
        return JSONResponse(status_code=404, content={"message": "Service not found"})
    
    idx = svc_idx[0]
    services.at[idx, "status"] = status_data.get("status", "pending")
    write_table(SERVICES_TABLE, services)
    return {"message": "Status updated successfully"}

@app.get("/api/employee/contacts")
def get_all_contacts_employee(request: Request):
    """Get all contact form submissions"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    contacts = read_table(CONTACTS_TABLE)
    if contacts.empty:
        return []
    return contacts.to_dict(orient="records")

@app.get("/api/employee/employees")
def get_all_employees(request: Request):
    """Get all employees (admin only)"""
    try:
        username = employee_required(request)
        # Check if admin
        if username != "admin":
            return JSONResponse(status_code=403, content={"message": "Admin access required"})
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    employees = read_table(EMPLOYEES_TABLE)
    if employees.empty:
        return []
    # Don't return password hashes
    result = employees[["username", "name"]].to_dict(orient="records")
    return result

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/employee/login")
def api_employee_login(response: Response, creds: LoginRequest):
    """JSON login for frontend"""
    employees = read_table(EMPLOYEES_TABLE)
    found = employees[employees["username"] == creds.username]
    if found.empty:
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
    expected = found.iloc[0]["password_hash"]
    if hash_pw(creds.password) != expected:
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
    
    # set cookie
    token = str(uuid.uuid4())
    content = {"message": "Login successful"}
    resp = JSONResponse(content=content)
    resp.set_cookie(EMP_SESSION_COOKIE, token, max_age=60 * 60 * 8)
    
    d = load_emp_sessions()
    d[token] = {"username": creds.username, "login_at": datetime.utcnow().isoformat()}
    save_emp_sessions(d)
    return resp

@app.post("/api/employee/upload-image")
async def upload_car_image(request: Request, file: UploadFile = File(...)):
    """Upload car image"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = Path("static/car_images") / filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    return {"url": f"/static/car_images/{filename}", "filename": filename}

@app.post("/api/employee/upload-video")
async def upload_hero_video(request: Request, file: UploadFile = File(...)):
    """Upload hero video for home page"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    filename = f"hero_{uuid.uuid4().hex}{file_ext}"
    file_path = Path("static/videos") / filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Store video URL in settings
    video_url = f"/static/videos/{filename}"
    
    settings = read_table(SETTINGS_TABLE)
    # remove old if exists
    settings = settings[settings["key"] != "hero_video"]
    # add new
    new_setting = {"key": "hero_video", "value": video_url}
    settings = pd.concat([settings, pd.DataFrame([new_setting])], ignore_index=True)
    write_table(SETTINGS_TABLE, settings)
    
    # Return URL
    return {"url": video_url, "filename": filename}

@app.get("/api/settings/hero-video")
def get_hero_video():
    """Get hero video URL (public endpoint)"""
    settings = read_table(SETTINGS_TABLE)
    row = settings[settings["key"] == "hero_video"]
    
    if not row.empty:
        return {"video_url": row.iloc[0]["value"]}
    return {"video_url": None}

class SocialLinksRequest(BaseModel):
    facebook_url: str = ""
    whatsapp_url: str = ""
    instagram_url: str = ""

@app.post("/api/employee/social-links")
def save_social_links(request: Request, links: SocialLinksRequest):
    """Save social media links (employee auth required)"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    settings = read_table(SETTINGS_TABLE)
    
    # Update or add each social link
    for key, value in [("facebook_url", links.facebook_url), 
                       ("whatsapp_url", links.whatsapp_url), 
                       ("instagram_url", links.instagram_url)]:
        # Remove old if exists
        settings = settings[settings["key"] != key]
        # Add new
        if value:  # Only add if not empty
            new_setting = {"key": key, "value": value}
            settings = pd.concat([settings, pd.DataFrame([new_setting])], ignore_index=True)
    
    write_table(SETTINGS_TABLE, settings)
    return {"message": "Social links saved successfully"}

@app.get("/api/settings/social-links")
def get_social_links():
    """Get social media links (public endpoint)"""
    settings = read_table(SETTINGS_TABLE)
    
    result = {
        "facebook_url": "",
        "whatsapp_url": "",
        "instagram_url": ""
    }
    
    for key in result.keys():
        row = settings[settings["key"] == key]
        if not row.empty:
            result[key] = row.iloc[0]["value"]
    
    return result

@app.post("/api/employee/upload-logo")
async def upload_logo(request: Request, file: UploadFile = File(...)):
    """Upload company logo (employee auth required)"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    # Create logos directory if it doesn't exist
    Path("static/logos").mkdir(parents=True, exist_ok=True)
    
    # Generate filename
    file_ext = Path(file.filename).suffix
    filename = f"logo{file_ext}"
    file_path = Path("static/logos") / filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Store logo URL in settings
    logo_url = f"/static/logos/{filename}"
    
    settings = read_table(SETTINGS_TABLE)
    # Remove old if exists
    settings = settings[settings["key"] != "logo_url"]
    # Add new
    new_setting = {"key": "logo_url", "value": logo_url}
    settings = pd.concat([settings, pd.DataFrame([new_setting])], ignore_index=True)
    write_table(SETTINGS_TABLE, settings)
    
    return {"url": logo_url, "filename": filename}

@app.get("/api/settings/logo")
def get_logo():
    """Get logo URL (public endpoint)"""
    settings = read_table(SETTINGS_TABLE)
    row = settings[settings["key"] == "logo_url"]
    
    if not row.empty:
        return {"logo_url": row.iloc[0]["value"]}
    return {"logo_url": None}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)
