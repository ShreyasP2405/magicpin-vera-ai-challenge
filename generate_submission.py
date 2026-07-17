from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from bot import compose


ROOT = Path(__file__).resolve().parent
DATASET = ROOT / "dataset"
EXPANDED = DATASET / "expanded"


def ensure_expanded_dataset() -> None:
    if (EXPANDED / "test_pairs.json").exists():
        return
    subprocess.check_call(
        [
            sys.executable,
            str(DATASET / "generate_dataset.py"),
            "--seed-dir",
            str(DATASET),
            "--out",
            str(EXPANDED),
        ],
        cwd=str(ROOT),
    )


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    ensure_expanded_dataset()
    pairs = read_json(EXPANDED / "test_pairs.json")["pairs"]
    out_path = ROOT / "submission.jsonl"
    lines = []
    for pair in pairs:
        trigger = read_json(EXPANDED / "triggers" / f"{pair['trigger_id']}.json")
        merchant = read_json(EXPANDED / "merchants" / f"{pair['merchant_id']}.json")
        category = read_json(EXPANDED / "categories" / f"{merchant['category_slug']}.json")
        customer = None
        if pair.get("customer_id"):
            customer = read_json(EXPANDED / "customers" / f"{pair['customer_id']}.json")
        message = compose(category, merchant, trigger, customer)
        lines.append(json.dumps({"test_id": pair["test_id"], **message}, ensure_ascii=False))
    if len(lines) != 30:
        raise RuntimeError(f"Expected 30 submission lines, got {len(lines)}")
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(lines)} lines to {out_path}")


if __name__ == "__main__":
    main()
