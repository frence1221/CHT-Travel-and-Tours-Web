<?php
// HTML/adminDashboard/api/list_packages.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

$result = $mysqli->query("SELECT * FROM package ORDER BY PackageID DESC");

if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = [
        'id' => $row['PackageID'],
        'name' => $row['Name'],
        'destination' => $row['Destination'],
        'duration_days' => $row['Duration'],
        'max_pax' => $row['MaxPax'],
        'price' => $row['Price'],
        'status' => $row['IsActive'] ? 'Active' : 'Inactive',
        'description' => $row['Description'] ?? '',
        'inclusions' => $row['Inclusions'] ?? '',
        'image_path' => $row['ImagePath'] ?? ''
    ];
}
echo json_encode($rows);