<?php
// HTML/userDashboard/api/packages_list.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

// Only show active packages for users
$result = $mysqli->query("
    SELECT PackageID, Name, Description, Destination, Duration, MaxPax, Inclusions, Price, IsActive, ImagePath
    FROM package
    WHERE IsActive = 1
    ORDER BY PackageID DESC
");

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$packages = [];
while ($row = $result->fetch_assoc()) {
    $packages[] = [
        'id' => (int)$row['PackageID'],
        'name' => $row['Name'],
        'description' => $row['Description'],
        'destination' => $row['Destination'],
        'duration' => (int)$row['Duration'],
        'maxPax' => (int)$row['MaxPax'],
        'inclusions' => $row['Inclusions'],
        'price' => (float)$row['Price'],
        'isActive' => (bool)$row['IsActive'],
        'imagePath' => $row['ImagePath']
    ];
}

echo json_encode([
    'success' => true,
    'packages' => $packages
]);
