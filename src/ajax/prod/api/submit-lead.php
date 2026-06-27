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

$timeout = (int)$config['timeout'];
$bearerToken = $config['token'];
$apiUrl = $config['apiLeadUrl'];

// Проверяем, что запрос POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['success' => false, 'message' => 'Метод не разрешён']);
	exit;
}

// Получаем payload из JS
$payload = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
	http_response_code(400);
	echo json_encode(['success' => false, 'message' => 'Некорректный JSON']);
	exit;
}

function submitLead($url, $payload, $bearerToken, $timeout)
{
	$ch = curl_init();

	curl_setopt_array($ch, [
		CURLOPT_URL => $url,
		CURLOPT_POST => true,
		CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
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
		// AddMessage2Log(curl_error($ch), 'submitLead_api_error');
		curl_close($ch);
		return [
			'success' => false,
			'message' => 'Network error: ' . curl_error($ch)
		];
	}

	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	$data = json_decode($response, true);

	// Успех
	if ($httpCode === 201) {
		return [
			'success' => true,
			'message' => 'Ваша запись оформлена, ожидайте звонка администратора.'
		];
	}

	// Ошибка валидации
	if ($httpCode === 422 && !empty($data['detail'])) {
		$errors = array_map(function ($item) {
			$field = end($item['loc']);
			return "{$field}: {$item['msg']}";
		}, $data['detail']);

		return [
			'success' => false,
			'message' => implode(', ', $errors)
		];
	}

	// fallback для любых новых кодов
	return [
		'success' => false,
		'message' => $data['message'] ?? "Unexpected API error ({$httpCode})"
	];
}

$result = submitLead($apiUrl, $payload, $bearerToken, $timeout);

header('Content-Type: application/json; charset=utf-8');
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
