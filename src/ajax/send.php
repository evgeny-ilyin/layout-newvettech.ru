<?
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// die();

// echo json_encode(["success" => false, "message" => "Непредвиденная ошибка"]);
echo json_encode(["success" => true, "message" => "Спасибо, ваш запрос принят, в&nbsp;ближайшее время мы&nbsp;вам перезвоним"]);
