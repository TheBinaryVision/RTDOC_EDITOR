import React from "react";
import { FaGoogle } from "react-icons/fa";
import "../styles/Login.css"; // Import the CSS file

const Login = () => {
  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Real-Time Doc Editor</h1>
        <p className="login-subtitle">Login to collaborate in real-time</p>

        <button onClick={handleGoogleLogin} className="google-login-btn">
          <FaGoogle className="google-icon" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
