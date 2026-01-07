<?php
// CHT-Travel-and-Tours-Web/HTML/userDashboard/api/hotels_list.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../../api/config.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : "";

// Check if pricePerNight column exists
$columnCheck = $mysqli->query("SHOW COLUMNS FROM accommodation LIKE 'pricePerNight'");
$hasPriceColumn = $columnCheck && $columnCheck->num_rows > 0;

$sql = "SELECT accommodationId, name, address, contact, amenities, numberOfRooms, defaultRoomType" 
     . ($hasPriceColumn ? ", pricePerNight" : "") 
     . " FROM accommodation";

if ($search !== "") {
    $like = "%" . $mysqli->real_escape_string($search) . "%";
    $sql .= " WHERE name LIKE '$like' OR address LIKE '$like'";
}

$sql .= " ORDER BY accommodationId ASC";

$result = $mysqli->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query failed: " . $mysqli->error]);
    exit;
}

$hotels = [];
while ($row = $result->fetch_assoc()) {
    // Estimate price based on room type if not in database
    $roomType = $row["defaultRoomType"] ?? 'Standard';
    $defaultPrice = 2500;
    if (stripos($roomType, 'deluxe') !== false) $defaultPrice = 5000;
    elseif (stripos($roomType, 'suite') !== false) $defaultPrice = 8000;
    elseif (stripos($roomType, 'superior') !== false) $defaultPrice = 3500;
    
    $hotels[] = [
        "id" => (int)$row["accommodationId"],
        "name" => $row["name"],
        "address" => $row["address"],
        "contact" => $row["contact"],
        "amenities" => $row["amenities"],
        "numberOfRooms" => (int)$row["numberOfRooms"],
        "roomType" => $row["defaultRoomType"],
        "pricePerNight" => isset($row["pricePerNight"]) ? (float)$row["pricePerNight"] : $defaultPrice
    ];
}

echo json_encode(["success" => true, "hotels" => $hotels]);