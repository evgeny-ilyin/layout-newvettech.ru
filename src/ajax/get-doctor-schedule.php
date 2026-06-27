<?php
// /api/get-doctor-schedule.php
usleep(500000);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(200);
	exit();
}

// Получаем ID врача
$doctorId = isset($_GET['doctor_id']) ? (int)$_GET['doctor_id'] : 0;

if (!$doctorId) {
	echo json_encode([
		'success' => false,
		'message' => 'ID врача не указан'
	]);
	exit();
}

// База данных врачей и их расписания (в реальном проекте данные из БД)
$doctorsSchedule = [
	123 => [
		'clinics' => [

			'north' => [
				'name' => 'Филиал Север',

				'dates' => [
					'2026-06-12' => ['16:00'],
					'2026-06-14' => ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
					'2026-06-15' => ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
					'2026-06-18' => ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
					'2026-07-07' => ['06:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
				],
			],

			'center' => [
				'name' => 'Центральный филиал',

				'dates' => [
					'2026-06-13' => ['10:00', '11:00'],
					'2026-06-16' => ['09:00', '10:00', '11:00'],
					'2026-06-20' => ['12:00', '13:00', '14:00'],
					'2026-07-10' => ['15:00', '16:00', '17:00'],
				],
			],

		],
	],
];

// Получаем расписание для указанного врача
$schedule = isset($doctorsSchedule[$doctorId]) ? $doctorsSchedule[$doctorId] : null;

if (!$schedule) {
	echo json_encode([
		'success' => false,
		'message' => 'Расписание для указанного врача не найдено'
	]);
	exit();
}

$clinics = [];
foreach ($schedule['clinics'] as $key => $clinicData) {
	$clinics[$key] = [
		'name' => $clinicData['name'],
		'dates' => $clinicData['dates']
	];
}

// Возвращаем данные
echo json_encode([
	'success' => true,
	'doctor_id' => $doctorId,
	'clinics' => $clinics,
	// 'dates' => $schedule['dates'],
	'message' => 'Данные успешно загружены'
]);
