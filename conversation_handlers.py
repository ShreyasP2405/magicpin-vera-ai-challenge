from __future__ import annotations

import re
from typing import Any


AUTO_REPLY_PATTERNS = [
    r"thank you for contacting",
    r"thanks for contacting",
    r"team will respond",
    r"will respond shortly",
    r"automated assistant",
    r"auto(?:mated)? reply",
    r"business hours",
    r"we have received your message",
]

INTENT_PATTERNS = [
    r"\byes\b",
    r"\bok\b",
    r"go ahead",
    r"let'?s do",
    r"confirm",
    r"send",
    r"start",
    r"proceed",
    r"join magicpin",
    r"update (my )?(google )?profile",
    r"what'?s next",
]

STOP_PATTERNS = [
    r"\bstop\b",
    r"not interested",
    r"do not message",
    r"don't message",
    r"unsubscribe",
    r"useless",
    r"spam",
    r"bothering me",
    r"shut up",
]

OFF_TOPIC_PATTERNS = [
    r"\bgst\b",
    r"income tax",
    r"file my tax",
    r"loan",
    r"personal account",
]


def _matches(patterns: list[str], text: str) -> bool:
    return any(re.search(pattern, text, flags=re.I) for pattern in patterns)


def detect_auto_reply(message: str, state: dict[str, Any] | None = None) -> bool:
    text = message.strip().lower()
    if _matches(AUTO_REPLY_PATTERNS, text):
        return True
    turns = (state or {}).get("turns", [])
    same = [t for t in turns if t.get("from") != "bot" and t.get("body", "").strip().lower() == text]
    return len(same) >= 2


def detect_intent(message: str) -> bool:
    return _matches(INTENT_PATTERNS, message)


def detect_stop(message: str) -> bool:
    return _matches(STOP_PATTERNS, message)


def detect_off_topic(message: str) -> bool:
    return _matches(OFF_TOPIC_PATTERNS, message)


def respond(state: dict[str, Any], merchant_message: str) -> dict[str, Any]:
    text = merchant_message.strip()
    lowered = text.lower()

    if detect_stop(text):
        return {
            "action": "end",
            "rationale": "Merchant/customer explicitly opted out or showed frustration; closing cleanly.",
        }

    if detect_auto_reply(text, state):
        state["auto_reply_count"] = int(state.get("auto_reply_count", 0)) + 1
        count = state["auto_reply_count"]
        if count == 1:
            return {
                "action": "wait",
                "wait_seconds": 14400,
                "rationale": "Detected WhatsApp Business auto-reply; backing off instead of wasting turns.",
            }
        if count == 2:
            return {
                "action": "wait",
                "wait_seconds": 86400,
                "rationale": "Same auto-reply pattern repeated; owner likely unavailable, waiting 24h.",
            }
        return {
            "action": "end",
            "rationale": "Auto-reply repeated 3 times; ending conversation to avoid pollution.",
        }

    if detect_off_topic(text):
        return {
            "action": "send",
            "body": "That part is outside what Vera can handle directly, so your CA or internal team should own it. Coming back to this account action: reply YES and I will prepare the draft/checklist now.",
            "cta": "binary_yes_no",
            "rationale": "Declined out-of-scope request and redirected once to the current Vera task.",
        }

    if detect_intent(text):
        if "join magicpin" in lowered:
            body = "Great, I will move this to action. Please share the business name, city, and owner phone once; I will prepare the magicpin onboarding request from there. Reply CONFIRM when ready."
        elif "update" in lowered and "profile" in lowered:
            body = "Got it. I will treat this as a profile-update task now, not another qualification round. Send the exact change you want, or reply CONFIRM and I will prepare the missing-fields checklist first."
        else:
            body = "Great, moving to action now. I will prepare the draft/checklist from the context already shared. Reply CONFIRM to proceed, or CHANGE if you want edits first."
        return {
            "action": "send",
            "body": body,
            "cta": "binary_confirm_cancel",
            "rationale": "Detected explicit commitment and switched from pitching to action.",
        }

    if any(word in lowered for word in ["later", "busy", "tomorrow", "after some time"]):
        return {
            "action": "wait",
            "wait_seconds": 1800,
            "rationale": "Merchant asked for time; backing off 30 minutes.",
        }

    return {
        "action": "send",
        "body": "Understood. I can keep this simple: I will draft the next step using your current account data, and you can approve or edit it. Reply YES to see the draft.",
        "cta": "binary_yes_no",
        "rationale": "Acknowledged ambiguous reply and offered one low-friction next step.",
    }
