<?php
// CHT-Travel-and-Tours-Web/HTML/userDashboard/api/trips_list.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

// Optional search (?q=keyword)
$search = trim($_GET['q'] ?? '');

if ($search !== '') {
    $like = '%' . $search . '%';
    $stmt = $mysqli->prepare("
        SELECT TripID, Name, Description, Location, StartDate, EndDate, IsActive
        FROM trip
        WHERE Name LIKE ? OR Location LIKE ? OR Description LIKE ?
        ORDER BY StartDate DESC, TripID DESC
    ");
    $stmt->bind_param('sss', $like, $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $mysqli->query("
        SELECT TripID, Name, Description, Location, StartDate, EndDate, IsActive
        FROM trip
        ORDER BY StartDate DESC, TripID DESC
    ");
}

$rows = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rows[] = [
            'id' => (int)$row['TripID'],
            'name' => $row['Name'],
            'description' => $row['Description'],
            'location' => $row['Location'],
            'startDate' => $row['StartDate'],
            'endDate' => $row['EndDate'],
            'isActive' => (bool)$row['IsActive'],
            'status' => $row['IsActive'] ? 'Active' : 'Inactive'
        ];
    }
}

echo json_encode([
  'success' => true,
  'trips'   => $rows
]);