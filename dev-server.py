import argparse
import json
import re
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PASSWORD = "dlscjsastro10"
AVAILABILITY_FILE = ROOT / "availability.data"
EXPERIENCE_FILE = ROOT / "experience.data"
EXPERIENCE_PROGRAMS = {"가족과 함께하는 우주여행", "일일별자리체험"}
EXPERIENCE_STATUSES = {"open", "wait", "closed"}


class AstroHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".data": "application/json; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".html": "text/html; charset=utf-8",
    }

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        route = {
            "/save-availability.php": (AVAILABILITY_FILE, validate_schedule),
            "/save-experience.php": (EXPERIENCE_FILE, validate_experience),
        }.get(path)

        if route is None:
            self.send_json({"success": False, "message": "Not found"}, HTTPStatus.NOT_FOUND)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            self.send_json({"success": False, "message": "Invalid JSON"}, HTTPStatus.BAD_REQUEST)
            return

        if payload.get("password") != PASSWORD:
            self.send_json({"success": False, "message": "Invalid password"}, HTTPStatus.FORBIDDEN)
            return

        target_file, validator = route
        schedule = payload.get("schedule")
        error = validator(schedule)
        if error:
            self.send_json({"success": False, "message": error}, HTTPStatus.BAD_REQUEST)
            return

        target_file.write_text(
            json.dumps(schedule, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        self.send_json({"success": True})

    def send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def validate_schedule(schedule):
    if not isinstance(schedule, dict):
        return "Invalid schedule"

    days = schedule.get("days")
    times = schedule.get("times")
    weeks = schedule.get("weeks")
    if not isinstance(days, list) or not isinstance(times, list) or not isinstance(weeks, list):
        return "Invalid schedule arrays"

    for week in weeks:
        if not isinstance(week, dict) or not isinstance(week.get("slots"), dict):
            return "Invalid week"
        for time in times:
            row = week["slots"].get(time)
            if not isinstance(row, list) or len(row) != len(days):
                return "Invalid slot row"
            if any(status not in ("open", "wait") for status in row):
                return "Invalid slot status"
    return None


def validate_experience(schedule):
    if not isinstance(schedule, dict):
        return "Invalid schedule"

    events = schedule.get("events")
    if not isinstance(events, list):
        return "Invalid events"

    for event in events:
        if not isinstance(event, dict):
            return "Invalid event"

        event_id = event.get("id")
        date = event.get("date")
        time = event.get("time")
        title = event.get("title")
        status = event.get("status")
        memo = event.get("memo", "")

        if not isinstance(event_id, str) or not event_id or len(event_id) > 80:
            return "Invalid event id"
        if not isinstance(date, str) or not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            return "Invalid event date"
        if not isinstance(time, str) or not re.match(r"^\d{2}:\d{2}$", time):
            return "Invalid event time"
        if title not in EXPERIENCE_PROGRAMS:
            return "Invalid event title"
        if status not in EXPERIENCE_STATUSES:
            return "Invalid event status"
        if not isinstance(memo, str) or len(memo) > 300:
            return "Invalid event memo"

    events.sort(key=lambda item: f"{item.get('date', '')}{item.get('time', '')}")
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("port", nargs="?", type=int, default=5500)
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.bind, args.port), AstroHandler)
    print(f"Serving {ROOT} at http://{args.bind}:{args.port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
