from fastapi import APIRouter, HTTPException
from models import Task, TaskCreate, TaskUpdate
from datetime import datetime
from typing import List

router = APIRouter()

# In-memory database
tasks_db: dict[int, dict] = {}
counter = 1

@router.get("/tasks", response_model=List[Task])
def get_all_tasks():
    return list(tasks_db.values())

@router.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_db[task_id]

@router.post("/tasks", response_model=Task, status_code=201)
def create_task(task: TaskCreate):
    global counter
    new_task = {
        "id": counter,
        "title": task.title,
        "description": task.description or "",
        "completed": False,
        "priority": task.priority or "medium",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    tasks_db[counter] = new_task
    counter += 1
    return new_task

@router.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    existing = tasks_db[task_id]
    if task.title is not None:
        existing["title"] = task.title
    if task.description is not None:
        existing["description"] = task.description
    if task.completed is not None:
        existing["completed"] = task.completed
    if task.priority is not None:
        existing["priority"] = task.priority
    tasks_db[task_id] = existing
    return existing

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    del tasks_db[task_id]
    return {"message": f"Task {task_id} deleted successfully"}
