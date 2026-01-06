<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>CHT Travel & Tour Management System - Login</title>
    <link rel="stylesheet" href="../HTML/CSS/assets/css/style.css">
</head>

<body class="login-body">
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-logo">
                <div class="logo-circle">CHT</div>
                <div class="logo-text">
                    <span>CHT Travel & Tours</span>
                    <small>Management System</small>
                </div>
            </div>

            <div class="login-title">
                <h2>Welcome Back</h2>
                <p>Sign in to continue to your dashboard</p>
            </div>

            <form id="loginForm">
  <div class="form-group">
    <label for="role">Login As</label>
    <select id="role" name="role">
      <option value="admin">ADMIN</option>
      <option value="user">USER</option>
    </select>
  </div>

  <div class="form-group">
    <label for="email">Email / Username</label>
    <input id="email" type="text" placeholder="Enter your email or username">
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input id="password" type="password" placeholder="Enter your password">
  </div>

  <div class="login-actions">
    <button type="submit" class="btn btn-primary">Sign In</button>
  </div>
</form>

            <div class="login-footer">
                CHT Travel & Tour Management System<br>
                © 2026 All rights reserved
            </div>
        </div>
    </div>

    <script src="./JS/assets/admin_JS/log_in.js"></script>
</body>

</html>


