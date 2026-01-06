<?php
$mysqli = new mysqli('localhost', 'root', 'password', 'cht_updated', 3306);
$result = $mysqli->query('DESCRIBE trip');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' - ' . $row['Type'] . "\n";
}
echo "\n--- Sample Data ---\n";
$data = $mysqli->query('SELECT * FROM trip LIMIT 3');
while ($row = $data->fetch_assoc()) {
    print_r($row);
}
