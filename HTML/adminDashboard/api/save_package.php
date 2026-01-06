<?php
// HTML/adminDashboard/api/save_package.php
require '../../api/config.php';
header('Content-Type: application/json; charset=utf-8');

$id          = isset($_POST['id']) && $_POST['id'] !== '' ? (int)$_POST['id'] : null;
$name        = trim($_POST['name'] ?? '');
$destination = trim($_POST['destination'] ?? '');
$duration    = (int)($_POST['duration_days'] ?? 4);
$maxPax      = (int)($_POST['max_pax'] ?? 20);
$price       = (float)($_POST['price'] ?? 0);
// Handle checkbox - if 'status' is set (checkbox checked), it's Active (1); otherwise Inactive (0)
$isActive    = isset($_POST['status']) ? 1 : 0;
$description = trim($_POST['description'] ?? '');
$inclusions  = trim($_POST['inclusions'] ?? '');

if ($name === '' || $destination === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name and destination are required.']);
    exit;
}

// ---- handle image upload (optional) ----
$imagePath = null;
$uploadDir = '../../uploads/packages/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!empty($_FILES['image']['name'])) {
    $fileName = time() . '_' . basename($_FILES['image']['name']);
    $targetFile = $uploadDir . $fileName;

    $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    $check = getimagesize($_FILES['image']['tmp_name']);
    if ($check === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Uploaded file is not an image.']);
        exit;
    }

    if (!in_array($imageFileType, ['jpg', 'jpeg', 'png', 'gif'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Only JPG, JPEG, PNG & GIF allowed.']);
        exit;
    }

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload image.']);
        exit;
    }

    $imagePath = 'uploads/packages/' . $fileName;
}

// ---- build SQL ----
if ($id) {
    if ($imagePath) {
        $stmt = $mysqli->prepare("UPDATE package
          SET Name=?, Destination=?, Duration=?, MaxPax=?, Price=?, IsActive=?, Description=?, Inclusions=?, ImagePath=?
          WHERE PackageID=?");
        $stmt->bind_param(
          'ssiidisssi',
          $name, $destination, $duration, $maxPax, $price, $isActive, $description, $inclusions, $imagePath, $id
        );
    } else {
        $stmt = $mysqli->prepare("UPDATE package
          SET Name=?, Destination=?, Duration=?, MaxPax=?, Price=?, IsActive=?, Description=?, Inclusions=?
          WHERE PackageID=?");
        $stmt->bind_param(
          'ssiidissi',
          $name, $destination, $duration, $maxPax, $price, $isActive, $description, $inclusions, $id
        );
    }
} else {
    $stmt = $mysqli->prepare("INSERT INTO package
      (Name, Destination, Duration, MaxPax, Price, IsActive, Description, Inclusions, ImagePath)
      VALUES (?,?,?,?,?,?,?,?,?)");
    $stmt->bind_param(
      'ssiidisss',
      $name, $destination, $duration, $maxPax, $price, $isActive, $description, $inclusions, $imagePath
    );
}

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save package: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true, 'id' => $id ? $id : $mysqli->insert_id]);