<?php
// CHT-Travel-and-Tours-Web/HTML/userDashboard/api/hotels_list.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../../api/config.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : "";

$sql = "SELECT accommodationId, name, address, contact, amenities, numberOfRooms, defaultRoomType 
        FROM accommodation";

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
    $hotels[] = [
        "id" => (int)$row["accommodationId"],
        "name" => $row["name"],
        "address" => $row["address"],
        "contact" => $row["contact"],
        "amenities" => $row["amenities"],
        "numberOfRooms" => (int)$row["numberOfRooms"],
        "roomType" => $row["defaultRoomType"]
    ];
}

echo json_encode(["success" => true, "hotels" => $hotels]);