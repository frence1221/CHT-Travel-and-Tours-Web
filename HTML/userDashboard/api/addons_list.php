<?php
// HTML/userDashboard/api/addons_list.php
// Get available add-ons from database

require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Check if addons table exists, if not return default add-ons
$tableCheck = $mysqli->query("SHOW TABLES LIKE 'addon'");
if ($tableCheck->num_rows === 0) {
    // Create table and insert default add-ons
    $createTable = "
        CREATE TABLE addon (
            addonId INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) DEFAULT 0,
            isActive TINYINT(1) DEFAULT 1,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ";
    $mysqli->query($createTable);

    // Insert default add-ons
    $defaultAddons = [
        ['Daily Breakfast', 'Start each day with a delicious buffet breakfast', 500],
        ['Travel Insurance', 'Comprehensive coverage for peace of mind', 1000],
        ['Private Tour Guide', 'Personalized guided tours with local expert', 2000],
        ['Airport Transfer', 'Convenient pickup and drop-off service', 800],
        ['Spa Package', 'Relaxing spa treatment during your stay', 1500],
        ['Photography Service', 'Professional photographer for memorable moments', 3000]
    ];

    $stmt = $mysqli->prepare("INSERT INTO addon (name, description, price) VALUES (?, ?, ?)");
    foreach ($defaultAddons as $addon) {
        $stmt->bind_param('ssd', $addon[0], $addon[1], $addon[2]);
        $stmt->execute();
    }
}

// Fetch add-ons
$result = $mysqli->query("
    SELECT addonId, name, description, price, isActive 
    FROM addon 
    WHERE isActive = 1 
    ORDER BY addonId ASC
");

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$addons = [];
while ($row = $result->fetch_assoc()) {
    $addons[] = [
        'id' => (int)$row['addonId'],
        'name' => $row['name'],
        'description' => $row['description'],
        'price' => (float)$row['price'],
        'isActive' => (bool)$row['isActive']
    ];
}

echo json_encode([
    'success' => true,
    'addons' => $addons
]);
