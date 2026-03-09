import pytest
from fastapi.testclient import TestClient
from backend.main import app
import backend.database as db
import os
import json

client = TestClient(app)

DB_FILE = db.DB_FILE

@pytest.fixture(autouse=True)
def clear_db():
    # Remove tasks.json before each test to ensure "Given: No tasks exist."
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    yield
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def test_create_task_with_all_fields_valid():
    body = {
        'description': 'Write and review all docs for the new release',
        'due_date': '2024-07-15',
        'priority': 'High',
        'title': 'Complete project documentation',
        'user_name': 'alice'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 200
    resp_json = response.json()
    for k in body:
        assert resp_json[k] == body[k]
    assert 'id' in resp_json

def test_create_task_with_missing_title():
    body = {
        'description': 'No title provided',
        'due_date': '2024-08-01',
        'priority': 'Medium',
        'user_name': 'bob'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    # FastAPI returns 422 for validation errors, but implementation may return 400
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_missing_description():
    body = {
        'due_date': '2024-07-20',
        'priority': 'Low',
        'title': 'Task without description',
        'user_name': 'carol'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_missing_priority():
    body = {
        'description': 'Testing priority field',
        'due_date': '2024-07-22',
        'title': 'Task without priority',
        'user_name': 'dave'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_missing_due_date():
    body = {
        'description': 'Testing due_date field',
        'priority': 'High',
        'title': 'Task without due date',
        'user_name': 'eve'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_missing_user_name():
    body = {
        'description': 'Testing user_name field',
        'due_date': '2024-07-25',
        'priority': 'Medium',
        'title': 'Task without user name'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_empty_title():
    body = {
        'description': 'Empty title test',
        'due_date': '2024-07-30',
        'priority': 'Low',
        'title': '',
        'user_name': 'frank'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 200
    resp_json = response.json()
    for k in body:
        assert resp_json[k] == body[k]
    assert 'id' in resp_json

def test_create_task_with_maximum_field_lengths():
    max_str = 'T' * 255
    max_desc = 'D' * 255
    body = {
        'description': max_desc,
        'due_date': '2024-08-10',
        'priority': 'High',
        'title': max_str,
        'user_name': 'max_length_user'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 200
    resp_json = response.json()
    for k in body:
        assert resp_json[k] == body[k]
    assert 'id' in resp_json

def test_create_task_with_priority_as_numeric_value():
    body = {
        'description': 'Priority as number',
        'due_date': '2024-07-28',
        'priority': 1,
        'title': 'Numeric priority test',
        'user_name': 'numeric_priority'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 200 or response.status_code == 422
    resp_json = response.json()
    if response.status_code == 200:
        for k in body:
            assert resp_json[k] == body[k]
        assert 'id' in resp_json
    else:
        assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_due_date_in_the_past():
    body = {
        'description': 'Verify handling of past due_date',
        'due_date': '2020-01-01',
        'priority': 'Low',
        'title': 'Past due date test',
        'user_name': 'past_due'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 200
    resp_json = response.json()
    for k in body:
        assert resp_json[k] == body[k]
    assert 'id' in resp_json

def test_create_task_with_invalid_due_date_format():
    body = {
        'description': 'Due date not ISO format',
        'due_date': '15-07-2024',
        'priority': 'Medium',
        'title': 'Invalid due date format',
        'user_name': 'invalid_date'
    }
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json

def test_create_task_with_empty_request_body():
    body = {}
    response = client.post("/tasks", json=body)
    assert response.status_code == 400 or response.status_code == 422
    resp_json = response.json()
    assert 'error' in resp_json or 'detail' in resp_json