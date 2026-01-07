<?php
// HTML/userDashboard/api/bookings_update.php
// Update booking status or details

require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate booking ID
if (empty($input['bookingId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Booking ID is required']);
    exit;
}

$bookingId = (int)$input['bookingId'];

// Check if booking exists
$checkStmt = $mysqli->prepare("SELECT bookingId FROM booking WHERE bookingId = ?");
$checkStmt->bind_param('i', $bookingId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Booking not found']);
    exit;
}

// ...existing code...

// Use correct column names and update all fields
$bookingUpdates = [];
$params = [];
$types = '';

// Booking table fields
if (isset($input['startDate'])) {
    $bookingUpdates[] = 'BookingDate = ?';
    $params[] = $input['startDate'];
    $types .= 's';
}
if (isset($input['pax'])) {
    $bookingUpdates[] = 'PaxCount = ?';
    $params[] = (int)$input['pax'];
    $types .= 'i';
}
if (isset($input['totalAmount'])) {
    $bookingUpdates[] = 'totalAmount = ?';
    $params[] = (float)$input['totalAmount'];
    $types .= 'd';
}
if (isset($input['status'])) {
    $bookingUpdates[] = 'status = ?';
    $params[] = $input['status'];
    $types .= 's';
}
if (isset($input['specialRequests'])) {
    $bookingUpdates[] = 'specialRequests = ?';
    $params[] = $input['specialRequests'];
    $types .= 's';
}
if (isset($input['addons'])) {
    $bookingUpdates[] = 'addons = ?';
    $params[] = json_encode($input['addons']);
    $types .= 's';
}

// Only update if there are fields
if (!empty($bookingUpdates)) {
    $params[] = $bookingId;
    $types .= 'i';
    $sql = "UPDATE booking SET " . implode(', ', $bookingUpdates) . " WHERE bookingId = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update booking: ' . $stmt->error]);
        exit;
    }
}

// Optionally update client info if provided
if (isset($input['clientName']) || isset($input['clientEmail']) || isset($input['clientContact'])) {
    $clientIdRes = $mysqli->query("SELECT clientId FROM booking WHERE bookingId = $bookingId");
    if ($clientIdRes && $clientIdRes->num_rows) {
        $clientId = $clientIdRes->fetch_assoc()['clientId'];
        $fields = [];
        $cparams = [];
        $ctypes = '';
        if (isset($input['clientName'])) { $fields[] = 'name = ?'; $cparams[] = $input['clientName']; $ctypes .= 's'; }
        if (isset($input['clientEmail'])) { $fields[] = 'email = ?'; $cparams[] = $input['clientEmail']; $ctypes .= 's'; }
        if (isset($input['clientContact'])) { $fields[] = 'contactNumber = ?'; $cparams[] = $input['clientContact']; $ctypes .= 's'; }
        if (!empty($fields)) {
            $cparams[] = $clientId;
            $ctypes .= 'i';
            $sql2 = "UPDATE client SET " . implode(', ', $fields) . " WHERE clientId = ?";
            $stmt2 = $mysqli->prepare($sql2);
            $stmt2->bind_param($ctypes, ...$cparams);
            $stmt2->execute();
        }
    }
}

// Optionally update package info if provided
if (isset($input['packageName']) || isset($input['destination'])) {
    $packageIdRes = $mysqli->query("SELECT packageId FROM booking WHERE bookingId = $bookingId");
    if ($packageIdRes && $packageIdRes->num_rows) {
        $packageId = $packageIdRes->fetch_assoc()['packageId'];
        $fields = [];
        $pparams = [];
        $ptypes = '';
        if (isset($input['packageName'])) { $fields[] = 'Name = ?'; $pparams[] = $input['packageName']; $ptypes .= 's'; }
        if (isset($input['destination'])) { $fields[] = 'Destination = ?'; $pparams[] = $input['destination']; $ptypes .= 's'; }
        if (!empty($fields)) {
            $pparams[] = $packageId;
            $ptypes .= 'i';
            $sql3 = "UPDATE package SET " . implode(', ', $fields) . " WHERE PackageID = ?";
            $stmt3 = $mysqli->prepare($sql3);
            $stmt3->bind_param($ptypes, ...$pparams);
            $stmt3->execute();
        }
    }
}


echo json_encode([
    'success' => true,
    'message' => 'Booking updated successfully',
    'bookingId' => $bookingId
]);
