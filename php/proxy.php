<?php
require 'vendor/autoload.php';

use Google\Auth\Credentials\ServiceAccountCredentials;
use Google\Auth\HttpHandler\HttpHandlerFactory;

// 1. إعدادات المشروع (تأكد من صحة المسار والـ ID)
$projectId = 'teenzy-3f9ca';
$keyFilePath = "../script/teenzy-3f9ca-firebase-adminsdk-fbsvc-9e880b651c.json";

try {
    // 2. توليد Access Token للوصول كمسؤول (Admin)
    $scopes = ['https://www.googleapis.com/auth/datastore'];
    $creds = new ServiceAccountCredentials($scopes, $keyFilePath);
    $authToken = $creds->fetchAuthToken(HttpHandlerFactory::build());
    $accessToken = $authToken['access_token'];

    // 3. استقبال البيانات من الرابط (المجموعة والـ ID)
    $collection = isset($_GET['col']) ? $_GET['col'] : null;
    $documentId = isset($_GET['id']) ? $_GET['id'] : null;

    if (!$collection) {
        die(json_encode(["error" => "err"]));
    }

    $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/{$collection}";
    if ($documentId) { $url .= "/" . $documentId; }

    $method = $_SERVER['REQUEST_METHOD'];
    $ch = curl_init();

   // ... بعد سطر تحديد الـ $url والـ $documentId ...

    $method = $_SERVER['REQUEST_METHOD'];
    $ch = curl_init();

    // --- بداية التعديل هنا ---
    if ($method === 'POST') {
        $jsonData = file_get_contents('php://input');

        // إذا كان الرابط يحتوي على query=true، نقوم بعمل استعلام بحث
        if (isset($_GET['query'])) {
            $url .= ":runQuery"; 
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData); // نرسل الاستعلام كما هو من JS
        } else {
            // إضافة مستند جديد عادي
            curl_setopt($ch, CURLOPT_POSTFIELDS, formatForFirestore($jsonData));
        }
        curl_setopt($ch, CURLOPT_POST, true);
    } 
    elseif ($method === 'PATCH') {
        $jsonData = file_get_contents('php://input');
        $dataArray = json_decode($jsonData, true);
        $queryFields = [];
        foreach ($dataArray as $key => $val) { $queryFields[] = "updateMask.fieldPaths=$key"; }
        $url .= "?" . implode('&', $queryFields);
        
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, formatForFirestore($jsonData));
    }
    elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    // --- نهاية التعديل هنا ---

    // ... تابع بقية الكود (curl_setopt للمصادقة وتنفيذ الطلب) ...

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // 5. معالجة الرد وتنظيف البيانات
    header('Content-Type: application/json');
    if ($httpCode >= 200 && $httpCode < 300) {
        $data = json_decode($response, true);
        
        if (isset($data['documents'])) { // جلب قائمة
            $results = [];
            foreach ($data['documents'] as $doc) { $results[] = cleanDoc($doc); }
            echo json_encode($results);
        } else if (isset($data['fields'])) { // جلب مستند واحد أو بعد الإضافة
            echo json_encode(cleanDoc($data));
        } else {
            echo json_encode(["status" => "success", "response" => $data]);
        }
    } else {
        echo $response; // إظهار الخطأ إذا وجد
    }

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

/** * دوال مساعدة (Helpers)
 **/

// تنظيف المستند ليصبح JSON بسيط
// دالة متطورة لتنظيف المستند وكل ما بداخله من مصفوفات أو كائنات متداخلة
function cleanDoc($doc) {
    $item = [];
    
    // استخراج الـ ID إذا كان موجوداً في الرد
    if (isset($doc['name'])) {
        $pathParts = explode('/', $doc['name']);
        $item['id'] = end($pathParts);
    }
    
    // إذا وجدنا حقل fields (وهو التنسيق الأساسي لفايربيز)
    if (isset($doc['fields'])) {
        foreach ($doc['fields'] as $key => $value) {
            $item[$key] = parseFirestoreValue($value);
        }
    }
    return $item;
}

// دالة ذكية لتحويل أي نوع بيانات من فايربيز إلى قيمته الحقيقية
function parseFirestoreValue($value) {
    // 1. التعامل مع الكائنات المتداخلة (Maps) مثل availableSizes
    if (isset($value['mapValue'])) {
        $mapData = [];
        if (isset($value['mapValue']['fields'])) {
            foreach ($value['mapValue']['fields'] as $key => $val) {
                $mapData[$key] = parseFirestoreValue($val);
            }
        }
        return $mapData;
    }

    // 2. التعامل مع المصفوفات (Arrays) مثل imgUrl
    if (isset($value['arrayValue'])) {
        $listData = [];
        if (isset($value['arrayValue']['values'])) {
            foreach ($value['arrayValue']['values'] as $val) {
                $listData[] = parseFirestoreValue($val);
            }
        }
        return $listData;
    }

    // 3. التعامل مع القيم البسيطة (نصوص، أرقام، منطق)
    if (isset($value['stringValue'])) return $value['stringValue'];
    if (isset($value['integerValue'])) return (int)$value['integerValue'];
    if (isset($value['doubleValue'])) return (float)$value['doubleValue'];
    if (isset($value['booleanValue'])) return (bool)$value['booleanValue'];
    
    return reset($value); // كحل أخير إذا لم يعرف النوع
}

// دالة ذكية لتحويل أي JSON عادي (مهما كان تعقيده) لتنسيق فايربيز
function formatForFirestore($json) {
    $data = json_decode($json, true);
    return json_encode(['fields' => convertArrayToFirestoreFields($data)]);
}

// دالة مساعدة للتعامل مع البيانات المتداخلة (المصفوفات والكائنات)
function convertArrayToFirestoreFields($data) {
    $fields = [];
    foreach ($data as $k => $v) {
        $fields[$k] = encodeValue($v);
    }
    return $fields;
}

function encodeValue($v) {
    // 1. إذا كانت القيمة مصفوفة عادية [1, 2, 3]
    if (is_array($v) && array_keys($v) === range(0, count($v) - 1)) {
        $list = [];
        foreach ($v as $item) { $list[] = encodeValue($item); }
        return ['arrayValue' => ['values' => $list]];
    }
    // 2. إذا كانت القيمة كائن متداخل {a: 1} أو مصفوفة مفاتيح (Map)
    if (is_array($v)) {
        return ['mapValue' => ['fields' => convertArrayToFirestoreFields($v)]];
    }
    // 3. قيم بسيطة
    if (is_numeric($v)) return ['doubleValue' => $v];
    if (is_bool($v)) return ['booleanValue' => $v];
    return ['stringValue' => (string)$v];
}
