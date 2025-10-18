import psutil
import time
import requests
import threading
import platform
import json
import hmac
import hashlib

# ---------------- CONFIG ----------------
API_URL = "http://127.0.0.1:6969/api/alert"  # Local Flask API
WATCH_INTERVAL = 5  # seconds
TARGET_PROCESSES = ["anydesk", "chrome-remote-desktop", "teamviewer", "rustdesk"]
CLIENT_ID = "machine-001"  # Hardcoded client ID
API_KEY = "supersecretkey123"  # MUST match server HMAC
# ----------------------------------------


def make_signature(payload_json: str, secret: str):
    return hmac.new(secret.encode(), payload_json.encode(), hashlib.sha256).hexdigest()


def send_alert(process_name):
    payload = {
        "client_id": "machine-001",
        "roomId": "room-001",  # must match frontend
        "process": process_name,
        "ts": int(time.time()),
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    signature = make_signature(payload_json, API_KEY)
    headers = {"Content-Type": "application/json", "X-Watcher-Signature": signature}
    try:
        r = requests.post(API_URL, data=payload_json, headers=headers, timeout=5)
        print(f"[!] Alert sent for {process_name}: {r.status_code}")
    except Exception as e:
        print(f"[x] Failed to send alert: {e}")


def check_processes():
    for proc in psutil.process_iter(attrs=["name"]):
        try:
            name = proc.info["name"]
            if not name:
                continue
            name_lower = name.lower()
            for target in TARGET_PROCESSES:
                if target in name_lower:
                    print(f"[!] Detected forbidden process: {name_lower}")
                    send_alert(name_lower)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue


def run_watcher():
    while True:
        check_processes()
        time.sleep(WATCH_INTERVAL)


def start_background():
    t = threading.Thread(target=run_watcher, daemon=True)
    t.start()
    print("[+] Watcher started in background.")


if __name__ == "__main__":
    start_background()
    while True:
        time.sleep(60)
