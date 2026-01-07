<?php
// HTML/userDashboard/api/bookings_list.php
// Get all bookings with related data

require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$search = isset($_GET['q']) ? trim($_GET['q']) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : '';

// Check if booking table exists
$tableCheck = $mysqli->query("SHOW TABLES LIKE 'booking'");
if ($tableCheck->num_rows === 0) {
    echo json_encode(['success' => true, 'bookings' => []]);
    exit;
}


$sql = "
    SELECT 
        b.bookingId,
        b.bookingRef,
        b.clientId,
        c.name as clientName,
        c.email as clientEmail,
        c.contactNumber as clientContact,
        b.packageId,
        p.Name as packageName,
        p.Destination as destination,
        p.Price as packagePrice,
        b.accommodationId,
        a.name as hotelName,
        b.vehicleId,
        v.Type as vehicleType,
        v.ProviderName as vehicleProvider,
        b.BookingDate as startDate,
        b.BookingDate as endDate,
        b.PaxCount,
        b.totalAmount,
        b.status,
        b.specialRequests,
        b.addons
    FROM booking b
    LEFT JOIN client c ON b.clientId = c.clientId
    LEFT JOIN package p ON b.packageId = p.PackageID
    LEFT JOIN accommodation a ON b.accommodationId = a.accommodationId
    LEFT JOIN vehicle v ON b.vehicleId = v.VehicleID
    WHERE 1=1
";

        // Only show last 7 days if ?recent=1
        if (isset($_GET['recent']) && $_GET['recent'] == '1') {
            $sql .= " AND b.BookingDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ";
        }

if ($search !== '') {
    $searchLike = '%' . $search . '%';
    $sql .= " AND (c.name LIKE ? OR p.Name LIKE ? OR p.Destination LIKE ? OR b.bookingRef LIKE ?)";
    $params[] = $searchLike;
    $params[] = $searchLike;
    $params[] = $searchLike;
    $params[] = $searchLike;
    $types .= 'ssss';
}

if ($status !== '' && $status !== 'all') {
    $sql .= " AND b.status = ?";
    $params[] = $status;
    $types .= 's';
}

$sql .= " ORDER BY b.BookingDate DESC";

if (!empty($params)) {
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $mysqli->query($sql);
}

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Query failed: ' . $mysqli->error]);
    exit;
}

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = [
        'id' => (int)$row['bookingId'],
        'ref' => $row['bookingRef'] ?? 'BK-' . str_pad($row['bookingId'], 4, '0', STR_PAD_LEFT),
        'clientId' => (int)$row['clientId'],
        'clientName' => $row['clientName'],
        'clientEmail' => $row['clientEmail'],
        'clientContact' => $row['clientContact'],
        'packageId' => (int)$row['packageId'],
        'packageName' => $row['packageName'],
        'destination' => $row['destination'],
        'packagePrice' => (float)$row['packagePrice'],
        'hotelId' => $row['accommodationId'] ? (int)$row['accommodationId'] : null,
        'hotelName' => $row['hotelName'],
        'vehicleId' => $row['vehicleId'] ? (int)$row['vehicleId'] : null,
        'vehicleType' => $row['vehicleType'],
        'vehicleProvider' => $row['vehicleProvider'],
        'startDate' => $row['startDate'],
        'endDate' => $row['endDate'],
        'pax' => (int)$row['PaxCount'],
        'totalAmount' => (float)$row['totalAmount'],
        'status' => $row['status'],
        'specialRequests' => $row['specialRequests'],
        'addons' => json_decode($row['addons'] ?? '[]', true)
        // 'createdAt' removed, does not exist
    ];
}

// Get statistics
$statsResult = $mysqli->query("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
    FROM booking
");

$stats = $statsResult ? $statsResult->fetch_assoc() : [
    'total' => 0,
    'confirmed' => 0,
    'pending' => 0,
    'cancelled' => 0,
    'completed' => 0
];

echo json_encode([
    'success' => true,
    'bookings' => $bookings,
    'stats' => [
        'total' => (int)$stats['total'],
        'confirmed' => (int)$stats['confirmed'],
        'pending' => (int)$stats['pending'],
        'cancelled' => (int)$stats['cancelled'],
        'completed' => (int)$stats['completed']
    ]
]);
