<?php
// HTML/adminDashboard/api/save_employee.php
require '../../api/config.php';
header('Content-Type: application/json; charset=utf-8');

$id          = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
$name        = trim($_POST['name'] ?? '');
$email       = trim($_POST['email'] ?? '');
$contact     = trim($_POST['contact'] ?? '');
$role        = $_POST['role'] ?? 'Staff';
$isManager   = ($role === 'Manager') ? 1 : 0;
$isActive    = isset($_POST['isActive']) ? 1 : 0;
$password    = $_POST['password'] ?? '';

if ($name === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name and email are required.']);
    exit;
}

// Check if email already exists (for new employees or if email changed)
$checkSql = "SELECT employeeId FROM employee WHERE email = ?";
if ($id) {
    $checkSql .= " AND employeeId != ?";
}
$checkStmt = $mysqli->prepare($checkSql);
if ($id) {
    $checkStmt->bind_param('si', $email, $id);
} else {
    $checkStmt->bind_param('s', $email);
}
$checkStmt->execute();
$checkResult = $checkStmt->get_result();
if ($checkResult->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Email already exists.']);
    exit;
}

if ($id) {
    // UPDATE existing employee
    if (!empty($password)) {
        // Update with new password
        $hashedPassword = sha1($password);
        $stmt = $mysqli->prepare("UPDATE employee SET name=?, email=?, contactNumber=?, isManager=?, isActive=?, password=? WHERE employeeId=?");
        $stmt->bind_param('sssiisi', $name, $email, $contact, $isManager, $isActive, $hashedPassword, $id);
    } else {
        // Update without changing password
        $stmt = $mysqli->prepare("UPDATE employee SET name=?, email=?, contactNumber=?, isManager=?, isActive=? WHERE employeeId=?");
        $stmt->bind_param('sssiii', $name, $email, $contact, $isManager, $isActive, $id);
    }
} else {
    // INSERT new employee
    if (empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Password is required for new employees.']);
        exit;
    }
    $hashedPassword = sha1($password);
    $stmt = $mysqli->prepare("INSERT INTO employee (name, email, contactNumber, isManager, isActive, password) VALUES (?,?,?,?,?,?)");
    $stmt->bind_param('sssiis', $name, $email, $contact, $isManager, $isActive, $hashedPassword);
}

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save employee: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true, 'id' => $id ? $id : $mysqli->insert_id]);
