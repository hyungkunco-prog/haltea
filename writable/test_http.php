<?php
function httpPost($url, $data, $headers = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $defaultHeaders = ['Content-Type: application/json'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return ['status' => $status, 'body' => $response, 'err' => $err];
}

function httpGet($url, $headers = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return ['status' => $status, 'body' => $response, 'err' => $err];
}

// Test URLs
$urls = [
    'http://localhost/haltea/api/login',
    'http://localhost/haltea/index.php/api/login',
    'http://127.0.0.1/haltea/api/login',
];

echo "--- TESTING LOGIN HTTP ENDPOINTS ---\n";
foreach ($urls as $url) {
    echo "POST $url ...\n";
    $res = httpPost($url, ['username' => 'admin', 'password' => 'admin123']);
    echo "Status: {$res['status']}\n";
    echo "Body: {$res['body']}\n\n";

    if ($res['status'] == 200) {
        $json = json_decode($res['body'], true);
        if (isset($json['token'])) {
            $token = $json['token'];
            $statusUrl = str_replace('api/login', 'api/auth/status', $url);
            echo "GET $statusUrl with token...\n";
            $resStatus = httpGet($statusUrl, ["Authorization: Bearer $token", "X-Auth-Token: $token"]);
            echo "Status status code: {$resStatus['status']}\n";
            echo "Status body: {$resStatus['body']}\n\n";
        }
    }
}
