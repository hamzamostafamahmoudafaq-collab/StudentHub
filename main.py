
from fastapi import FastAPI, HTTPException
import sqlite3
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://studenthub-1-b9rt.onrender.com",
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Database
conn = sqlite3.connect("mydatabae.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL
    )
""")

conn.commit()


# Home page
@app.get("/")
def home():
    return FileResponse("static/index.html")


# Get all students
@app.get("/students")
def display():
    cursor.execute("SELECT * FROM students")
    data = cursor.fetchall()
    return data


# Get one student by name
@app.get("/{name}")
def show_id(name: str):
    cursor.execute(
        "SELECT * FROM students WHERE name = ?",
        (name,)
    )

    student = cursor.fetchone()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


# Add a student
@app.post("/product")
def add_student(name: str, age: int):
    cursor.execute(
        """
        INSERT INTO students (name, age)
        VALUES (?, ?)
        """,
        (name, age)
    )

    conn.commit()

    return {"message": "Student added successfully"}


# Delete a student
@app.delete("/delete/{id}")
def delete_student(id: int):
    cursor.execute(
        "DELETE FROM students WHERE id = ?",
        (id,)
    )

    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return {"message": "Student deleted successfully"}


# Update a student
@app.put("/update/{id}")
def update_student(id: int, name: str, age: int):
    cursor.execute(
        """
        UPDATE students
        SET name = ?, age = ?
        WHERE id = ?
        """,
        (name, age, id)
    )

    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return {"message": "Student updated successfully"}
