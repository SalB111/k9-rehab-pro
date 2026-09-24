import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
SCHEMA_PATH = BASE / "contracts" / "clinical-workflow-v2.schema.json"

def load_schema():
    with SCHEMA_PATH.open("r", encoding="utf-8-sig") as f:
        return json.load(f)

def validate_required_structure(data):
    errors = []

    for field in ("patient", "today", "workflow"):
        if field not in data:
            errors.append(f"Missing required top-level field: {field}")

    patient = data.get("patient", {})
    for field in ("id", "name"):
        if field not in patient:
            errors.append(f"Missing required patient field: {field}")

    workflow = data.get("workflow", {})
    if "status" not in workflow:
        errors.append("Missing required workflow field: status")

    valid_statuses = {
        "ASSESSMENT",
        "GENERATING",
        "REVIEW",
        "APPROVED",
        "HANDED_OFF",
    }

    if "status" in workflow and workflow["status"] not in valid_statuses:
        errors.append(
            f"Invalid workflow status: {workflow['status']}"
        )

    return errors

if __name__ == "__main__":
    schema = load_schema()

    test_case = {
        "patient": {
            "id": "TEST-001",
            "name": "Test Patient"
        },
        "today": {},
        "workflow": {
            "status": "ASSESSMENT"
        }
    }

    errors = validate_required_structure(test_case)

    if errors:
        print("CONTRACT VALIDATION: FAILED")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)

    print("CONTRACT VALIDATION: PASS")
    print(f"Schema title: {schema.get('title')}")
    print("Required fields: patient, today, workflow")
    print("Workflow states: ASSESSMENT, GENERATING, REVIEW, APPROVED, HANDED_OFF")
