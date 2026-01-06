<?php
// HTML/adminDashboard/api/delete_package.php
require '../../api/config.php';
header('Content-Type: application/json; charset=utf-8');

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

$stmt = $mysqli->prepare("DELETE FROM package WHERE PackageID=?");
$stmt->bind_param('i', $id);
$stmt->execute();

echo json_encode(['success' => true]);