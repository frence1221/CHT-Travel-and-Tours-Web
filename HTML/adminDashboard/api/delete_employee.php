<?php
// HTML/adminDashboard/api/delete_employee.php
require '../../api/config.php';
header('Content-Type: application/json; charset=utf-8');

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$action = isset($_POST['action']) ? $_POST['action'] : 'deactivate';

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing employee ID']);
    exit;
}

// Toggle active status based on action
if ($action === 'activate') {
    $stmt = $mysqli->prepare("UPDATE employee SET isActive = 1 WHERE employeeId = ?");
} else {
    $stmt = $mysqli->prepare("UPDATE employee SET isActive = 0 WHERE employeeId = ?");
}
$stmt->bind_param('i', $id);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update employee: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true]);
