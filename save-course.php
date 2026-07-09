<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

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
if (!is_array($schedule)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid course data'], JSON_UNESCAPED_UNICODE);
    exit;
}

$courseKeys = ['starter', 'experience', 'inquiry', 'theme'];
$observationKeys = ['winter', 'spring', 'summer', 'autumn'];

$tuition = $schedule['tuition'] ?? null;
if (!is_array($tuition)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid tuition'], JSON_UNESCAPED_UNICODE);
    exit;
}

$monthlyTuition = $tuition['monthlyTeamTuition'] ?? null;
if (!is_int($monthlyTuition) && !is_float($monthlyTuition)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid tuition amount'], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($monthlyTuition < 0 || $monthlyTuition > 10000000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid tuition amount'], JSON_UNESCAPED_UNICODE);
    exit;
}

foreach (['paymentLabel', 'materialNote'] as $field) {
    $value = $tuition[$field] ?? '';
    if (!is_string($value) || text_length(trim($value)) > 300) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid ' . $field], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $schedule['tuition'][$field] = trim($value);
}

$observationTargets = $schedule['observationTargets'] ?? null;
if (!is_array($observationTargets)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid observation targets'], JSON_UNESCAPED_UNICODE);
    exit;
}

foreach ($observationKeys as $key) {
    $targets = $observationTargets[$key] ?? null;
    if (!is_array($targets) || count($targets) > 30) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid observation target list'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $cleaned = [];
    foreach ($targets as $target) {
        if (!is_string($target)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid observation target'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $target = trim($target);
        if ($target !== '' && text_length($target) <= 80) {
            $cleaned[] = $target;
        }
    }
    $schedule['observationTargets'][$key] = $cleaned;
}
$schedule['observationTargets']['summerExperience'] = $schedule['observationTargets']['summer'];

$curricula = $schedule['curricula'] ?? null;
if (!is_array($curricula)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid curricula'], JSON_UNESCAPED_UNICODE);
    exit;
}

foreach ($courseKeys as $key) {
    $course = $curricula[$key] ?? null;
    if (!is_array($course)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid course'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    foreach (['kicker', 'title', 'summary', 'videoId', 'videoTitle'] as $field) {
        $value = $course[$field] ?? '';
        if (!is_string($value) || text_length(trim($value)) > 600) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid course ' . $field], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $schedule['curricula'][$key][$field] = trim($value);
    }

    $meta = $course['meta'] ?? [];
    if (!is_array($meta) || count($meta) > 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid course meta'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $cleanedMeta = [];
    foreach ($meta as $item) {
        if (!is_array($item) || count($item) !== 2 || !is_string($item[0]) || !is_string($item[1])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid course meta item'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $cleanedMeta[] = [trim($item[0]), trim($item[1])];
    }
    $schedule['curricula'][$key]['meta'] = $cleanedMeta;

    $rows = $course['rows'] ?? null;
    if (!is_array($rows) || count($rows) > 40) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid course rows'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $cleanedRows = [];
    foreach ($rows as $row) {
        if (!is_array($row) || count($row) !== 4) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid course row'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $cleanedRow = [];
        foreach ($row as $cell) {
            if (!is_string($cell) || text_length(trim($cell)) > 160) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid course row cell'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $cleanedRow[] = trim($cell);
        }
        if (implode('', $cleanedRow) !== '') {
            $cleanedRows[] = $cleanedRow;
        }
    }
    $schedule['curricula'][$key]['rows'] = $cleanedRows;

    $notes = $course['notes'] ?? [];
    if (!is_array($notes) || count($notes) > 12) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid course notes'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $cleanedNotes = [];
    foreach ($notes as $note) {
        if (!is_string($note) || text_length(trim($note)) > 300) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid course note'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        if (trim($note) !== '') {
            $cleanedNotes[] = trim($note);
        }
    }
    $schedule['curricula'][$key]['notes'] = $cleanedNotes;
}

$target = __DIR__ . DIRECTORY_SEPARATOR . 'course.data';
$json = json_encode($schedule, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if ($json === false || file_put_contents($target, $json . PHP_EOL, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
