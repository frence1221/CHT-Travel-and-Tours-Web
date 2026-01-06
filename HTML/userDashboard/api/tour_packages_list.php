<?php
// CHT-Travel-and-Tours-Web/HTML/userDashboard/api/tour_packages_list.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

// Optional search query (?q=hokkaido)
$search = trim($_GET['q'] ?? '');

if ($search !== '') {
    $like = '%' . $search . '%';
    // Adjust column names to your actual table
    $stmt = $mysqli->prepare("
        SELECT 
          id,              -- or PackageID
          name,            -- package name
          destination,
          duration_days,
          max_pax,
          price,
          status,
          description,
          inclusions,
          image_path
        FROM tour_packages
        WHERE (name LIKE ? OR destination LIKE ?)
          AND status = 'Active'
        ORDER BY id DESC
    ");
    $stmt->bind_param('ss', $like, $like);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $mysqli->query("
        SELECT 
          id,
          name,
          destination,
          duration_days,
          max_pax,
          price,
          status,
          description,
          inclusions,
          image_path
        FROM tour_packages
        WHERE status = 'Active'
        ORDER BY id DESC
    ");
}

$rows = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
}

echo json_encode([
  'success'  => true,
  'packages' => $rows
]);