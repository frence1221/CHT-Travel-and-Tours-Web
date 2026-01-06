<?php
// HTML/userDashboard/api/payments_list.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/../../api/config.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : "";

$sql = "SELECT paymentId, bookingId, amount, paymentDate, method, status, referenceNumber 
        FROM payment";

if ($search !== "") {
    $like = "%" . $mysqli->real_escape_string($search) . "%";
    $sql .= " WHERE referenceNumber LIKE '$like' OR method LIKE '$like' OR CAST(bookingId AS CHAR) LIKE '$like'";
}

$sql .= " ORDER BY paymentId DESC";

$result = $mysqli->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "error" => "Query failed: " . $mysqli->error]);
    exit;
}

$payments = [];
$totalReceived = 0;
$totalPending = 0;

while ($row = $result->fetch_assoc()) {
    $amount = (float)$row["amount"];
    $status = strtoupper($row["status"]);
    
    if ($status === "PAID") {
        $totalReceived += $amount;
    } else if ($status === "PENDING") {
        $totalPending += $amount;
    }
    
    $payments[] = [
        "id" => (int)$row["paymentId"],
        "bookingId" => (int)$row["bookingId"],
        "amount" => $amount,
        "paymentDate" => $row["paymentDate"],
        "method" => ucfirst($row["method"]),
        "status" => $status,
        "reference" => $row["referenceNumber"]
    ];
}

echo json_encode([
    "success" => true, 
    "payments" => $payments,
    "totalReceived" => $totalReceived,
    "totalPending" => $totalPending,
    "totalCount" => count($payments)
]);