<?
require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php";

use Bitrix\Main\Loader;

header('Content-Type: application/json');

if (!Loader::includeModule("iblock")) {
	echo json_encode([]);
	exit;
}

usleep(500000);

$iblock_code = "vrachi";
$APPLICATION->IncludeComponent(
	"bitrix:news.list", 
	"load-more-doctors", 
	array(
		"IBLOCK_TYPE" => "content",
		"IBLOCK_ID" => getIblockIdByCode($iblock_code),
		"DETAIL_URL" => "/vrachi/#ELEMENT_CODE#/",
		"NEWS_COUNT" => "16",
		"SORT_BY1" => "SORT",
		"SORT_BY2" => "ID",
		"SORT_ORDER1" => "ASC",
		"SORT_ORDER2" => "ASC",
		"FILTER_NAME" => "",
		"PROPERTY_CODE" => [
			0 => "POSITION",
			1 => "BOOKING",
			2 => "",
		],
		"PAGER_TEMPLATE" => "load-more",
		"DISPLAY_BOTTOM_PAGER" => "Y",
		"COMPONENT_TEMPLATE" => "load-more-doctors"
	),
	false
);
