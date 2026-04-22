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
	["nTopCount" => $maxResults],
	$arSelect
);

$result = [];

while ($item = $res->GetNext()) {
	$result[] = [
		"ID" => $item["ID"],
		"URL" => $item["DETAIL_PAGE_URL"],
		"PRIMARY" => $item["NAME"],
		"SECONDARY" => $item["PROPERTY_POSITION_VALUE"]
	];
}

echo json_encode($result);
