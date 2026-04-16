<?
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$result[] = [
	"ID" => 1,
	"URL" => "/url-1/",
	"PRIMARY" => "Михайлов Илья Владимирович",
	"SECONDARY" => "Руководитель хирургического отделения"
];
$result[] = [
	"ID" => 2,
	"URL" => "/url-2/",
	"PRIMARY" => "Лапшин Максим Николаевич",
	"SECONDARY" => "Исполнительный директор клиники на Большой Серпуховской"
];


echo json_encode($result);
