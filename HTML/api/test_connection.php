<?php
// Test database connection
error_reporting(E_ALL);
ini_set('display_errors', 1);

$DB_HOST = 'localhost';
$DB_PORT = 3306;
$DB_USER = 'root';
$DB_PASS = 'password';
$DB_NAME = 'cht_updated';

echo "<h2>Testing Database Connection</h2>";

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);

if ($mysqli->connect_errno) {
    echo "<p style='color:red;'>Connection FAILED: " . $mysqli->connect_error . "</p>";
    exit;
}

echo "<p style='color:green;'>Connected successfully!</p>";

// Show all tables
echo "<h3>Tables in database '$DB_NAME':</h3>";
$result = $mysqli->query("SHOW TABLES");
if ($result) {
    echo "<ul>";
    while ($row = $result->fetch_array()) {
        echo "<li>" . $row[0] . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p style='color:red;'>Error: " . $mysqli->error . "</p>";
}

// Try to query the package table
echo "<h3>Testing 'package' table:</h3>";
$result = $mysqli->query("SELECT * FROM package LIMIT 5");
if ($result) {
    echo "<p style='color:green;'>Query successful! Found " . $result->num_rows . " rows.</p>";
    
    if ($result->num_rows > 0) {
        echo "<h4>Columns:</h4><ul>";
        $fields = $result->fetch_fields();
        foreach ($fields as $field) {
            echo "<li>" . $field->name . " (" . $field->type . ")</li>";
        }
        echo "</ul>";
        
        echo "<h4>Data:</h4><pre>";
        $result->data_seek(0);
        while ($row = $result->fetch_assoc()) {
            print_r($row);
        }
        echo "</pre>";
    }
} else {
    echo "<p style='color:red;'>Query failed: " . $mysqli->error . "</p>";
    
    // Maybe the table has a different name?
    echo "<h4>Looking for similar tables...</h4>";
    $tables = $mysqli->query("SHOW TABLES LIKE '%pack%'");
    if ($tables && $tables->num_rows > 0) {
        while ($t = $tables->fetch_array()) {
            echo "<p>Found: " . $t[0] . "</p>";
        }
    }
    
    $tables = $mysqli->query("SHOW TABLES LIKE '%tour%'");
    if ($tables && $tables->num_rows > 0) {
        while ($t = $tables->fetch_array()) {
            echo "<p>Found: " . $t[0] . "</p>";
        }
    }
}

$mysqli->close();
?>
