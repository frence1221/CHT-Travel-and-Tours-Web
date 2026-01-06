<?php
// api/login.php
session_start();
require 'config.php';
header('Content-Type: application/json; charset=utf-8');

// Get POST data
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password are required.']);
    exit;
}

// Query employee table by email
$stmt = $mysqli->prepare("SELECT employeeId, name, email, password, isManager, isActive FROM employee WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Check if account is active
    if (!$row['isActive']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Account is inactive. Contact administrator.']);
        exit;
    }
    
    // Compare password using SHA1 (your passwords are 40 chars = SHA1)
    $inputHash = sha1($password);

    if ($inputHash === $row['password']) {
        // Correct login
        $_SESSION['user_id'] = $row['employeeId'];
        $_SESSION['email']   = $row['email'];
        $_SESSION['name']    = $row['name'];
        $_SESSION['role']    = $row['isManager'] ? 'admin' : 'user';

        echo json_encode([
            'success' => true,
            'role'    => $row['isManager'] ? 'admin' : 'user',
            'name'    => $row['name'],
            'email'   => $row['email']
        ]);
        exit;
    }
}

// If we reach here, login failed
http_response_code(401);
echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);