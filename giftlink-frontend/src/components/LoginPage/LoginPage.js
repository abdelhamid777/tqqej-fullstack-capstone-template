import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {

    // Task 1: Create useState hook variables for email and password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Task 2: Create handleLogin function
    const handleLogin = async () => {
        console.log("Inside handleLogin");
        console.log("Email:", email);
        console.log("Password:", password);
    }

    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="login-card p-4 border rounded">
              <h2 className="text-center mb-4 font-weight-bold">Login</h2>

              {/* Task 3: Input element for email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="text"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Task 3: Input element for password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Task 4: Login button */}
              <button className="btn btn-primary w-100 mb-3" onClick={handleLogin}>Login</button>

              <p className="mt-4 text-center">
                New here? <a href="/app/register" className="text-primary">Register Here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
}

export default LoginPage;
