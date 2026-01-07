<?php
// CHT-Travel-and-Tours-Web/HTML/userDashboard/api/transportation_list.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../../api/config.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : "";

// Check if pricePerDay column exists
$columnCheck = $mysqli->query("SHOW COLUMNS FROM vehicle LIKE 'pricePerDay'");
$hasPriceColumn = $columnCheck && $columnCheck->num_rows > 0;

$sql = "SELECT VehicleID, Type, Capacity, PlateNumber, ProviderName" 
     . ($hasPriceColumn ? ", pricePerDay" : "") 
     . " FROM vehicle";

if ($search !== "") {
    $like = "%" . $mysqli->real_escape_string($search) . "%";
    $sql .= " WHERE Type LIKE '$like' OR ProviderName LIKE '$like' OR PlateNumber LIKE '$like'";
}

$sql .= " ORDER BY VehicleID ASC";

$result = $mysqli->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query failed: " . $mysqli->error]);
    exit;
}

$vehicles = [];
while ($row = $result->fetch_assoc()) {
    // Estimate price based on vehicle type and capacity
    $type = $row["Type"] ?? '';
    $capacity = (int)$row["Capacity"];
    $defaultPrice = 3000;
    
    if (stripos($type, 'bus') !== false) $defaultPrice = 5000;
    elseif (stripos($type, 'van') !== false) $defaultPrice = 3000;
    elseif (stripos($type, 'sedan') !== false || stripos($type, 'car') !== false) $defaultPrice = 2000;
    elseif (stripos($type, 'suv') !== false) $defaultPrice = 2500;
    elseif (stripos($type, 'coaster') !== false) $defaultPrice = 4000;
    elseif ($capacity >= 40) $defaultPrice = 5000;
    elseif ($capacity >= 15) $defaultPrice = 3500;
    
    $vehicles[] = [
        "id" => (int)$row["VehicleID"],
        "type" => $row["Type"],
        "capacity" => $capacity,
        "plateNumber" => $row["PlateNumber"],
        "provider" => $row["ProviderName"],
        "pricePerDay" => isset($row["pricePerDay"]) ? (float)$row["pricePerDay"] : $defaultPrice
    ];
}

echo json_encode(["success" => true, "vehicles" => $vehicles]);