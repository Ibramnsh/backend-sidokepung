import express from "express";
import { login, createAdmin, verifyToken } from "../controllers/authController";

const router = express.Router();

// Login route
router.post("/login", login);

// Login form - GET method for browser access
router.get("/login", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Login</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 500px; 
                margin: 50px auto; 
                padding: 20px; 
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h2 { text-align: center; color: #333; margin-bottom: 30px; }
            form { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
            input { 
                width: 100%; 
                padding: 12px; 
                margin: 10px 0 20px 0; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                font-size: 16px;
                box-sizing: border-box;
            }
            button { 
                width: 100%;
                background: #007bff; 
                color: white; 
                padding: 12px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 16px;
                font-weight: bold;
            }
            button:hover { background: #0056b3; }
            button:disabled { background: #ccc; cursor: not-allowed; }
            .result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 5px; 
                word-break: break-all;
            }
            .success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
            }
            .error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
            }
            .token-info {
                background: #e7f3ff;
                border: 1px solid #b3d9ff;
                color: #004085;
                margin-top: 10px;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
            }
            .nav-links {
                text-align: center;
                margin-top: 20px;
            }
            .nav-links a {
                color: #007bff;
                text-decoration: none;
                margin: 0 10px;
            }
            .nav-links a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🔐 Admin Login</h2>
            <form id="loginForm">
                <div>
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required placeholder="Enter your username">
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required placeholder="Enter your password">
                </div>
                <button type="submit" id="loginBtn">Login</button>
            </form>
            
            <div class="nav-links">
                <a href="/api/auth/create-admin-form">Create Admin</a> |
                <a href="/api/auth/test">Test Endpoints</a> |
                <a href="/api/auth/dashboard">Dashboard</a>
            </div>
            
            <div id="result"></div>
        </div>

        <script>
            let currentToken = localStorage.getItem('adminToken');
            
            // Check if already logged in
            if (currentToken) {
                checkTokenValidity();
            }
            
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const resultDiv = document.getElementById('result');
                const loginBtn = document.getElementById('loginBtn');
                
                loginBtn.disabled = true;
                loginBtn.textContent = 'Logging in...';
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        localStorage.setItem('adminToken', data.token);
                        resultDiv.innerHTML = \`
                            <div class="result success">
                                <strong>✅ Login Successful!</strong><br>
                                Welcome, \${data.user.username}!<br>
                                Role: \${data.user.role}
                                <div class="token-info">
                                    <strong>Token saved to localStorage</strong><br>
                                    Token: \${data.token.substring(0, 50)}...
                                </div>
                            </div>
                        \`;
                        document.getElementById('loginForm').reset();
                        
                        // Redirect to dashboard after 2 seconds
                        setTimeout(() => {
                            window.location.href = '/api/auth/dashboard';
                        }, 2000);
                    } else {
                        resultDiv.innerHTML = '<div class="result error"><strong>❌ Login Failed</strong><br>' + data.message + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>❌ Error</strong><br>' + error.message + '</div>';
                } finally {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            });
            
            async function checkTokenValidity() {
                try {
                    const response = await fetch('/api/auth/verify', {
                        headers: {
                            'Authorization': 'Bearer ' + currentToken
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('result').innerHTML = \`
                            <div class="result success">
                                <strong>✅ Already Logged In</strong><br>
                                User: \${data.user.username}<br>
                                Role: \${data.user.role}<br>
                                <a href="/api/auth/dashboard">Go to Dashboard</a>
                            </div>
                        \`;
                    } else {
                        localStorage.removeItem('adminToken');
                    }
                } catch (error) {
                    localStorage.removeItem('adminToken');
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Create admin route - POST method
router.post("/create-admin", createAdmin);

// Create admin route - GET method for easy browser testing
router.get("/create-admin-form", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Create Admin</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
            form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { margin-top: 20px; padding: 10px; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        </style>
    </head>
    <body>
        <h2>Create Admin Account</h2>
        <form id="adminForm">
            <div>
                <label>Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div>
                <label>Password:</label>
                <input type="password" id="password" name="password" required minlength="6">
            </div>
            <button type="submit">Create Admin</button>
        </form>
        <div id="result"></div>

        <script>
            document.getElementById('adminForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const resultDiv = document.getElementById('result');
                
                try {
                    const response = await fetch('/api/auth/create-admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        resultDiv.innerHTML = '<div class="result success">' + data.message + '</div>';
                        document.getElementById('adminForm').reset();
                    } else {
                        resultDiv.innerHTML = '<div class="result error">' + data.message + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error">Error: ' + error.message + '</div>';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Add dashboard route
router.get("/dashboard", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Dashboard</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 20px auto; 
                padding: 20px; 
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; text-align: center; }
            .user-info {
                background: #e7f3ff;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .action-btn {
                background: #007bff;
                color: white;
                padding: 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                text-decoration: none;
                text-align: center;
                display: block;
            }
            .action-btn:hover { background: #0056b3; }
            .action-btn.danger { background: #dc3545; }
            .action-btn.danger:hover { background: #c82333; }
            .result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 5px; 
            }
            .success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
            }
            .error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎛️ Admin Dashboard</h1>
            
            <div class="user-info" id="userInfo">
                <strong>Loading user info...</strong>
            </div>
            
            <div class="actions">
                <button class="action-btn" onclick="verifyToken()">🔍 Verify Token</button>
                <a href="/api/auth/create-admin-form" class="action-btn">👤 Create New Admin</a>
                <a href="/api/auth/test" class="action-btn">🧪 Test Endpoints</a>
                <button class="action-btn danger" onclick="logout()">🚪 Logout</button>
            </div>
            
            <div id="result"></div>
        </div>

        <script>
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                window.location.href = '/api/auth/login';
            }
            
            // Load user info on page load
            loadUserInfo();
            
            async function loadUserInfo() {
                try {
                    const response = await fetch('/api/auth/verify', {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('userInfo').innerHTML = \`
                            <strong>👋 Welcome, \${data.user.username}!</strong><br>
                            Role: \${data.user.role}<br>
                            User ID: \${data.user.id}<br>
                            Token expires: \${new Date(data.tokenInfo.expiresAt).toLocaleString()}
                        \`;
                    } else {
                        document.getElementById('userInfo').innerHTML = '<strong>❌ Invalid session</strong>';
                        setTimeout(() => {
                            logout();
                        }, 2000);
                    }
                } catch (error) {
                    document.getElementById('userInfo').innerHTML = '<strong>❌ Error loading user info</strong>';
                }
            }
            
            async function verifyToken() {
                const resultDiv = document.getElementById('result');
                
                try {
                    const response = await fetch('/api/auth/verify', {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        resultDiv.innerHTML = \`
                            <div class="result success">
                                <strong>✅ Token is Valid</strong><br>
                                User: \${data.user.username}<br>
                                Role: \${data.user.role}<br>
                                Expires: \${new Date(data.tokenInfo.expiresAt).toLocaleString()}
                            </div>
                        \`;
                    } else {
                        resultDiv.innerHTML = '<div class="result error"><strong>❌ Token Invalid</strong><br>' + data.message + '</div>';
                    }
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>❌ Error</strong><br>' + error.message + '</div>';
                }
            }
            
            function logout() {
                localStorage.removeItem('adminToken');
                window.location.href = '/api/auth/login';
            }
        </script>
    </body>
    </html>
  `);
});

// Update the verify route to be more user-friendly
router.get("/verify", verifyToken);

// Add a new test verify route that shows how to use it
router.get("/verify-info", (req, res) => {
  res.json({
    message: "How to use the verify endpoint",
    instructions: {
      step1: "First login to get a token: POST /api/auth/login",
      step2: "Use the token in Authorization header: 'Bearer <your-token>'",
      step3: "Then call: GET /api/auth/verify with Authorization header",
    },
    example: {
      loginRequest: {
        method: "POST",
        url: "/api/auth/login",
        body: { username: "admin", password: "admin123" },
      },
      verifyRequest: {
        method: "GET",
        url: "/api/auth/verify",
        headers: { Authorization: "Bearer <token-from-login-response>" },
      },
    },
  });
});

// Test route to check if auth routes are working
router.get("/test", (req, res) => {
  res.json({
    message: "Auth routes are working!",
    availableEndpoints: {
      "POST /api/auth/login": "Login with username and password",
      "POST /api/auth/create-admin": "Create new admin account",
      "GET /api/auth/create-admin-form": "Web form to create admin account",
      "GET /api/auth/verify": "Verify JWT token",
      "GET /api/auth/test": "Test endpoint",
    },
  });
});

export default router;
