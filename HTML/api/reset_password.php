<?php
// Reset ALL employee passwords
require 'config.php';

echo "<h2>Reset Employee Passwords</h2>";

// Set all passwords to 'password123'
$newPassword = 'password123';
$hashedPassword = sha1($newPassword);

$stmt = $mysqli->prepare("UPDATE employee SET password = ?");
$stmt->bind_param('s', $hashedPassword);

if ($stmt->execute()) {
    echo "<h3 style='color:green;'>✓ All passwords reset to: password123</h3>";
    
    // Show all employees
    echo "<h3>Employees you can login with:</h3>";
    echo "<table border='1' cellpadding='8'>";
    echo "<tr><th>Name</th><th>Email</th><th>Password</th><th>Role</th></tr>";
    
    $result = $mysqli->query("SELECT name, email, isManager, isActive FROM employee WHERE isActive = 1");
    while ($row = $result->fetch_assoc()) {
        $role = $row['isManager'] ? 'ADMIN' : 'USER';
        echo "<tr>";
        echo "<td>{$row['name']}</td>";
        echo "<td><strong>{$row['email']}</strong></td>";
        echo "<td>password123</td>";
        echo "<td>$role</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<br><p><a href='../log_in.html' style='font-size:18px;'>→ Go to Login Page</a></p>";
} else {
    echo "<h3 style='color:red;'>✗ Failed: " . $mysqli->error . "</h3>";
}
?>
