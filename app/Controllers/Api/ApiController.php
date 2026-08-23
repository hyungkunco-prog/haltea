<?php

namespace App\Controllers\Api;

use CodeIgniter\Controller;
use App\Models\UserModel;

class ApiController extends Controller
{
    protected const JWT_SECRET = 'haltea-super-secret-key-2026';

    protected function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    protected function base64UrlDecode($data)
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    protected function jwt_sign($payload)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::JWT_SECRET, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    protected function jwt_verify($token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        list($header, $payload, $signature) = $parts;
        $validSignature = $this->base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, self::JWT_SECRET, true));
        if (!hash_equals($validSignature, $signature)) {
            return null;
        }
        $decodedPayload = json_decode($this->base64UrlDecode($payload), true);
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return null;
        }
        return $decodedPayload;
    }

    protected function getAuthUser()
    {
        $token = null;

        // 1. Check HTTP_AUTHORIZATION or REDIRECT_HTTP_AUTHORIZATION
        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION') 
            ?: ($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null));

        if (empty($authHeader)) {
            $authHeader = $this->request->getHeaderLine('Authorization');
        }

        if (!empty($authHeader)) {
            $parts = explode(' ', trim($authHeader));
            if (count($parts) === 2 && strtolower($parts[0]) === 'bearer') {
                $token = $parts[1];
            }
        }

        // 2. Fallback to X-Auth-Token header
        if (empty($token)) {
            $token = $this->request->getHeaderLine('X-Auth-Token') 
                ?: $this->request->getHeaderLine('X-Token');
        }

        // 3. Fallback to GET or POST parameter
        if (empty($token)) {
            $token = $this->request->getGet('token') ?: $this->request->getPost('token');
        }

        if (empty($token)) {
            return null;
        }

        return $this->jwt_verify($token);
    }

    protected function requireAuth()
    {
        $user = $this->getAuthUser();
        if (!$user) {
            $this->response->setStatusCode(401)->setJSON(['error' => 'Unauthorized'])->send();
            exit;
        }
        return $user;
    }

    protected function requireAdmin()
    {
        $user = $this->requireAuth();
        if ($user['role'] !== 'admin') {
            $this->response->setStatusCode(403)->setJSON(['error' => 'Forbidden: Admin only'])->send();
            exit;
        }
        return $user;
    }
}
