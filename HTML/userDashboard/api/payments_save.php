<?php
// HTML/userDashboard/api/payments_save.php
require '../../api/config.php';

header('Content-Type: application/json; charset=utf-8');

$bookingID   = trim($_POST['BookingID'] ?? '');
$clientName  = trim($_POST['ClientName'] ?? '');
$packageName = trim($_POST['PackageName'] ?? '');
$amount      = (float)($_POST['Amount'] ?? 0);
$datePaid    = trim($_POST['DatePaid'] ?? '');
$method      = trim($_POST['Method'] ?? 'Cash');
$status      = trim($_POST['Status'] ?? 'Paid');
$reference   = trim($_POST['Reference'] ?? '');
$notes       = trim($_POST['Notes'] ?? '');

if ($clientName === '' || $packageName === '' || $amount <= 0 || $datePaid === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Client, package, amount and date are required.']);
    exit;
}

$stmt = $mysqli->prepare("
  INSERT INTO payments
    (BookingID, ClientName, PackageName, Amount, DatePaid, Method, Status, Reference, Notes)
  VALUES (?,?,?,?,?,?,?,?,?)
");
$stmt->bind_param(
  'issdsssss',
  $bookingID !== '' ? (int)$bookingID : null,
  $clientName,
  $packageName,
  $amount,
  $datePaid,
  $method,
  $status,
  $reference,
  $notes
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save payment: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true]);