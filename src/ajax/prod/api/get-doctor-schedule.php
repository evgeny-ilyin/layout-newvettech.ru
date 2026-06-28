<?php

require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php";

// CORS
$allowedOrigins = [
	'https://newvettech.ru',
	'http://localhost:9000',
	'http://192.168.0.101:9000',
	'https://evgeny-ilyin.github.io',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
	header("Access-Control-Allow-Origin: {$origin}");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit;
}


$config = require $_SERVER['DOCUMENT_ROOT'] . '/local/ajax/api/config.php';

$days = (int)$config['days'];
$interval = (int)$config['interval'];
$timeout = (int)$config['timeout'];
$bearerToken = $config['token'];
$apiUrl = $config['apiSlotsUrl'];

// Проверяем, что запрос POST и содержит doctor_id
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['error' => 'Метод не разрешён']);
	exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['doctor_id'])) {
	http_response_code(400);
	echo json_encode(['error' => 'doctor_id не определён']);
	exit;
}

$doctorId = (int)$input['doctor_id'];
$currentDate = date('Y-m-d');

function fetchSlots($url, $bearerToken, $doctorId, $date, $interval, $timeout)
{
	$fullUrl = $url . "?doctor_ids={$doctorId}&interval={$interval}&date={$date}";

	$ch = curl_init();

	curl_setopt_array($ch, [
		CURLOPT_URL => $fullUrl,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_CONNECTTIMEOUT => $timeout,
		CURLOPT_TIMEOUT => $timeout,
		CURLOPT_HTTPHEADER => [
			'Authorization: Bearer ' . $bearerToken,
			'Content-Type: application/json'
		]
	]);

	$response = curl_exec($ch);

	if ($response === false) {
		// AddMessage2Log(curl_error($ch), 'schedule_api_error');
		curl_close($ch);
		return null;
	}

	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	if ($httpCode !== 200) {
		return null;
	}

	$data = json_decode($response, true);

	if (json_last_error() !== JSON_ERROR_NONE) {
		return null;
	}

	// AddMessage2Log($data, 'schedule_api_data');

	return $data;
}

// API запрос через Bitrix HTTP Client
/*
function fetchSlots2($url, $bearerToken, $doctorId, $date, $interval, $timeout)
{
	$fullUrl = $url . "?doctor_ids=" . $doctorId . "&date=" . $date;

	if (class_exists('\Bitrix\Main\Web\HttpClient')) {
		$httpClient = new \Bitrix\Main\Web\HttpClient();
		$httpClient->setTimeout($timeout);
		$httpClient->setStreamTimeout($timeout);
		$httpClient->setHeader('Authorization', 'Bearer ' . $bearerToken);
		$httpClient->setHeader('Content-Type', 'application/json');

		$response = $httpClient->get($fullUrl);
		$httpCode = $httpClient->getStatus();

		if ($httpCode !== 200) {
			return null;
		}

		$data = json_decode($response, true);

		if (json_last_error() !== JSON_ERROR_NONE) {
			return null;
		}

		return $data;
	}

	return null;
}
*/

// Извлечение времени из полного формата даты: "09:00" из "2026-06-20T09:00"
function extractTime($dateTime)
{
	// $parts = explode('T', $dateTime);
	// return $parts[1] ?? null;
	return substr($dateTime, 11, 5);
}

// Инициализируем результат
$result = [
	'doctor_id' => $doctorId,
	'dates' => []
];

// Запросы для $days дней
$currentDay = new DateTimeImmutable();

for ($i = 0; $i < $days; $i++) {
	$dateStr = $currentDay->modify("+{$i} day")->format('Y-m-d');
	$apiResponse = fetchSlots($apiUrl, $bearerToken, $doctorId, $dateStr, $interval, $timeout);

	if (!is_array($apiResponse)) {
		continue;
	}

	if (
		!empty($apiResponse[0]['id']) &&
		(int)$apiResponse[0]['id'] === $doctorId &&
		isset($apiResponse[0]['available_slots'])
	) {
		$availableSlots = $apiResponse[0]['available_slots'];

		// Если есть доступные слоты
		if (!empty($availableSlots)) {
			// Извлекаем время, удаляем дубликаты, переиндексируем массив для чистого JSON, сортируем по времени
			$times = array_filter(array_map('extractTime', $availableSlots));
			$times = array_unique($times);
			$times = array_values($times);
			sort($times);
			$result['dates'][$dateStr] = $times;
		}
	}
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
