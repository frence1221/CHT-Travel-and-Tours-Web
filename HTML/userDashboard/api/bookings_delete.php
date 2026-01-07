<?php
// HTML/userDashboard/api/bookings_delete.php
// Delete a booking by bookingId

require '../../api/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['bookingId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Booking ID is required']);
    exit;
}
$bookingId = (int)$input['bookingId'];

$stmt = $mysqli->prepare('DELETE FROM booking WHERE bookingId = ?');
$stmt->bind_param('i', $bookingId);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to delete booking: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Booking deleted successfully']);
