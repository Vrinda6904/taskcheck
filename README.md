# Task Manager — FastAPI + HTML/CSS/JS

A full-stack task manager app built with Python, FastAPI, and vanilla HTML/CSS/JS.

## Tech Stack

| Layer    | Tech            |
|----------|-----------------|
| Backend  | Python + FastAPI |
| API      | REST (JSON)     |
| Frontend | HTML + CSS + JS |
| Docs     | Swagger (auto)  |

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
uvicorn main:app --reload

# 3. Open in browser
# App  → http://localhost:8000
# Docs → http://localhost:8000/docs
```

## REST API Endpoints

| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| GET    | /api/tasks      | Get all tasks      |
| GET    | /api/tasks/{id} | Get one task       |
| POST   | /api/tasks      | Create a task      |
| PUT    | /api/tasks/{id} | Update a task      |
| DELETE | /api/tasks/{id} | Delete a task      |

## Project Structure

```
task-manager/
├── main.py          ← FastAPI app, mounts static files
├── models.py        ← Pydantic data models
├── routes.py        ← All REST API routes
├── requirements.txt
└── static/
    ├── index.html   ← Main UI
    ├── style.css    ← Styling
    └── app.js       ← API calls via fetch()
```

## Example API Usage (curl)

```bash
# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "priority": "high"}'

# Get all tasks
curl http://localhost:8000/api/tasks

# Mark complete
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete
curl -X DELETE http://localhost:8000/api/tasks/1
```
