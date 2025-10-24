#!/usr/bin/env python3
"""
rating_utils.py

Utility to fetch ratings for a product by ID, using Flask-SQLAlchemy shared DB session.

Exports:
- get_ratings_for_id(label_id: str) -> dict | None

Returned dict format:
{
  "id": "...",
  "overall_score": 7.25,
  "overall_label": "Good",
  "categories": [
      {"name": "Purity", "score": 7.5, "label": "Good", "justification": "..." },
      ...
  ],
  "updated_at": "2025-09-17T00:00:00Z"
}
"""

import logging
import json
import time
from datetime import datetime, timezone
from sqlalchemy import text

# ✅ Adjust this import to match your actual Flask project structure
# Example: if db is defined in backend_server/__init__.py
#from backend_server import db, create_app

from backend_server.utils.database_tools.db_query import db_execute


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Category mapping
CATEGORY_ORDER = [
    ("Purity", "purity"),
    ("Potency", "potency"),
    ("Additives", "additives"),
    ("Safety", "safety"),
    ("Evidence", "evidence"),
    ("Brand", "brand"),
    ("Environmental", "env"),
]


def score_to_label(score: float) -> str:
    if score is None:
        return None
    if score >= 8.5:
        return "Great"
    if score >= 6.5:
        return "Good"
    if score >= 4.0:
        return "Okay"
    return "Bad"


def _row_to_result(row_dict):
    """Convert SQLAlchemy RowMapping to desired output structure."""
    if not row_dict:
        return None

    out = {
        "id": row_dict.get("id"),
        "overall_score": float(row_dict["overall_score"]) if row_dict.get("overall_score") is not None else None,
        "overall_label": score_to_label(row_dict.get("overall_score")) if row_dict.get("overall_score") is not None else None,
        "categories": [],
        "updated_at": None,
    }

    # Handle updated_at field
    updated = row_dict.get("updated_at")
    if updated:
        if isinstance(updated, datetime):
            out["updated_at"] = updated.astimezone(timezone.utc).isoformat()
        else:
            out["updated_at"] = str(updated)

    # Category fields
    for cat_name, suffix in CATEGORY_ORDER:
        score_col = f"{suffix}_score"
        just_col = f"{suffix}_just_text"
        score_val = row_dict.get(score_col)
        just_text = row_dict.get(just_col)
        out["categories"].append({
            "name": cat_name,
            "score": float(score_val) if score_val is not None else None,
            "label": score_to_label(score_val) if score_val is not None else None,
            "justification": just_text or ""
        })

    return out


def get_ratings_for_id(label_id: str):
    """Return ratings & justifications for a label id, or None if not found."""
    select_fields = [
        "r.id",
        "r.overall_score",
        "r.updated_at",
    ]
    join_clauses = []
    for cat_name, suffix in CATEGORY_ORDER:
        select_fields.append(f"r.{suffix}_score AS {suffix}_score")
        select_fields.append(f"jt_{suffix}.text AS {suffix}_just_text")
        join_clauses.append(
            f"LEFT JOIN justification_texts jt_{suffix} ON r.{suffix}_just_id = jt_{suffix}.id"
        )

    sql_query = f"""
    SELECT
      {', '.join(select_fields)}
    FROM ratings r
    {' '.join(join_clauses)}
    WHERE r.id = :label_id
    LIMIT 1;
    """

    result = db_execute(sql_query, {"label_id": label_id})
    print(f"TYPE: {type(result)}")
    print(result)
    result = result[0] if result else None
    return _row_to_result(result if result else None)


# For CLI testing
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        #print("Usage: python rating_utils.py <label_id>")
        #sys.exit(1)
        lid = 246430
    else:
        lid = sys.argv[1]
    res = get_ratings_for_id(lid)
    str_version = json.dumps(res, indent=2, default=str)
    for i, line in enumerate(str_version.splitlines()):
        time.sleep(0.05)
        print(f"{i} : {line}")
