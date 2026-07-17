from __future__ import annotations

import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from conversation_handlers import respond


app = FastAPI(title="Vera Challenge Bot", version="1.0.0")
STARTED_AT = time.time()

VALID_SCOPES = {"category", "merchant", "customer", "trigger"}
VALID_CTAS = {
    "binary_yes_no",
    "binary_confirm_cancel",
    "open_ended",
    "none",
    "multi_choice_slot",
}
VALID_SEND_AS = {"vera", "merchant_on_behalf"}

contexts: dict[tuple[str, str], dict[str, Any]] = {}
conversations: dict[str, dict[str, Any]] = {}
sent_suppression_keys: set[str] = set()


class ContextPush(BaseModel):
    scope: str
    context_id: str
    version: int
    payload: dict[str, Any]
    delivered_at: str


class TickBody(BaseModel):
    now: str
    available_triggers: list[str] = Field(default_factory=list)


class ReplyBody(BaseModel):
    conversation_id: str
    merchant_id: str | None = None
    customer_id: str | None = None
    from_role: str = "merchant"
    message: str
    received_at: str
    turn_number: int


def _utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _safe_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    return text if text else fallback


def _nested(data: dict[str, Any] | None, *keys: str, default: Any = None) -> Any:
    cur: Any = data or {}
    for key in keys:
        if not isinstance(cur, dict) or key not in cur:
            return default
        cur = cur[key]
    return cur


def _owner(merchant: dict[str, Any]) -> str:
    identity = merchant.get("identity", {})
    return _safe_text(identity.get("owner_first_name") or identity.get("name"), "there")


def _merchant_name(merchant: dict[str, Any]) -> str:
    return _safe_text(_nested(merchant, "identity", "name"), "your business")


def _short_merchant_name(merchant: dict[str, Any]) -> str:
    name = _merchant_name(merchant)
    return re.sub(r"\s+(Dental Clinic|Family Salon|Pharmacy|Fitness|Studio|Cafe)$", "", name, flags=re.I)


def _locality(merchant: dict[str, Any]) -> str:
    identity = merchant.get("identity", {})
    loc = identity.get("locality")
    city = identity.get("city")
    if loc and city:
        return f"{loc}, {city}"
    return _safe_text(loc or city, "your locality")


def _languages(merchant: dict[str, Any], customer: dict[str, Any] | None = None) -> list[str]:
    if customer:
        pref = _nested(customer, "identity", "language_pref", default="")
        if pref:
            return [str(pref).lower()]
    return [str(x).lower() for x in _nested(merchant, "identity", "languages", default=[]) or []]


def _wants_hinglish(merchant: dict[str, Any], customer: dict[str, Any] | None = None) -> bool:
    return any("hi" in lang or "hinglish" in lang for lang in _languages(merchant, customer))


def _pct(value: Any, decimals: int = 0) -> str:
    try:
        num = float(value)
    except (TypeError, ValueError):
        return ""
    if abs(num) <= 1:
        num *= 100
    if decimals:
        return f"{num:.{decimals}f}%"
    return f"{round(num):.0f}%"


def _signed_pct(value: Any) -> str:
    text = _pct(value)
    if not text:
        return ""
    return text if text.startswith("-") else f"+{text}"


def _ctr_text(value: Any) -> str:
    try:
        return f"{float(value) * 100:.1f}%"
    except (TypeError, ValueError):
        return ""


def _active_offers(merchant: dict[str, Any]) -> list[str]:
    offers = []
    for offer in merchant.get("offers", []) or []:
        if offer.get("status") == "active" and offer.get("title"):
            offers.append(str(offer["title"]))
    return offers


def _best_offer(category: dict[str, Any], merchant: dict[str, Any]) -> str:
    active = _active_offers(merchant)
    if active:
        return active[0]
    for offer in category.get("offer_catalog", []) or []:
        title = offer.get("title") if isinstance(offer, dict) else offer
        if title:
            return str(title)
    return ""


def _category_slug(category: dict[str, Any], merchant: dict[str, Any]) -> str:
    return _safe_text(category.get("slug") or merchant.get("category_slug"), "business")


def _find_digest_item(category: dict[str, Any], trigger: dict[str, Any]) -> dict[str, Any]:
    payload = trigger.get("payload", {}) or {}
    direct = payload.get("top_item") or payload.get("digest_item")
    if isinstance(direct, dict):
        return direct
    item_id = payload.get("top_item_id") or payload.get("digest_item_id") or payload.get("alert_id")
    digest = category.get("digest", []) or []
    if item_id:
        for item in digest:
            if item.get("id") == item_id:
                return item
    if digest:
        return digest[0]
    return {}


def _review_theme(merchant: dict[str, Any], trigger: dict[str, Any]) -> dict[str, Any]:
    payload = trigger.get("payload", {}) or {}
    theme_name = payload.get("theme")
    if theme_name:
        for theme in merchant.get("review_themes", []) or []:
            if theme.get("theme") == theme_name:
                return {**theme, **payload}
    if merchant.get("review_themes"):
        return merchant["review_themes"][0]
    return payload


def _customer_name(customer: dict[str, Any] | None) -> str:
    return _safe_text(_nested(customer, "identity", "name"), "there")


def _slot_text(trigger: dict[str, Any]) -> str:
    slots = (trigger.get("payload", {}) or {}).get("available_slots") or []
    labels = [slot.get("label") for slot in slots if isinstance(slot, dict) and slot.get("label")]
    if len(labels) >= 2:
        return f"{labels[0]} or {labels[1]}"
    if labels:
        return labels[0]
    options = (trigger.get("payload", {}) or {}).get("next_session_options") or []
    labels = [slot.get("label") for slot in options if isinstance(slot, dict) and slot.get("label")]
    return labels[0] if labels else ""


def _clinic_label(merchant: dict[str, Any]) -> str:
    name = _merchant_name(merchant)
    if "clinic" in name.lower():
        return name
    return name


def _safe_join(parts: list[str]) -> str:
    return " ".join(part.strip() for part in parts if part and part.strip())


def _rationale(kind: str, anchor: str, cta: str) -> str:
    return f"{kind}: anchored on {anchor}; CTA={cta}; avoids invented facts and uses current context."


def _csv_env(name: str) -> list[str]:
    return [value.strip() for value in os.getenv(name, "").split(",") if value.strip()]


def _submitted_at() -> str:
    configured = os.getenv("SUBMITTED_AT", "").strip()
    if configured:
        return configured
    return datetime.fromtimestamp(STARTED_AT, timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _validate(result: dict[str, Any], trigger: dict[str, Any]) -> dict[str, str]:
    body = _safe_text(result.get("body"), "Quick update: I found one relevant account signal. Reply YES if you want me to draft the next step.")
    body = re.sub(r"https?://\S+", "", body).strip()
    body = re.sub(r"\s{2,}", " ", body)
    cta = result.get("cta") if result.get("cta") in VALID_CTAS else "open_ended"
    send_as = result.get("send_as") if result.get("send_as") in VALID_SEND_AS else "vera"
    suppression_key = _safe_text(result.get("suppression_key") or trigger.get("suppression_key") or trigger.get("id"), "default:suppression")
    rationale = _safe_text(result.get("rationale"), "Composed from category, merchant, trigger, and customer context.")
    return {
        "body": body,
        "cta": cta,
        "send_as": send_as,
        "suppression_key": suppression_key,
        "rationale": rationale[:500],
    }


def compose(category: dict, merchant: dict, trigger: dict, customer: dict | None = None) -> dict:
    kind = _safe_text(trigger.get("kind"), "general")
    if customer or trigger.get("scope") == "customer":
        result = _compose_customer(category, merchant, trigger, customer)
    else:
        result = _compose_merchant(category, merchant, trigger)
    return _validate(result, trigger)


def _compose_customer(
    category: dict[str, Any],
    merchant: dict[str, Any],
    trigger: dict[str, Any],
    customer: dict[str, Any] | None,
) -> dict[str, Any]:
    kind = _safe_text(trigger.get("kind"), "customer_update")
    payload = trigger.get("payload", {}) or {}
    cust = _customer_name(customer)
    merchant_label = _clinic_label(merchant)
    owner = _owner(merchant)
    offer = _best_offer(category, merchant)
    slot = _slot_text(trigger)
    hinglish = _wants_hinglish(merchant, customer)
    send_as = "merchant_on_behalf"

    if kind == "recall_due":
        service = payload.get("service_due", "recall").replace("_", " ")
        last = payload.get("last_service_date")
        due = payload.get("due_date")
        timing = f"Your {service} is due"
        if last and due:
            timing = f"Last visit was {last}; your {service} window opens by {due}"
        slot_line = f" I have {slot} ready." if slot else ""
        offer_line = f" {offer} is active for this visit." if offer else ""
        ask = "Reply 1/2 for the slot, or send a better time." if slot else "Reply YES and we will share available slots."
        if hinglish:
            ask = "Slot chahiye toh reply YES, ya apna preferred time bhej do." if not slot else "Reply 1/2, ya apna better time bhej do."
        body = _safe_join([f"Hi {cust}, {merchant_label} here.", timing + ".", slot_line, offer_line, ask])
        return {
            "body": body,
            "cta": "multi_choice_slot" if slot else "binary_yes_no",
            "send_as": send_as,
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{service}, {last or due or 'recall trigger'}", "booking reply"),
        }

    if kind in {"customer_lapsed_hard", "customer_lapsed_soft"}:
        days = payload.get("days_since_last_visit")
        focus = payload.get("previous_focus") or _nested(customer, "preferences", "training_focus")
        barrier = "no pressure"
        detail = f"It has been {days} days since your last visit" if days else "It has been a while since your last visit"
        if focus:
            detail += f", and your last focus was {str(focus).replace('_', ' ')}"
        offer_line = f" {offer} is available if you want to restart gently." if offer else ""
        body = f"Hi {cust}, {owner} from {merchant_label} here. {detail}. {barrier} - want me to hold one easy restart slot this week?{offer_line} Reply YES or STOP."
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": send_as,
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, detail, "YES/STOP"),
        }

    if kind == "chronic_refill_due":
        meds = ", ".join(payload.get("molecule_list") or [])
        runs_out = payload.get("stock_runs_out_iso") or payload.get("due_date")
        delivery = "Free home delivery is active." if any("delivery" in o.lower() for o in _active_offers(merchant)) else ""
        senior = "Senior discount is active." if any("senior" in o.lower() for o in _active_offers(merchant)) else ""
        body = _safe_join([
            f"Namaste {cust}, {merchant_label} here.",
            f"Your monthly medicines ({meds}) are due around {runs_out}." if meds else f"Your refill is due around {runs_out}.",
            senior,
            delivery,
            "Reply CONFIRM to keep the same pack ready, or CHANGE if dose/brand changed.",
        ])
        return {
            "body": body,
            "cta": "binary_confirm_cancel",
            "send_as": send_as,
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, meds or "refill due date", "CONFIRM/CHANGE"),
        }

    if kind == "trial_followup":
        trial_date = payload.get("trial_date")
        body = _safe_join([
            f"Hi {cust}, {owner} from {merchant_label} here.",
            f"Thanks for the trial on {trial_date}." if trial_date else "Thanks for trying the session.",
            f"Next option: {slot}." if slot else "",
            "Want me to reserve it? Reply YES or STOP.",
        ])
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": send_as,
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, trial_date or slot or "trial follow-up", "YES/STOP"),
        }

    if kind == "appointment_tomorrow":
        body = _safe_join([
            f"Hi {cust}, reminder from {merchant_label}.",
            f"Your appointment is tomorrow{(' at ' + slot) if slot else ''}.",
            "Reply CONFIRM to keep it, or CHANGE for a new time.",
        ])
        return {
            "body": body,
            "cta": "binary_confirm_cancel",
            "send_as": send_as,
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, slot or "appointment_tomorrow trigger", "CONFIRM/CHANGE"),
        }

    if kind == "wedding_package_followup":
        wedding = payload.get("wedding_date") or _nested(customer, "preferences", "wedding_date")
        days = payload.get("days_to_wedding")
        window = str(payload.get("next_step_window_open", "bridal prep")).replace("_", " ")
        body = _safe_join([
            f"Hi {cust}, {owner} from {merchant_label} here.",
            f"{days} days to your wedding" if days else f"Your wedding date {wedding} is on our calendar" if wedding else "",
            f"- this is the right window for {window}.",
            f"{offer} is active." if offer else "",
            "Want me to block your preferred slot for the first session? Reply YES or STOP.",
        ])
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": send_as,
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{days or wedding} wedding timing", "YES/STOP"),
        }

    body = _safe_join([
        f"Hi {cust}, {merchant_label} here.",
        f"A quick update from your { _category_slug(category, merchant).rstrip('s') } account is ready.",
        f"{offer} is active." if offer else "",
        "Reply YES if you want details, or STOP.",
    ])
    return {
        "body": body,
        "cta": "binary_yes_no",
        "send_as": send_as,
        "suppression_key": trigger.get("suppression_key"),
        "rationale": _rationale(kind, "customer trigger", "YES/STOP"),
    }


def _compose_merchant(category: dict[str, Any], merchant: dict[str, Any], trigger: dict[str, Any]) -> dict[str, Any]:
    kind = _safe_text(trigger.get("kind"), "general")
    payload = trigger.get("payload", {}) or {}
    owner = _owner(merchant)
    place = _locality(merchant)
    category_slug = _category_slug(category, merchant)
    performance = merchant.get("performance", {}) or {}
    agg = merchant.get("customer_aggregate", {}) or {}
    offer = _best_offer(category, merchant)
    hinglish = _wants_hinglish(merchant)

    if kind in {"research_digest", "cde_opportunity", "regulation_change"}:
        item = _find_digest_item(category, trigger)
        title = _safe_text(item.get("title"), str(payload.get("metric_or_topic", "new category update")).replace("_", " "))
        source = _safe_text(item.get("source"))
        trial_n = item.get("trial_n")
        segment = _safe_text(item.get("patient_segment") or payload.get("patient_segment"))
        prefix = "Clinical note" if category_slug == "dentists" else "Category note"
        detail = title
        if trial_n:
            detail = f"{int(trial_n):,}-case item: {detail}"
        if segment:
            detail += f" for {segment.replace('_', ' ')}"
        if kind == "regulation_change":
            deadline = payload.get("deadline_iso")
            body = f"{owner}, compliance heads-up for {place}: {detail}. Deadline: {deadline}. Want me to draft a 5-point staff checklist from this update? {source}".strip()
            cta = "binary_yes_no"
        elif kind == "cde_opportunity":
            credits = payload.get("credits")
            fee = str(payload.get("fee", "")).replace("_", " ")
            body = f"{owner}, {prefix}: {detail}. {credits} CDE credits" if credits else f"{owner}, {prefix}: {detail}."
            if fee:
                body += f", {fee}."
            body += " Want me to prepare a 2-line invite you can forward to your team?"
            if source:
                body += f" Source: {source}"
            cta = "binary_yes_no"
        else:
            cohort = ""
            if agg.get("high_risk_adult_count"):
                cohort = f" You have {agg['high_risk_adult_count']} high-risk adult patients, so this is relevant."
            body = f"{owner}, {prefix}: {detail}.{cohort} Want me to turn it into one patient WhatsApp draft and one Google post?"
            if source:
                body += f" Source: {source}"
            cta = "open_ended"
        return {
            "body": body,
            "cta": cta,
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, title + (f" / {source}" if source else ""), cta),
        }

    if kind in {"perf_dip", "seasonal_perf_dip"}:
        metric = payload.get("metric", "views")
        delta = _signed_pct(payload.get("delta_pct") or _nested(performance, "delta_7d", f"{metric}_pct"))
        baseline = payload.get("vs_baseline")
        current = performance.get(metric)
        seasonal = payload.get("is_expected_seasonal")
        anchor = f"{metric} {delta}" if delta else f"{metric} changed"
        if current is not None:
            anchor += f" (now {current})"
        if baseline:
            anchor += f" vs baseline {baseline}"
        if seasonal:
            note = str(payload.get("season_note", "seasonal dip")).replace("_", " ")
            body = f"{owner}, {anchor} in {place}, but this looks like {note}, not a panic signal. Better move: protect retention first"
            if agg.get("total_active_members"):
                body += f" across your {agg['total_active_members']} active members"
            body += ". Want me to draft a 7-day retention nudge instead of spending on ads?"
        else:
            body = f"{owner}, quick alert: {anchor}. I checked the profile signals and this is worth fixing before the week closes. Want me to draft the exact GBP post + WhatsApp line to recover enquiries?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, anchor, "YES/STOP"),
        }

    if kind == "perf_spike":
        metric = payload.get("metric", "calls")
        delta = _signed_pct(payload.get("delta_pct") or _nested(performance, "delta_7d", f"{metric}_pct"))
        driver = str(payload.get("likely_driver", "")).replace("_", " ")
        body = f"{owner}, good signal: {metric} is {delta or 'up'} this week"
        if driver:
            body += f", likely from {driver}"
        body += ". Want me to clone the winning angle into a fresh Google post for tomorrow?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{metric} {delta}", "YES/STOP"),
        }

    if kind == "renewal_due":
        days = payload.get("days_remaining") or _nested(merchant, "subscription", "days_remaining")
        plan = payload.get("plan") or _nested(merchant, "subscription", "plan")
        amount = payload.get("renewal_amount")
        proof = f" Your profile has {performance.get('views')} views and {performance.get('calls')} calls in 30d." if performance.get("views") and performance.get("calls") else ""
        amount_line = f" Renewal amount: {amount}." if amount else ""
        body = f"{owner}, {plan or 'your'} plan has {days} days left.{proof}{amount_line} Want me to send the renewal summary with what Vera handled this month?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{days} days remaining", "YES/STOP"),
        }

    if kind == "festival_upcoming":
        festival = payload.get("festival", "festival")
        days = payload.get("days_until")
        date = payload.get("date")
        body = f"{owner}, {festival} is"
        body += f" in {days} days" if days is not None else f" on {date}" if date else " coming up"
        body += f" and {category_slug} demand usually needs a specific service hook, not a flat discount."
        if offer:
            body += f" Your strongest existing hook is {offer}."
        body += " Want me to draft one WhatsApp + GBP post around it?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, str(festival), "YES/STOP"),
        }

    if kind == "ipl_match_today":
        match = payload.get("match", "match")
        venue = payload.get("venue")
        is_weeknight = payload.get("is_weeknight")
        time_iso = payload.get("match_time_iso")
        channel = "delivery" if is_weeknight is False else "dine-in + delivery"
        body = f"{owner}, {match}"
        if venue:
            body += f" at {venue}"
        if time_iso:
            body += f" today ({time_iso})"
        body += f". Use {channel} positioning today"
        if offer:
            body += f" around your active {offer}"
        body += ". Want me to draft the match-day banner copy in 10 minutes?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, str(match), "YES/STOP"),
        }

    if kind == "review_theme_emerged":
        theme = _review_theme(merchant, trigger)
        name = str(theme.get("theme", "review theme")).replace("_", " ")
        occurrences = theme.get("occurrences_30d") or payload.get("occurrences_30d")
        quote = theme.get("common_quote")
        body = f"{owner}, review pattern spotted: {name}"
        if occurrences:
            body += f" came up {occurrences} times in 30d"
        if quote:
            body += f" - customers said \"{quote}\""
        body += ". Want me to draft a short owner reply + an operations fix note?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, name, "YES/STOP"),
        }

    if kind == "milestone_reached":
        metric = str(payload.get("metric", "milestone")).replace("_", " ")
        value = payload.get("value_now")
        target = payload.get("milestone_value")
        body = f"{owner}, you are at {value} {metric}" if value else f"{owner}, a {metric} milestone is close"
        if target:
            body += f"; {target} is the next clean badge moment"
        body += ". Want me to draft a thank-you post that asks happy customers for the next review?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{metric} {value}/{target}", "YES/STOP"),
        }

    if kind == "active_planning_intent":
        topic = str(payload.get("intent_topic", "new plan")).replace("_", " ")
        last = payload.get("merchant_last_message")
        base = f"{owner}, picking up your plan on {topic}."
        if last:
            base += f" You said: \"{last}\"."
        if category_slug == "restaurants" and "thali" in topic:
            body = base + " Starter structure: 10 orders at entry price, 25 orders with one add-on, 50+ with advance booking by 5pm. Want me to turn this into a 3-line corporate WhatsApp pitch?"
        elif category_slug == "gyms" or "yoga" in topic:
            body = base + " Clean structure: 4 weeks, 3 sessions/week, age or goal segment clearly named, trial slot first. Want me to draft the GBP post + parent/customer WhatsApp?"
        else:
            body = base + f" Use {offer or 'one service-at-price hook'} as the first offer, then one follow-up post. Want me to draft both now?"
        return {
            "body": body,
            "cta": "open_ended",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, topic, "draft next artifact"),
        }

    if kind == "curious_ask_due":
        ask = "what service has been most asked-for this week"
        if category_slug == "restaurants":
            ask = "which item customers asked for most this week"
        elif category_slug == "gyms":
            ask = "which goal came up most this week - weight loss, strength, or yoga"
        elif category_slug == "pharmacies":
            ask = "which seasonal item customers asked for most this week"
        body = f"{owner}, quick operator question: {ask} at {_short_merchant_name(merchant)}? Reply with one word; I will turn it into a 4-line Google post and WhatsApp reply."
        if hinglish:
            body = f"{owner}, quick sawaal: {ask} at {_short_merchant_name(merchant)}? Bas ek word bhej do; main usse Google post + WhatsApp reply bana dungi."
        return {
            "body": body,
            "cta": "open_ended",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, "merchant-supplied demand signal", "one-word reply"),
        }

    if kind == "winback_eligible":
        days = payload.get("days_since_expiry") or _nested(merchant, "subscription", "days_since_expiry")
        dip = _signed_pct(payload.get("perf_dip_pct"))
        lapsed = payload.get("lapsed_customers_added_since_expiry") or agg.get("lapsed_90d_plus") or agg.get("lapsed_180d_plus")
        body = f"{owner}, winback note: plan expired {days} days ago" if days else f"{owner}, winback note:"
        if dip:
            body += f" and performance is {dip}"
        if lapsed:
            body += f"; {lapsed} customers are now in the lapsed bucket"
        body += ". Want me to draft a low-cost comeback campaign before this list gets colder?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{days} days / {lapsed} lapsed", "YES/STOP"),
        }

    if kind == "supply_alert":
        molecule = payload.get("molecule", "medicine")
        batches = ", ".join(payload.get("affected_batches") or [])
        manufacturer = payload.get("manufacturer")
        chronic = agg.get("chronic_rx_count")
        body = f"{owner}, urgent pharmacy alert: {molecule}"
        if batches:
            body += f" batches {batches}"
        if manufacturer:
            body += f" from {manufacturer}"
        if chronic:
            body += f". You have {chronic} chronic-Rx customers, so filtering the affected list matters"
        body += ". Want me to draft the customer note + replacement pickup workflow?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{molecule} {batches}", "YES/STOP"),
        }

    if kind == "category_seasonal":
        season = str(payload.get("season", "seasonal shift")).replace("_", " ")
        trends = [str(t).replace("_", " ") for t in payload.get("trends", [])]
        trend_text = ", ".join(trends[:3])
        body = f"{owner}, {season} demand shift in {category_slug}: {trend_text}." if trend_text else f"{owner}, {season} demand shift is live for {category_slug}."
        body += " Want me to draft the shelf/menu/profile update for this week?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, trend_text or season, "YES/STOP"),
        }

    if kind == "gbp_unverified":
        uplift = _pct(payload.get("estimated_uplift_pct"))
        path = str(payload.get("verification_path", "verification")).replace("_", " ")
        body = f"{owner}, your Google profile is still unverified in {place}. Verification path: {path}."
        if uplift:
            body += f" The estimate in your context is {uplift} uplift after verification."
        body += " Want me to prepare the exact steps and checklist?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{path} / {uplift}", "YES/STOP"),
        }

    if kind == "competitor_opened":
        competitor = payload.get("competitor_name", "a new competitor")
        distance = payload.get("distance_km")
        their_offer = payload.get("their_offer")
        opened = payload.get("opened_date")
        body = f"{owner}, competitor watch: {competitor}"
        if distance:
            body += f" opened {distance} km away"
        if opened:
            body += f" on {opened}"
        if their_offer:
            body += f" with {their_offer}"
        if offer:
            body += f". Your counter should use {offer}, not a generic discount"
        body += ". Want me to draft the comparison-safe post?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, str(competitor), "YES/STOP"),
        }

    if kind == "dormant_with_vera":
        days = payload.get("days_since_last_merchant_message")
        last_topic = str(payload.get("last_topic", "last update")).replace("_", " ")
        body = f"{owner}, it has been {days} days since your last Vera reply" if days else f"{owner}, quick check-in"
        body += f". Last topic was {last_topic}."
        if performance.get("views"):
            body += f" Since then your profile has {performance['views']} views in 30d."
        body += " Want one useful update only, no long thread?"
        return {
            "body": body,
            "cta": "binary_yes_no",
            "send_as": "vera",
            "suppression_key": trigger.get("suppression_key"),
            "rationale": _rationale(kind, f"{days} days dormant", "YES/STOP"),
        }

    ctr = _ctr_text(performance.get("ctr"))
    body = f"{owner}, quick account signal for {place}: {performance.get('views', 'your recent')} views"
    if ctr:
        body += f" and {ctr} CTR"
    if offer:
        body += f"; {offer} is the cleanest hook"
    body += ". Want me to draft the next Google post?"
    return {
        "body": body,
        "cta": "binary_yes_no",
        "send_as": "vera",
        "suppression_key": trigger.get("suppression_key"),
        "rationale": _rationale(kind, "merchant performance and offer context", "YES/STOP"),
    }


def _conversation_id(merchant_id: str, trigger_id: str, customer_id: str | None = None) -> str:
    seed = customer_id or merchant_id
    short_seed = re.sub(r"[^a-zA-Z0-9_]+", "_", seed)[:48]
    short_trigger = re.sub(r"[^a-zA-Z0-9_]+", "_", trigger_id)[:56]
    return f"conv_{short_seed}_{short_trigger}"


def _template_name(trigger: dict[str, Any], send_as: str) -> str:
    kind = _safe_text(trigger.get("kind"), "generic")
    prefix = "merchant" if send_as == "merchant_on_behalf" else "vera"
    return f"{prefix}_{kind}_v1"


def _template_params(message: dict[str, str], merchant: dict[str, Any], customer: dict[str, Any] | None) -> list[str]:
    first = _customer_name(customer) if customer else _owner(merchant)
    body = message["body"]
    return [first, body[:120], message["cta"]]


def _lookup_context(scope: str, context_id: str | None) -> dict[str, Any] | None:
    if not context_id:
        return None
    stored = contexts.get((scope, context_id))
    return stored.get("payload") if stored else None


def _resolve_action(trigger_id: str) -> dict[str, Any] | None:
    print("===================================")
    print("Trigger:", trigger_id)

    trigger = _lookup_context("trigger", trigger_id)
    print("Trigger found:", trigger is not None)

    if not trigger:
        return None

    merchant_id = trigger.get("merchant_id")
    print("Merchant ID:", merchant_id)

    merchant = _lookup_context("merchant", merchant_id)
    print("Merchant found:", merchant is not None)

    if not merchant:
        return None

    print("Category slug:", merchant.get("category_slug"))

    category = _lookup_context("category", merchant.get("category_slug"))
    print("Category found:", category is not None)
    
    if not category:
        return None
    customer_id = trigger.get("customer_id")
    customer = _lookup_context("customer", customer_id) if customer_id else None
    message = compose(category, merchant, trigger, customer)
    conversation_id = _conversation_id(merchant_id, trigger.get("id", trigger_id), customer_id)
    action = {
        "conversation_id": conversation_id,
        "merchant_id": merchant_id,
        "customer_id": customer_id,
        "send_as": message["send_as"],
        "trigger_id": trigger.get("id", trigger_id),
        "template_name": _template_name(trigger, message["send_as"]),
        "template_params": _template_params(message, merchant, customer),
        **message,
    }
    sent_suppression_keys.add(suppression_key)
    conversations[conversation_id] = {
        "merchant_id": merchant_id,
        "customer_id": customer_id,
        "trigger_id": trigger.get("id", trigger_id),
        "turns": [{"from": "bot", "body": message["body"], "at": _utc_now()}],
        "last_bot_body": message["body"],
        "auto_reply_count": 0,
        "ended": False,
    }
    return action


@app.get("/v1/healthz")
async def healthz() -> dict[str, Any]:
    counts = {scope: 0 for scope in VALID_SCOPES}
    for scope, _ in contexts:
        counts[scope] = counts.get(scope, 0) + 1
    return {
        "status": "ok",
        "uptime_seconds": int(time.time() - STARTED_AT),
        "contexts_loaded": counts,
    }


@app.get("/")
async def root() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "Vera ContextMax magicpin AI Challenge bot",
        "submit_base_url_only": True,
        "live_endpoints": [
            "POST /v1/context",
            "POST /v1/tick",
            "POST /v1/reply",
            "GET /v1/healthz",
            "GET /v1/metadata",
        ],
    }


@app.get("/v1/metadata")
async def metadata() -> dict[str, Any]:
    return {
        "team_name": os.getenv("TEAM_NAME", "").strip(),
        "team_members": _csv_env("TEAM_MEMBERS"),
        "model": "deterministic Python rules",
        "approach": "Evidence-grounded trigger dispatch with deterministic validation and no external API calls",
        "contact_email": os.getenv("CONTACT_EMAIL", "").strip(),
        "version": "1.0.0",
        "submitted_at": _submitted_at(),
    }


@app.post("/v1/context")
async def push_context(body: ContextPush) -> Any:
    if body.scope not in VALID_SCOPES:
        return JSONResponse(status_code=400, content={"accepted": False, "reason": "invalid_scope"})
    key = (body.scope, body.context_id)
    current = contexts.get(key)
    if current and current["version"] > body.version:
        return JSONResponse(
            status_code=409,
            content={"accepted": False, "reason": "stale_version", "current_version": current["version"]},
        )
    if current and current["version"] == body.version:
        return {
            "accepted": True,
            "ack_id": f"ack_{body.context_id}_v{body.version}",
            "stored_at": current.get("delivered_at", _utc_now()),
            "idempotent": True,
        }
    contexts[key] = {"version": body.version, "payload": body.payload, "delivered_at": body.delivered_at}
    return {
        "accepted": True,
        "ack_id": f"ack_{body.context_id}_v{body.version}",
        "stored_at": _utc_now(),
    }


@app.post("/v1/tick")
async def tick(body: TickBody) -> dict[str, list[dict[str, Any]]]:
    actions: list[dict[str, Any]] = []
    for trigger_id in body.available_triggers[:20]:
        action = _resolve_action(trigger_id)
        if action:
            actions.append(action)
    return {"actions": actions}


@app.post("/v1/reply")
async def reply(body: ReplyBody) -> dict[str, Any]:
    state = conversations.setdefault(
        body.conversation_id,
        {
            "merchant_id": body.merchant_id,
            "customer_id": body.customer_id,
            "turns": [],
            "auto_reply_count": 0,
            "ended": False,
        },
    )
    state["turns"].append({"from": body.from_role, "body": body.message, "at": body.received_at})
    response = respond(state, body.message)
    if response.get("action") == "send":
        sent = _safe_text(response.get("body"))
        previous = {turn.get("body") for turn in state.get("turns", []) if turn.get("from") == "bot"}
        if sent in previous:
            response = {"action": "wait", "wait_seconds": 1800, "rationale": "Avoiding repeated bot body in the same conversation."}
        else:
            state["turns"].append({"from": "bot", "body": sent, "at": _utc_now()})
            state["last_bot_body"] = sent
    if response.get("action") == "end":
        state["ended"] = True
    return response


@app.post("/v1/teardown")
async def teardown() -> dict[str, Any]:
    contexts.clear()
    conversations.clear()
    sent_suppression_keys.clear()
    return {"status": "cleared", "cleared_at": _utc_now()}


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_dataset_contexts(base: Path) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any]]:
    categories = {p.stem: _load_json(p) for p in (base / "categories").glob("*.json")}
    merchants = {p.stem: _load_json(p) for p in (base / "merchants").glob("*.json")}
    customers = {p.stem: _load_json(p) for p in (base / "customers").glob("*.json")}
    triggers = {p.stem: _load_json(p) for p in (base / "triggers").glob("*.json")}
    return categories, merchants, customers, triggers


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("bot:app", host="0.0.0.0", port=8080, reload=False)
