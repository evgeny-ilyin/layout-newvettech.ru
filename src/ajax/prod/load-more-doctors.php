<?
require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php";

use Bitrix\Main\Loader;

if (!Loader::includeModule("iblock")) {
	echo json_encode([]);
	exit;
}

usleep(500000);

$iblock_code = "vrachi";
$iblockId = getIblockIdByCode($iblock_code);

if (!$iblockId) {
	exit;
}

/**
 * Выбранная клиника.
 * 0 = все клиники.
 */
$clinicId = (int)($_GET['CLINIC_ID'] ?? 0);

/**
 * Используем фильтр bitrix:news.list.
 * Если клиника выбрана: PROPERTY_BRANCH = ID клиники
 * Для множественного свойства BRANCH Bitrix найдет элементы, где среди значений свойства присутствует указанный ID.
 */
global $arrDoctorsFilter;

$arrDoctorsFilter = [
	'IBLOCK_ID' => $iblockId,
	'ACTIVE' => 'Y',
];

if ($clinicId > 0) {
	$arrDoctorsFilter['PROPERTY_BRANCH'] = $clinicId;
}

header('Content-Type: text/html; charset=UTF-8');

$APPLICATION->IncludeComponent(
	"bitrix:news.list",
	"load-more-doctors",
	array(
		"IBLOCK_TYPE" => "content",
		"IBLOCK_ID" => $iblockId,
		"DETAIL_URL" => "/vrachi/#ELEMENT_CODE#/",
		"NEWS_COUNT" => "16",
		"SORT_BY1" => "SORT",
		"SORT_BY2" => "ID",
		"SORT_ORDER1" => "ASC",
		"SORT_ORDER2" => "ASC",
		"FILTER_NAME" => "arrDoctorsFilter",
		"PROPERTY_CODE" => [
			"POSITION",
			"BOOKING",
			"BRANCH",
			"SHORT_NOTE",
			"LOCATION",
			"METAPETS_ID",
			"BOOKING_BY_CALLCENTER",
		],
		"PAGER_TEMPLATE" => "load-more",
		"DISPLAY_BOTTOM_PAGER" => "Y",
		"CACHE_TYPE" => "A",
		"CACHE_TIME" => "36000000",
		"CACHE_FILTER" => "Y",
		"CACHE_GROUPS" => "Y",
		"COMPONENT_TEMPLATE" => "load-more-doctors"
	),
	false
);
