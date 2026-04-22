<?
require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php";

define("NO_KEEP_STATISTIC", true);
define("NOT_CHECK_PERMISSIONS", true);
define("BX_NO_ACCELERATOR_RESET", true);
define("STOP_STATISTICS", true);

define("EVENT_NAME", "CALLBACK_FORM");
// адресат задан в настройках события direct@newvettech.ru
// define("EMAIL_TO", COption::GetOptionString("main", "email_from"));
// define("EMAIL_TO", "ei@deviart.ru");

define("STATUS_ERROR_SESSION", "Неверная сессия");
define("STATUS_ERROR_EMPTY", "Заполните все поля");
define("STATUS_SUCCESS", "Спасибо, ваш запрос принят, в&nbsp;ближайшее время мы&nbsp;вам перезвоним");
define("STATUS_ERROR", "Произошла непредвиденная ошибка, повторите отправку позднее");

header("Content-Type: application/json; charset=utf-8");

if (!check_bitrix_sessid()) {
	echo json_encode(["success" => false, "message" => STATUS_ERROR_SESSION]);
	die();
}

$callback_name = htmlspecialchars($_POST["callback_name"] ?? "");
$callback_tel = htmlspecialchars($_POST["callback_tel"] ?? "");
$agreement = htmlspecialchars($_POST["agreement"] ?? "");

if (empty(trim($callback_name)) || empty(trim($callback_tel)) || $agreement !== "on") {
	echo json_encode(["success" => false, "message" => STATUS_ERROR_EMPTY]);
	die();
}

// Данные для почтового события
$arFields = [
	"CALLBACK_NAME" => $callback_name,
	"CALLBACK_TEL" => $callback_tel,
	// "EMAIL_TO" => EMAIL_TO,
];

// Отправляем письмо
$eventSent = CEvent::Send(EVENT_NAME, SITE_ID, $arFields, "N");

/* send calltouch */
try {
    $ct_site_id = '78857'; // ID сайта Calltouch
     
    // Получение значения call_value
    $call_value = isset($_COOKIE['_ct_session_id']) ? $_COOKIE['_ct_session_id'] : (isset($_REQUEST['_ct_session_id']) ? $_REQUEST['_ct_session_id'] : '');
 
    $ct_url = "https://api.calltouch.ru/calls-service/RestAPI/requests/$ct_site_id/register/";
    $ct_data = array(
        'subject'       => 'Заявка c newvettech.ru',
        'fio'           => isset($callback_name) ? $callback_name : '',
        'phoneNumber'   => isset($callback_tel) ? $callback_tel : '',
        'requestUrl'    => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
        'sessionId'     => $call_value
    );
    $ct_data_str = http_build_query($ct_data);
    $ct_opts = array(
        'http' => array(
            'method'  => 'POST',
            'header'  => "Content-type: application/x-www-form-urlencoded; charset=utf-8",
            'content' => $ct_data_str
        )
    );
    $ct_context = stream_context_create($ct_opts);
    $ct_result = file_get_contents($ct_url, false, $ct_context);
   
    // Проверка на ошибку выполнения запроса
    if ($ct_result === FALSE) {
        throw new Exception("Error processing request");
    }
   
    // Получение HTTP-кода ответа
    $http_code = null;
    foreach ($http_response_header as $header) {
        if (preg_match('/^HTTP\/\d+\.\d+\s+(\d+)/', $header, $matches)) {
            $http_code = intval($matches[1]);
            break;
        }
    }
    if ($http_code !== 200) {
        throw new Exception("HTTP response code: " . $http_code . ". Response: " . $ct_result);
    }
  
    // Логируем успешный запрос
    $log_message = "\n\n" . "request " . date("Y.m.d H:i") . "\n";
    $log_message .= "Data sent: " . $ct_data_str . "\n";
    $log_message .= "Response: " . $ct_result . "\n";
    //file_put_contents(__DIR__ . '/calltouch_log.txt', $log_message, FILE_APPEND | LOCK_EX);
   
} catch (Exception $e) {
    // Логируем ошибку
    $log_message = "\n\n" . "request " . date("Y.m.d H:i") . "\n";
    $log_message .= "Data sent: " . $ct_data_str . "\n";
    $log_message .= "Error: " . $e->getMessage() . "\n";
    if (isset($ct_result)) {
        $log_message .= "Response: " . $ct_result . "\n";
    }
    file_put_contents(__DIR__ . '/calltouch_error_log.txt', $log_message, FILE_APPEND | LOCK_EX);
}
/* send calltouch */

if ($eventSent) {
	echo json_encode(["success" => true, "message" => STATUS_SUCCESS]);
} else {
	echo json_encode(["success" => false, "message" => STATUS_ERROR]);
}

require $_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/epilog_after.php";
