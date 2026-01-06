<?php
// HTML/adminDashboard/api/employees_list.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

// Optional: search by name/email
$search = trim($_GET['q'] ?? '');

if ($search !== '') {
    $like = '%' . $search . '%';
    $stmt = $mysqli->prepare("
        SELECT EmployeeID, FullName, Email, ContactNo, Role, IsActive
        FROM employees
        WHERE FullName LIKE ? OR Email LIKE ?
        ORDER BY FullName ASC
    ");
    $stmt->bind_param('ss', $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $mysqli->query("
        SELECT EmployeeID, FullName, Email, ContactNo, Role, IsActive
        FROM employees
        ORDER BY FullName ASC
    ");
}

$rows = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
}

echo json_encode([
  'success'   => true,
  'employees' => $rows
]);