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
COURSE_FILE = ROOT / "course.data"
INSTAGRAM_FILE = ROOT / "instagram.data"
EXPERIENCE_STATUSES = {"open", "wait", "closed"}
COURSE_KEYS = {"starter", "experience", "inquiry", "theme"}
OBSERVATION_KEYS = {"winter", "spring", "summer", "autumn"}


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
            "/save-course.php": (COURSE_FILE, validate_course),
            "/save-instagram.php": (INSTAGRAM_FILE, validate_instagram),
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

    notice_enabled = schedule.get("mainNoticeEnabled")
    if notice_enabled is None:
        schedule["mainNoticeEnabled"] = True
    elif not isinstance(notice_enabled, bool):
        return "Invalid main notice setting"

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
        if not isinstance(title, str) or not title.strip() or len(title.strip()) > 60:
            return "Invalid event title"
        event["title"] = title.strip()
        if status not in EXPERIENCE_STATUSES:
            return "Invalid event status"
        if not isinstance(memo, str) or len(memo) > 300:
            return "Invalid event memo"

    events.sort(key=lambda item: f"{item.get('date', '')}{item.get('time', '')}")
    return None


def validate_course(schedule):
    if not isinstance(schedule, dict):
        return "Invalid course data"

    tuition = schedule.get("tuition")
    if not isinstance(tuition, dict):
        return "Invalid tuition"

    monthly_tuition = tuition.get("monthlyTeamTuition")
    if not isinstance(monthly_tuition, (int, float)) or monthly_tuition < 0 or monthly_tuition > 10000000:
        return "Invalid tuition amount"

    for field in ("paymentLabel", "materialNote"):
        value = tuition.get(field, "")
        if not isinstance(value, str) or len(value.strip()) > 300:
            return f"Invalid {field}"
        tuition[field] = value.strip()

    observation_targets = schedule.get("observationTargets")
    if not isinstance(observation_targets, dict):
        return "Invalid observation targets"

    for key in OBSERVATION_KEYS:
        targets = observation_targets.get(key)
        if not isinstance(targets, list) or len(targets) > 30:
            return "Invalid observation target list"
        cleaned = []
        for target in targets:
            if not isinstance(target, str):
                return "Invalid observation target"
            target = target.strip()
            if target and len(target) <= 80:
                cleaned.append(target)
        observation_targets[key] = cleaned

    observation_targets["summerExperience"] = list(observation_targets["summer"])

    curricula = schedule.get("curricula")
    if not isinstance(curricula, dict):
        return "Invalid curricula"

    for key in COURSE_KEYS:
        course = curricula.get(key)
        if not isinstance(course, dict):
            return "Invalid course"

        for field in ("kicker", "title", "summary", "videoId", "videoTitle"):
            value = course.get(field, "")
            if not isinstance(value, str) or len(value.strip()) > 600:
                return f"Invalid course {field}"
            course[field] = value.strip()

        meta = course.get("meta", [])
        if not isinstance(meta, list) or len(meta) > 8:
            return "Invalid course meta"
        cleaned_meta = []
        for item in meta:
            if not isinstance(item, list) or len(item) != 2:
                return "Invalid course meta item"
            label, value = item
            if not isinstance(label, str) or not isinstance(value, str):
                return "Invalid course meta text"
            if len(label.strip()) > 40 or len(value.strip()) > 120:
                return "Invalid course meta length"
            cleaned_meta.append([label.strip(), value.strip()])
        course["meta"] = cleaned_meta

        rows = course.get("rows")
        if not isinstance(rows, list) or len(rows) > 40:
            return "Invalid course rows"
        cleaned_rows = []
        for row in rows:
            if not isinstance(row, list) or len(row) != 4:
                return "Invalid course row"
            cleaned_row = []
            for cell in row:
                if not isinstance(cell, str) or len(cell.strip()) > 160:
                    return "Invalid course row cell"
                cleaned_row.append(cell.strip())
            if any(cleaned_row):
                cleaned_rows.append(cleaned_row)
        course["rows"] = cleaned_rows

        notes = course.get("notes", [])
        if not isinstance(notes, list) or len(notes) > 12:
            return "Invalid course notes"
        cleaned_notes = []
        for note in notes:
            if not isinstance(note, str) or len(note.strip()) > 300:
                return "Invalid course note"
            if note.strip():
                cleaned_notes.append(note.strip())
        course["notes"] = cleaned_notes

    return None


def validate_instagram(schedule):
    if not isinstance(schedule, dict):
        return "Invalid Instagram data"

    posts = schedule.get("posts")
    if not isinstance(posts, list) or len(posts) > 6:
        return "Instagram posts must contain at most 6 URLs"

    pattern = re.compile(
        r"^https://www\.instagram\.com/(p|reel|tv)/([A-Za-z0-9_-]{3,100})/$"
    )
    cleaned_posts = []
    for url in posts:
        if not isinstance(url, str) or len(url) > 220:
            return "Invalid Instagram URL"
        match = pattern.fullmatch(url.strip())
        if not match:
            return "Only Instagram post or reel URLs are allowed"
        canonical_url = f"https://www.instagram.com/{match.group(1)}/{match.group(2)}/"
        if canonical_url not in cleaned_posts:
            cleaned_posts.append(canonical_url)

    schedule.clear()
    schedule["posts"] = cleaned_posts
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
