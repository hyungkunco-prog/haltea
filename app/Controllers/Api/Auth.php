<?php

namespace App\Controllers\Api;

use App\Models\UserModel;

class Auth extends ApiController
{
    public function login()
    {
        $input = $this->request->getJSON(true) ?: [];
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            return $this->response->setStatusCode(400)->setJSON([
                'success' => false,
                'message' => 'Username dan password wajib diisi'
            ]);
        }

        $userModel = new UserModel();

        // Auto-seed default accounts if table is empty
        try {
            if ($userModel->countAllResults() === 0) {
                $userModel->insertBatch([
                    ['username' => 'admin', 'password' => 'admin123', 'role' => 'admin', 'nama' => 'Administrator', 'avatar' => null],
                    ['username' => 'kasir', 'password' => 'kasir123', 'role' => 'kasir', 'nama' => 'Kasir Haltea', 'avatar' => null],
                ]);
            }
        } catch (\Exception $e) {}

        $user = $userModel->groupStart()
                          ->where('username', $username)
                          ->orWhere('username', $username . '@haltea.com')
                          ->orWhere('username', str_replace('@haltea.com', '', $username))
                          ->groupEnd()
                          ->first();

        // Check plain text password or hashed password
        if ($user && ($user['password'] === $password || password_verify($password, $user['password']))) {
            $payload = [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'nama' => $user['nama'],
                'exp' => time() + (24 * 3600)
            ];
            $token = $this->jwt_sign($payload);

            return $this->response->setJSON([
                'success' => true,
                'token' => $token,
                'role' => $user['role'],
                'nama' => $user['nama'],
                'avatar' => $user['avatar']
            ]);
        } else {
            return $this->response->setStatusCode(401)->setJSON([
                'success' => false,
                'message' => 'Username atau password salah. (Default Admin: admin / admin123, Kasir: kasir / kasir123)'
            ]);
        }
    }

    public function logout()
    {
        return $this->response->setJSON(['success' => true]);
    }

    public function status()
    {
        $user = $this->getAuthUser();
        if ($user) {
            $userModel = new UserModel();
            $dbUser = $userModel->find($user['id']);
            if ($dbUser) {
                return $this->response->setJSON([
                    'authenticated' => true,
                    'role' => $dbUser['role'],
                    'nama' => $dbUser['nama'],
                    'avatar' => $dbUser['avatar']
                ]);
            }
        }
        return $this->response->setJSON(['authenticated' => false]);
    }

    public function profile()
    {
        $user = $this->requireAuth();
        $userModel = new UserModel();
        $dbUser = $userModel->find($user['id']);
        if (!$dbUser) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'User not found']);
        }
        return $this->response->setJSON([
            'nama' => $dbUser['nama'],
            'role' => $dbUser['role'],
            'avatar' => $dbUser['avatar']
        ]);
    }

    public function updateProfile()
    {
        $user = $this->requireAuth();
        $input = $this->request->getJSON(true) ?: [];
        $nama = $input['nama'] ?? '';
        $avatar = $input['avatar'] ?? null;

        $userModel = new UserModel();
        $userModel->update($user['id'], [
            'nama' => $nama,
            'avatar' => $avatar
        ]);

        return $this->response->setJSON([
            'success' => true,
            'nama' => $nama,
            'avatar' => $avatar
        ]);
    }
}
