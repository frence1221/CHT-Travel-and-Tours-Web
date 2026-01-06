<?php
// HTML/adminDashboard/api/dashboard_summary.php
require '../../api/config.php';
header('Content-Type: application/json; charset=utf-8');

$response = [
    'success' => true,
    'totalSales' => 0,
    'totalBookings' => 0,
    'activePackages' => 0,
    'activeEmployees' => 0,
    'recentBookings' => []
];

// Get Total Sales (sum of all payments)
$salesResult = $mysqli->query("SELECT COALESCE(SUM(amount), 0) as total FROM payment");
if ($salesResult) {
    $row = $salesResult->fetch_assoc();
    $response['totalSales'] = $row['total'];
}

// Get Total Bookings
$bookingsResult = $mysqli->query("SELECT COUNT(*) as total FROM booking");
if ($bookingsResult) {
    $row = $bookingsResult->fetch_assoc();
    $response['totalBookings'] = (int)$row['total'];
}

// Get Active Packages
$packagesResult = $mysqli->query("SELECT COUNT(*) as total FROM package WHERE IsActive = 1");
if ($packagesResult) {
    $row = $packagesResult->fetch_assoc();
    $response['activePackages'] = (int)$row['total'];
}

// Get Active Employees
$employeesResult = $mysqli->query("SELECT COUNT(*) as total FROM employee WHERE isActive = 1");
if ($employeesResult) {
    $row = $employeesResult->fetch_assoc();
    $response['activeEmployees'] = (int)$row['total'];
}

// Get Recent Bookings (last 5)
$recentQuery = "
    SELECT 
        b.bookingId as id,
        c.name as client,
        p.Name as package,
        DATE_FORMAT(b.bookingDate, '%Y-%m-%d') as date,
        b.status
    FROM booking b
    LEFT JOIN client c ON b.clientId = c.clientId
    LEFT JOIN package p ON b.packageId = p.PackageID
    ORDER BY b.bookingDate DESC
    LIMIT 5
";
$recentResult = $mysqli->query($recentQuery);
if ($recentResult) {
    while ($row = $recentResult->fetch_assoc()) {
        $response['recentBookings'][] = $row;
    }
}

echo json_encode($response);
