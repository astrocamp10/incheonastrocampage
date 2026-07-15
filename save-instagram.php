<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function fail(string $message, int $status): void
{
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('POST only', 405);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    fail('Invalid JSON', 400);
}

if (($payload['password'] ?? '') !== 'dlscjsastro10') {
    fail('Invalid password', 403);
}

$schedule = $payload['schedule'] ?? null;
if (!is_array($schedule) || !isset($schedule['posts']) || !is_array($schedule['posts'])) {
    fail('Invalid Instagram data', 400);
}

if (count($schedule['posts']) > 6) {
    fail('Instagram posts must contain at most 6 URLs', 400);
}

$cleanedPosts = [];
foreach ($schedule['posts'] as $url) {
    if (!is_string($url) || strlen($url) > 220) {
        fail('Invalid Instagram URL', 400);
    }

    $url = trim($url);
    if (preg_match('~^https://www\.instagram\.com/(p|reel|tv)/([A-Za-z0-9_-]{3,100})/$~', $url, $matches) !== 1) {
        fail('Only Instagram post or reel URLs are allowed', 400);
    }

    $canonicalUrl = 'https://www.instagram.com/' . $matches[1] . '/' . $matches[2] . '/';
    if (!in_array($canonicalUrl, $cleanedPosts, true)) {
        $cleanedPosts[] = $canonicalUrl;
    }
}

$schedule = ['posts' => $cleanedPosts];
$target = __DIR__ . DIRECTORY_SEPARATOR . 'instagram.data';
$json = json_encode($schedule, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if ($json === false || file_put_contents($target, $json . PHP_EOL, LOCK_EX) === false) {
    fail('Failed to save file', 500);
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
