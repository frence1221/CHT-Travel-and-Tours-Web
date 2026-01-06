<?php
// Test login - check what's happening
require 'config.php';

echo "<h2>Login Debug Test</h2>";

// Test with admin@cht.com
$testEmail = "admin@cht.com";
$testPassword = "admin"; // Try common passwords

echo "<h3>Testing with: $testEmail</h3>";

$stmt = $mysqli->prepare("SELECT employeeId, name, email, password, isManager, isActive FROM employee WHERE email = ?");
$stmt->bind_param('s', $testEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo "<p style='color:green;'>✓ User found!</p>";
    echo "<ul>";
    echo "<li>Name: " . $row['name'] . "</li>";
    echo "<li>Email: " . $row['email'] . "</li>";
    echo "<li>Password hash in DB: " . $row['password'] . "</li>";
    echo "<li>isManager: " . $row['isManager'] . "</li>";
    echo "<li>isActive: " . $row['isActive'] . "</li>";
    echo "</ul>";
    
    echo "<h4>Password hash tests:</h4>";
    echo "<p>Your stored hash length: " . strlen($row['password']) . " characters</p>";
    
    // Test common passwords
    $testPasswords = ['admin', 'password', '123456', 'admin123', 'Admin123'];
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Password</th><th>SHA1 Hash</th><th>Match?</th></tr>";
    foreach ($testPasswords as $pwd) {
        $hash = sha1($pwd);
        $match = ($hash === $row['password']) ? "<span style='color:green;'>✓ YES!</span>" : "No";
        echo "<tr><td>$pwd</td><td>$hash</td><td>$match</td></tr>";
    }
    echo "</table>";
    
} else {
    echo "<p style='color:red;'>✗ User NOT found with email: $testEmail</p>";
}

echo "<hr>";
echo "<h3>All employees:</h3>";
$all = $mysqli->query("SELECT employeeId, name, email, password FROM employee");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Password Hash</th></tr>";
while ($r = $all->fetch_assoc()) {
    echo "<tr><td>{$r['employeeId']}</td><td>{$r['name']}</td><td>{$r['email']}</td><td>{$r['password']}</td></tr>";
}
echo "</table>";

echo "<hr>";
echo "<h3>Reset a password:</h3>";
echo "<p>Run this SQL in MySQL Workbench to set password to 'admin123':</p>";
echo "<pre>UPDATE employee SET password = '" . sha1('admin123') . "' WHERE email = 'admin@cht.com';</pre>";
?>
