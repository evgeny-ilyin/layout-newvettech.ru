<?
require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php";

use Bitrix\Main\Loader;

header('Content-Type: application/json');

if (!Loader::includeModule("iblock")) {
	echo json_encode([]);
	exit;
}

$maxResults = 10; // максимум результатов в выпадающем окне

// читаем JSON
$data = json_decode(file_get_contents('php://input'), true);
$q = trim($data['q'] ?? '');

if (mb_strlen($q) >= 4) {
	$words = explode(" ", $q);
	$filter = ["LOGIC" => "AND"];

	foreach ($words as $word) {
		$word = trim($word);
		if (mb_strlen($word) < 2) continue;

		$filter[] = [
			"LOGIC" => "OR",
			["%NAME" => $word],
			["%PROPERTY_POSITION" => $word],
			["%PROPERTY_SPECIALIZATION" => $word],
		];
	}
} else {
	echo json_encode([]);
	exit;
}

// защита
$q = htmlspecialcharsbx($q);

$iblock_code = "vrachi";
$arFilter = [
	"IBLOCK_ID" => getIblockIdByCode($iblock_code),
	"ACTIVE" => "Y",
	$filter
];

$arSelect = [
	"ID",
	"NAME",
	"DETAIL_PAGE_URL",
	"PROPERTY_POSITION",
	"PROPERTY_SPECIALIZATION"
];

$res = CIBlockElement::GetList(
	[],
	$arFilter,
	false,
	false, // вместо nTopCount
	// ["nTopCount" => $maxResults],
	$arSelect
);

$items = [];
$allBranchIds = [];

// 1. Получаем врачей + собираем ID клиник
while ($ob = $res->GetNextElement()) {
	$fields = $ob->GetFields();
	$props  = $ob->GetProperties();

	$branchIds = $props['BRANCH']['VALUE'];

	if (!empty($branchIds)) {
		$branchIds = is_array($branchIds) ? $branchIds : [$branchIds];
		$allBranchIds = array_merge($allBranchIds, $branchIds);
	} else {
		$branchIds = [];
	}

	$fields['BRANCH_IDS'] = $branchIds;

	$items[] = $fields;
}

// Ограничение maxResults применяется после выборки
if (!empty($maxResults)) {
	$items = array_slice($items, 0, $maxResults);
}

// 2. Убираем дубли ID клиник
$allBranchIds = array_unique($allBranchIds);

// 3. Получаем клиники одним запросом
$branchesMap = [];

if (!empty($allBranchIds)) {
	$branchRes = CIBlockElement::GetList(
		["SORT" => "ASC"],
		["ID" => $allBranchIds, "ACTIVE" => "Y"],
		false,
		false,
		["ID", "PROPERTY_LOCATION"]
	);

	while ($branch = $branchRes->GetNext()) {
		$branchesMap[$branch["ID"]] = $branch["PROPERTY_LOCATION_VALUE"];
	}
}

// 4. Собираем финальный результат
$result = [];

foreach ($items as $item) {

	$locations = [];

	foreach ($item['BRANCH_IDS'] as $branchId) {
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
		// "debug" => $item
	];
}

echo json_encode($result);
