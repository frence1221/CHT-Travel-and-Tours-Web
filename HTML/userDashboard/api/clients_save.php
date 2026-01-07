<?php
// HTML/userDashboard/api/clients_save.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

$id        = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
$name      = trim($_POST['name'] ?? '');
$email     = trim($_POST['email'] ?? '');
$contact   = trim($_POST['contact'] ?? '');
$address   = trim($_POST['address'] ?? '');
$type      = trim($_POST['type'] ?? 'Business');

// Validate customerType
$allowedTypes = ['Business', 'Leisure'];
if (!in_array($type, $allowedTypes)) {
    $type = 'Business';
}

if ($name === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Client name is required.']);
    exit;
}

if ($id) {
    // UPDATE
    $stmt = $mysqli->prepare("
      UPDATE client
      SET name=?, email=?, contactNumber=?, address=?, customerType=?
      WHERE clientId=?
    ");
    $stmt->bind_param('sssssi', $name, $email, $contact, $address, $type, $id);
} else {
    // INSERT
    $registered = date('Y-m-d');
    $stmt = $mysqli->prepare("
      INSERT INTO client (name, email, contactNumber, address, customerType, dateRegistered)
      VALUES (?,?,?,?,?,?)
    ");
    $stmt->bind_param('ssssss', $name, $email, $contact, $address, $type, $registered);
}

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save client: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true, 'id' => $id ? $id : $mysqli->insert_id]);