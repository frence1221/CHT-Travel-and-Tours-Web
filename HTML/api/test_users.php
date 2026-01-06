<?php
// Test employee table structure
require 'config.php';

echo "<h2>Testing Employee Table</h2>";

$result = $mysqli->query("DESCRIBE employee");
if ($result) {
    echo "<h3>Columns:</h3><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li><strong>" . $row['Field'] . "</strong> - " . $row['Type'] . "</li>";
    }
    echo "</ul>";
    
    // Show sample data
    echo "<h3>Sample Data:</h3><pre>";
    $data = $mysqli->query("SELECT * FROM employee LIMIT 3");
    while ($row = $data->fetch_assoc()) {
        print_r($row);
    }
    echo "</pre>";
} else {
    echo "<p style='color:red;'>Error: " . $mysqli->error . "</p>";
}

// Also check for client table
echo "<h2>Testing Client Table</h2>";
$result = $mysqli->query("DESCRIBE client");
if ($result) {
    echo "<h3>Columns:</h3><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li><strong>" . $row['Field'] . "</strong> - " . $row['Type'] . "</li>";
    }
    echo "</ul>";
    
    echo "<h3>Sample Data:</h3><pre>";
    $data = $mysqli->query("SELECT * FROM client LIMIT 3");
    while ($row = $data->fetch_assoc()) {
        print_r($row);
    }
    echo "</pre>";
} else {
    echo "<p style='color:red;'>Error: " . $mysqli->error . "</p>";
}
?>
