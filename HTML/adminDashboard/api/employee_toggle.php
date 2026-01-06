<?php
// HTML/adminDashboard/api/employees_toggle.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

$id       = isset($_POST['EmployeeID']) ? (int)$_POST['EmployeeID'] : 0;
$isActive = isset($_POST['IsActive']) && $_POST['IsActive'] == '1' ? 1 : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing EmployeeID.']);
    exit;
}

$stmt = $mysqli->prepare("UPDATE employees SET IsActive=? WHERE EmployeeID=?");
$stmt->bind_param('ii', $isActive, $id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update status.']);
    exit;
}

echo json_encode(['success' => true]);