# Employee Dashboard API Endpoints

from fastapi import UploadFile, File
import shutil
from pathlib import Path

# Create static directories
STATIC_DIR = Path("static/car_images")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

VIDEO_DIR = Path("static/videos")
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

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
    
    for key, value in car_data.items():
        if key in cars.columns:
            cars.loc[car_idx, key] = value
    
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
    file_path = VIDEO_DIR / filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Store video URL in settings
    video_url = f"/static/videos/{filename}"
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ("hero_video", video_url))
    conn.commit()
    conn.close()
    
    # Return URL
    return {"url": video_url, "filename": filename}

@app.get("/api/settings/hero-video")
def get_hero_video():
    """Get hero video URL (public endpoint)"""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = ?", ("hero_video",))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {"video_url": result[0]}
        return {"video_url": None}
    except:
        return {"video_url": None}

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
            "price": sale.get("price", 0),
            "timestamp": sale.get("timestamp", "")
        })
    
    return result

@app.get("/api/employee/sell-requests")
def get_sell_requests_employee(request: Request):
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
    
    sell_requests.loc[req_idx, "status"] = status_data.get("status", "pending")
    write_table(SELL_REQUESTS_TABLE, sell_requests)
    return {"message": "Status updated successfully"}

@app.get("/api/employee/services")
def get_services_employee(request: Request):
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
    
    services.loc[svc_idx, "status"] = status_data.get("status", "pending")
    write_table(SERVICES_TABLE, services)
    return {"message": "Status updated successfully"}

@app.get("/api/employee/contacts")
def get_contacts_employee(request: Request):
    """Get all contact messages"""
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
    """Get all employees"""
    try:
        employee_required(request)
    except HTTPException:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    employees = read_table(EMPLOYEES_TABLE)
    if employees.empty:
        return []
    # Don't return password hashes
    result = employees[["username", "name"]].to_dict(orient="records")
    return result
