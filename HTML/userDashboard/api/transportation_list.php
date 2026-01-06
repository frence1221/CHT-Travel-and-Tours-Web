<?php
// CHT-Travel-and-Tours-Web/HTML/userDashboard/api/transportation_list.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../../api/config.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : "";

$sql = "SELECT VehicleID, Type, Capacity, PlateNumber, ProviderName FROM vehicle";

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
    $vehicles[] = [
        "id" => (int)$row["VehicleID"],
        "type" => $row["Type"],
        "capacity" => (int)$row["Capacity"],
        "plateNumber" => $row["PlateNumber"],
        "provider" => $row["ProviderName"]
    ];
}

echo json_encode(["success" => true, "vehicles" => $vehicles]);