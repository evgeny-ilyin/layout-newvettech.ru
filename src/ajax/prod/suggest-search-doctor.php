<?
require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php";

use Bitrix\Main\Loader;

header('Content-Type: application/json; charset=UTF-8');

if (!Loader::includeModule("iblock")) {
	echo json_encode([]);
	exit;
}

$maxResults = 10;

// JSON
$data = json_decode(file_get_contents('php://input'), true);

$q = trim($data['q'] ?? '');
$clinicId = (int)($data['clinicId'] ?? 0);

if (mb_strlen($q) < 4) {
	echo json_encode([]);
	exit;
}

// Поисковый фильтр
$words = preg_split('/\s+/u', $q, -1, PREG_SPLIT_NO_EMPTY);

$searchFilter = [
	"LOGIC" => "AND",
];

foreach ($words as $word) {

	if (mb_strlen($word) < 2) {
		continue;
	}

	$searchFilter[] = [
		"LOGIC" => "OR",
		["%NAME" => $word],
		["%PROPERTY_POSITION" => $word],
		["%PROPERTY_SPECIALIZATION" => $word],
	];
}

$iblock_code = "vrachi";

$arFilter = [
	"IBLOCK_ID" => getIblockIdByCode($iblock_code),
	"ACTIVE" => "Y",
	$searchFilter,
];

// Фильтр по выбранной клинике
if ($clinicId > 0) {
	$arFilter["PROPERTY_BRANCH"] = $clinicId;
}

$arSelect = [
	"ID",
	"NAME",
	"DETAIL_PAGE_URL",
	"PROPERTY_POSITION",
	"PROPERTY_SPECIALIZATION",
];

$res = CIBlockElement::GetList(
	[
		"NAME" => "ASC",
	],
	$arFilter,
	false,
	false,
	$arSelect
);

$items = [];
$allBranchIds = [];

// Получаем врачей
while ($ob = $res->GetNextElement()) {

	$fields = $ob->GetFields();
	$props = $ob->GetProperties();

	$branchIds = $props["BRANCH"]["VALUE"] ?? [];

	if (!empty($branchIds)) {
		$branchIds = is_array($branchIds)
			? $branchIds
			: [$branchIds];

		$allBranchIds = array_merge(
			$allBranchIds,
			$branchIds
		);
	} else {
		$branchIds = [];
	}

	$fields["BRANCH_IDS"] = $branchIds;

	$items[] = $fields;

	if (count($items) >= $maxResults) {
		break;
	}
}

// Уникальные клиники
$allBranchIds = array_unique($allBranchIds);

// Получаем названия клиник
$branchesMap = [];

if (!empty($allBranchIds)) {

	$branchRes = CIBlockElement::GetList(
		["SORT" => "ASC"],
		[
			"IBLOCK_ID" => getIblockIdByCode("kliniki"),
			"ID" => $allBranchIds,
			"ACTIVE" => "Y",
		],
		false,
		false,
		[
			"ID",
			"PROPERTY_LOCATION",
		]
	);

	while ($branch = $branchRes->GetNext()) {
		$branchesMap[$branch["ID"]] =
			$branch["PROPERTY_LOCATION_VALUE"];
	}
}

// Финальный результат
$result = [];

foreach ($items as $item) {

	$locations = [];

	foreach ($item["BRANCH_IDS"] as $branchId) {

		if (isset($branchesMap[$branchId])) {
			$locations[] = $branchesMap[$branchId];
		}
	}

	$result[] = [
		"ID" => $item["ID"],
		"URL" => $item["DETAIL_PAGE_URL"],
		"PRIMARY" => $item["NAME"],
		"SECONDARY" => $item["PROPERTY_POSITION_VALUE"],
		"LOCATIONS" => $locations,
	];
}

echo json_encode(
	$result,
	JSON_UNESCAPED_UNICODE
);
