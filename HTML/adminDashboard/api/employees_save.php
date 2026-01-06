<?php
// HTML/adminDashboard/api/employees_save.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

$id         = isset($_POST['EmployeeID']) && $_POST['EmployeeID'] !== '' ? (int)$_POST['EmployeeID'] : null;
$fullName   = trim($_POST['FullName'] ?? '');
$email      = trim($_POST['Email'] ?? '');
$contact    = trim($_POST['ContactNo'] ?? '');
$role       = trim($_POST['Role'] ?? 'Staff');
$password   = $_POST['Password'] ?? '';
$isActive   = isset($_POST['IsActive']) && $_POST['IsActive'] == '1' ? 1 : 0;

if ($fullName === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Full Name and Email are required.']);
    exit;
}

$passwordHash = null;
if ($password !== '') {
    $passwordHash = hash('sha256', $password);
}

if ($id) {
    // UPDATE
    if ($passwordHash) {
        $stmt = $mysqli->prepare("
          UPDATE employees
          SET FullName=?, Email=?, ContactNo=?, Role=?, PasswordHash=?, IsActive=?
          WHERE EmployeeID=?
        ");
        $stmt->bind_param('ssssssi', $fullName, $email, $contact, $role, $passwordHash, $isActive, $id);
    } else {
        $stmt = $mysqli->prepare("
          UPDATE employees
          SET FullName=?, Email=?, ContactNo=?, Role=?, IsActive=?
          WHERE EmployeeID=?
        ");
        $stmt->bind_param('ssssii', $fullName, $email, $contact, $role, $isActive, $id);
    }
} else {
    // INSERT
    if (!$passwordHash) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password is required for new employees.']);
        exit;
    }
    $stmt = $mysqli->prepare("
      INSERT INTO employees (FullName, Email, ContactNo, Role, PasswordHash, IsActive)
      VALUES (?,?,?,?,?,?)
    ");
    $stmt->bind_param('sssssi', $fullName, $email, $contact, $role, $passwordHash, $isActive);
}

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save employee: '.$stmt->error]);
    exit;
}

echo json_encode(['success' => true]);