from __future__ import annotations

from fastapi.testclient import TestClient

import bot


def test_public_endpoint_contract() -> None:
    client = TestClient(bot.app)
    client.post("/v1/teardown")

    assert client.get("/v1/healthz").status_code == 200
    assert client.get("/v1/metadata").status_code == 200

    category = {
        "slug": "dentists",
        "offer_catalog": [{"title": "Dental Cleaning @ 299"}],
        "digest": [{"id": "d1", "title": "3-month recall improves compliance 38%", "source": "JIDA Oct 2026"}],
    }
    merchant = {
        "merchant_id": "m_test",
        "category_slug": "dentists",
        "identity": {"name": "Dr. Test Clinic", "owner_first_name": "Dr. Test", "locality": "Lajpat Nagar", "city": "Delhi", "languages": ["en", "hi"]},
        "performance": {"views": 1200, "calls": 20, "ctr": 0.025},
        "offers": [{"title": "Dental Cleaning @ 299", "status": "active"}],
        "customer_aggregate": {"high_risk_adult_count": 40},
    }
    trigger = {
        "id": "trg_test",
        "scope": "merchant",
        "kind": "research_digest",
        "merchant_id": "m_test",
        "customer_id": None,
        "payload": {"top_item_id": "d1"},
        "suppression_key": "research:test",
    }

    for scope, cid, payload in [
        ("category", "dentists", category),
        ("merchant", "m_test", merchant),
        ("trigger", "trg_test", trigger),
    ]:
        response = client.post("/v1/context", json={"scope": scope, "context_id": cid, "version": 1, "payload": payload, "delivered_at": "2026-04-26T00:00:00Z"})
        assert response.status_code == 200

    repeated = client.post("/v1/context", json={"scope": "merchant", "context_id": "m_test", "version": 1, "payload": merchant, "delivered_at": "2026-04-26T00:01:00Z"})
    assert repeated.status_code == 200
    assert repeated.json()["accepted"] is True
    assert repeated.json()["idempotent"] is True

    updated_merchant = {**merchant, "performance": {**merchant["performance"], "views": 1300}}
    updated = client.post("/v1/context", json={"scope": "merchant", "context_id": "m_test", "version": 2, "payload": updated_merchant, "delivered_at": "2026-04-26T00:02:00Z"})
    assert updated.status_code == 200
    assert updated.json()["accepted"] is True

    stale = client.post("/v1/context", json={"scope": "merchant", "context_id": "m_test", "version": 1, "payload": merchant, "delivered_at": "2026-04-26T00:02:30Z"})
    assert stale.status_code == 409
    assert stale.json()["reason"] == "stale_version"

    invalid = client.post("/v1/context", json={"scope": "bad", "context_id": "bad", "version": 1, "payload": {}, "delivered_at": "2026-04-26T00:03:00Z"})
    assert invalid.status_code == 400
    assert invalid.json()["reason"] == "invalid_scope"

    tick = client.post("/v1/tick", json={"now": "2026-04-26T00:05:00Z", "available_triggers": ["trg_test"]})
    assert tick.status_code == 200
    actions = tick.json()["actions"]
    assert len(actions) == 1
    assert actions[0]["body"]
    assert actions[0]["template_name"]

    reply = client.post("/v1/reply", json={"conversation_id": actions[0]["conversation_id"], "merchant_id": "m_test", "from_role": "merchant", "message": "Ok lets do it", "received_at": "2026-04-26T00:06:00Z", "turn_number": 2})
    assert reply.status_code == 200
    assert reply.json()["action"] == "send"


def test_metadata_uses_environment(monkeypatch) -> None:
    monkeypatch.setenv("TEAM_NAME", "Codes Intuition")
    monkeypatch.setenv("TEAM_MEMBERS", "Shreyas, Teammate")
    monkeypatch.setenv("CONTACT_EMAIL", "contact@example.com")
    monkeypatch.setenv("SUBMITTED_AT", "2026-07-10T12:00:00Z")

    client = TestClient(bot.app)
    data = client.get("/v1/metadata").json()

    assert data["team_name"] == "Codes Intuition"
    assert data["team_members"] == ["Shreyas", "Teammate"]
    assert data["contact_email"] == "contact@example.com"
    assert data["submitted_at"] == "2026-07-10T12:00:00Z"
    assert data["model"] == "deterministic Python rules"
    assert "gemini" not in data["model"].lower()
    assert "langchain" not in data["approach"].lower()


def test_metadata_has_no_fake_identity_defaults(monkeypatch) -> None:
    monkeypatch.delenv("TEAM_NAME", raising=False)
    monkeypatch.delenv("TEAM_MEMBERS", raising=False)
    monkeypatch.delenv("CONTACT_EMAIL", raising=False)
    monkeypatch.delenv("SUBMITTED_AT", raising=False)

    client = TestClient(bot.app)
    data = client.get("/v1/metadata").json()

    assert data["team_name"] == ""
    assert data["team_members"] == []
    assert data["contact_email"] == ""
    assert data["submitted_at"]
    assert data["submitted_at"] != "2026-07-09T20:06:06.341645Z"
