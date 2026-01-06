<?php
// HTML/adminDashboard/api/list_employees.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

// Check if we should include inactive employees
$showInactive = isset($_GET['showInactive']) && $_GET['showInactive'] === 'true';

$sql = "SELECT * FROM employee";
if (!$showInactive) {
    $sql .= " WHERE isActive = 1";
}
$sql .= " ORDER BY employeeId DESC";

$result = $mysqli->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = [
        'id' => (int)$row['employeeId'],
        'name' => $row['name'],
        'email' => $row['email'],
        'contact' => $row['contactNumber'],
        'role' => $row['isManager'] ? 'Manager' : 'Staff',
        'isActive' => (bool)$row['isActive'],
        'status' => $row['isActive'] ? 'Active' : 'Inactive'
    ];
}
echo json_encode($rows);
