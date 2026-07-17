# Vera ContextMax

Deterministic submission for the magicpin AI Challenge. The bot is a FastAPI service plus a rule-first composer that uses the four required contexts: category, merchant, trigger, and optional customer.

## Approach

`bot.py` exposes the required public judge endpoints: `POST /v1/context`, `POST /v1/tick`, `POST /v1/reply`, `GET /v1/healthz`, and `GET /v1/metadata`. `compose()` dispatches by trigger kind and anchors every message on fields actually present in the context: performance numbers, offers, digest citations, review themes, subscription days, slots, customer state, and trigger payload values. It does not call external APIs or require an LLM, so responses are deterministic and fast.

## Hallucination Control

The composer only uses extracted context facts. If an offer, citation, competitor, slot, or count is missing, it omits that claim instead of inventing it. Output validation removes URLs, enforces valid `send_as` and `cta` values, and preserves the trigger suppression key.

## Replay Handling

`conversation_handlers.py` detects WhatsApp auto-replies, repeated canned replies, explicit action intent, opt-outs, hostile messages, and off-topic asks. Clear intent moves directly to action; repeated auto-replies wait or end; opt-outs end the conversation.

## Run Locally

```bash
pip install -r requirements.txt
python dataset/generate_dataset.py --seed-dir dataset --out dataset/expanded
python generate_submission.py
set TEAM_NAME=Your Team
set TEAM_MEMBERS=Your Name
set CONTACT_EMAIL=you@example.com
set SUBMITTED_AT=2026-07-10T12:00:00Z
uvicorn bot:app --host 0.0.0.0 --port 8080
python judge_simulator.py
```

For the portal screenshot requirement, submit the public base URL of the running service. The live routes are under `/v1/*`.
The metadata endpoint reads team/contact/submission values from environment variables, so set them before starting `uvicorn` or restart the running process after changing them.

## Persistent Public URL

The current Cloudflare quick tunnel URL only works while this computer is on and both `uvicorn` and `cloudflared` are running. For a URL that keeps working after shutdown, deploy the FastAPI service to a cloud host.

This repo includes `render.yaml`, `.python-version`, and a `Dockerfile`. The simplest path is Render:

1. Push this folder to a GitHub repository.
2. In Render, create a new Blueprint/Web Service from that repo.
3. Set `CONTACT_EMAIL` and `SUBMITTED_AT` in the service environment.
4. Deploy, then submit the generated `https://<service>.onrender.com` base URL.

Keep `numInstances: 1` for the challenge because the bot stores pushed context in process memory during a judge run. For the most reliable judging window, use an always-on instance instead of a sleeping free instance.

## Tradeoffs

The bot favors reliability, speed, and no-hallucination behavior over model-generated prose variety. A production version would improve with real appointment inventory, richer peer benchmarks, and verified channel-specific template approvals.
