<?php
// HTML/userDashboard/api/clients_list.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

$search = trim($_GET['q'] ?? '');

if ($search !== '') {
    $like = '%' . $search . '%';
    $stmt = $mysqli->prepare("
        SELECT clientId, name, email, contactNumber, address, customerType, dateRegistered
        FROM client
        WHERE name LIKE ? OR email LIKE ? OR contactNumber LIKE ?
        ORDER BY name ASC
    ");
    $stmt->bind_param('sss', $like, $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $mysqli->query("
        SELECT clientId, name, email, contactNumber, address, customerType, dateRegistered
        FROM client
        ORDER BY clientId DESC
    ");
}

$rows = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            'id' => (int)$row['clientId'],
            'name' => $row['name'],
            'email' => $row['email'],
            'contact' => $row['contactNumber'],
            'address' => $row['address'],
            'type' => $row['customerType'],
            'registered' => $row['dateRegistered']
        ];
    }
}

echo json_encode([
  'success' => true,
  'clients' => $rows
]);