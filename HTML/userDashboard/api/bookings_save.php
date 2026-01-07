<?php
// HTML/userDashboard/api/bookings_save.php
// Save a new booking to the database

require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['clientId', 'packageId'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

// Extract data
$clientId = (int)$input['clientId'];
$packageId = (int)$input['packageId'];
$bookingDate = !empty($input['startDate']) ? $input['startDate'] : date('Y-m-d');
$numberOfPax = !empty($input['numberOfPax']) ? (int)$input['numberOfPax'] : 1;
$totalAmount = !empty($input['totalAmount']) ? (float)$input['totalAmount'] : 0;
$status = !empty($input['status']) ? $input['status'] : 'Pending';
$accommodationId = !empty($input['accommodationId']) ? (int)$input['accommodationId'] : null;
$vehicleId = !empty($input['vehicleId']) ? (int)$input['vehicleId'] : null;
$specialRequests = !empty($input['specialRequests']) ? $input['specialRequests'] : '';
$addons = !empty($input['addons']) ? json_encode($input['addons']) : '[]';

// Check existing columns in booking table
$columnsResult = $mysqli->query("SHOW COLUMNS FROM booking");
$existingColumns = [];
while ($col = $columnsResult->fetch_assoc()) {
    $existingColumns[] = strtolower($col['Field']);
}

// Add missing columns if they don't exist
$alterQueries = [];
if (!in_array('totalamount', $existingColumns)) {
    $alterQueries[] = "ADD COLUMN TotalAmount DECIMAL(10,2) DEFAULT 0";
}
if (!in_array('accommodationid', $existingColumns)) {
    $alterQueries[] = "ADD COLUMN AccommodationID INT NULL";
}
if (!in_array('vehicleid', $existingColumns)) {
    $alterQueries[] = "ADD COLUMN VehicleID INT NULL";
}
if (!in_array('specialrequests', $existingColumns)) {
    $alterQueries[] = "ADD COLUMN SpecialRequests TEXT NULL";
}
if (!in_array('addons', $existingColumns)) {
    $alterQueries[] = "ADD COLUMN Addons TEXT NULL";
}
if (!in_array('bookingref', $existingColumns)) {
    $alterQueries[] = "ADD COLUMN BookingRef VARCHAR(20) NULL";
}

if (!empty($alterQueries)) {
    $alterSql = "ALTER TABLE booking " . implode(", ", $alterQueries);
    $mysqli->query($alterSql);
    // Re-fetch columns
    $columnsResult = $mysqli->query("SHOW COLUMNS FROM booking");
    $existingColumns = [];
    while ($col = $columnsResult->fetch_assoc()) {
        $existingColumns[] = strtolower($col['Field']);
    }
}

// Build insert query based on existing columns
$columns = ['ClientID', 'PackageID', 'BookingDate', 'PaxCount', 'Status'];
$placeholders = ['?', '?', '?', '?', '?'];
$types = 'iisis';
$values = [$clientId, $packageId, $bookingDate, $numberOfPax, $status];

if (in_array('totalamount', $existingColumns)) {
    $columns[] = 'TotalAmount';
    $placeholders[] = '?';
    $types .= 'd';
    $values[] = $totalAmount;
}

if (in_array('accommodationid', $existingColumns) && $accommodationId) {
    $columns[] = 'AccommodationID';
    $placeholders[] = '?';
    $types .= 'i';
    $values[] = $accommodationId;
}

if (in_array('vehicleid', $existingColumns) && $vehicleId) {
    $columns[] = 'VehicleID';
    $placeholders[] = '?';
    $types .= 'i';
    $values[] = $vehicleId;
}

if (in_array('specialrequests', $existingColumns) && $specialRequests) {
    $columns[] = 'SpecialRequests';
    $placeholders[] = '?';
    $types .= 's';
    $values[] = $specialRequests;
}

if (in_array('addons', $existingColumns)) {
    $columns[] = 'Addons';
    $placeholders[] = '?';
    $types .= 's';
    $values[] = $addons;
}

// Build SQL
$sql = "INSERT INTO booking (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";

// Prepare and execute
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param($types, ...$values);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save booking: ' . $stmt->error]);
    exit;
}

$bookingId = $mysqli->insert_id;

// Generate booking reference
$bookingRef = 'BK-' . str_pad($bookingId, 4, '0', STR_PAD_LEFT);

// Update with booking reference if column exists
if (in_array('bookingref', $existingColumns)) {
    $mysqli->query("UPDATE booking SET BookingRef = '$bookingRef' WHERE BookingID = $bookingId");
}

echo json_encode([
    'success' => true,
    'bookingId' => $bookingId,
    'bookingRef' => $bookingRef,
    'message' => 'Booking created successfully!'
]);

$stmt->close();
$mysqli->close();
?>