<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST only'], JSON_UNESCAPED_UNICODE);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($payload['password'] ?? '') !== 'dlscjsastro10') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid password'], JSON_UNESCAPED_UNICODE);
    exit;
}

$schedule = $payload['schedule'] ?? null;
if (!is_array($schedule) || !isset($schedule['events']) || !is_array($schedule['events'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid schedule'], JSON_UNESCAPED_UNICODE);
    exit;
}

$allowedStatuses = ['open', 'wait', 'closed'];
$allowedPrograms = ['가족과 함께하는 우주여행', '일일별자리체험'];

foreach ($schedule['events'] as $event) {
    if (!is_array($event)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $id = $event['id'] ?? '';
    $date = $event['date'] ?? '';
    $time = $event['time'] ?? '';
    $title = $event['title'] ?? '';
    $status = $event['status'] ?? '';
    $memo = $event['memo'] ?? '';

    if (!is_string($id) || $id === '' || strlen($id) > 80) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event id'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_string($date) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event date'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_string($time) || preg_match('/^\d{2}:\d{2}$/', $time) !== 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event time'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_string($title) || !in_array($title, $allowedPrograms, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event title'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_string($status) || !in_array($status, $allowedStatuses, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event status'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_string($memo) || strlen($memo) > 300) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid event memo'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

usort($schedule['events'], static function (array $a, array $b): int {
    return strcmp(($a['date'] ?? '') . ($a['time'] ?? ''), ($b['date'] ?? '') . ($b['time'] ?? ''));
});

$target = __DIR__ . DIRECTORY_SEPARATOR . 'experience.data';
$json = json_encode($schedule, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if ($json === false || file_put_contents($target, $json . PHP_EOL, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
