<?php
// HTML/api/config.php

$DB_HOST = 'localhost';
$DB_PORT = 3306;            // MySQL Workbench default port (change to 3307 if needed)
$DB_USER = 'root';          // change if needed
$DB_PASS = 'password';              // MySQL Workbench password - update if you set one
$DB_NAME = 'cht_updated';   // the database name you created in Workbench

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);

if ($mysqli->connect_errno) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

$mysqli->set_charset('utf8mb4');