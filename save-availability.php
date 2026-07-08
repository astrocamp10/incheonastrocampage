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
if (!is_array($schedule) || !isset($schedule['days'], $schedule['times'], $schedule['weeks'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid schedule'], JSON_UNESCAPED_UNICODE);
    exit;
}

$days = $schedule['days'];
$times = $schedule['times'];
$weeks = $schedule['weeks'];

if (!is_array($days) || !is_array($times) || !is_array($weeks)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid schedule arrays'], JSON_UNESCAPED_UNICODE);
    exit;
}

foreach ($weeks as $week) {
    if (!is_array($week) || !isset($week['label'], $week['slots']) || !is_array($week['slots'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid week'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    foreach ($times as $time) {
        if (!isset($week['slots'][$time]) || !is_array($week['slots'][$time])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid slot row'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (count($week['slots'][$time]) !== count($days)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid slot count'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        foreach ($week['slots'][$time] as $status) {
            if ($status !== 'open' && $status !== 'wait') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid slot status'], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
    }
}

$target = __DIR__ . DIRECTORY_SEPARATOR . 'availability.data';
$json = json_encode($schedule, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if ($json === false || file_put_contents($target, $json . PHP_EOL, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
