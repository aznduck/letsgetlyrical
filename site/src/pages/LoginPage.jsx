import React, {useEffect} from 'react';
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeOff, Eye } from "lucide-react"
import { useAuth } from "../App"

const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_OK = 200;

const LoginPage = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setMessage("");

        const lockoutEnd = localStorage.getItem("lockoutEnd");
        if (lockoutEnd && Date.now() < lockoutEnd) {
            const timeRemaining = (lockoutEnd - Date.now()) / 1000; // Time remaining in seconds
            setError(`Account locked. Try again in ${Math.ceil(timeRemaining)} seconds.`);
            return;
        }

        const response = await fetch("api/login/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
            //     username: "johndoe",
            //     password: "Real1"
        });
        const data = await response.json();

        if(response.status === HTTP_STATUS_OK) {
            setMessage(data.username);
            login({ username });
        //     redirect in 3 seconds to landing page
            setTimeout(() => {
                navigate("/landing");
            }, 2000);
        }
        else {
            if(response.status === HTTP_STATUS_UNAUTHORIZED) {
                // track failed login attempts
                let failedAttempts = JSON.parse(localStorage.getItem("failedAttempts")) || [];

                const now = Date.now();
                failedAttempts = failedAttempts.filter(attemptTime => now - attemptTime < 60000); // Filter attempts within last 1 minute

                // add the current failed attempt time
                failedAttempts.push(now);
                localStorage.setItem("failedAttempts", JSON.stringify(failedAttempts));

                if (failedAttempts.length >= 3) {
                    // lock the account for 30 seconds if 3 failed attempts occurred in the last minute
                    localStorage.setItem("lockoutEnd", now + 30000);
                    setError("Too many failed attempts. Account locked for 30 seconds");
                }
                setError(data.username);
            }
            else if(response.status === HTTP_STATUS_NOT_FOUND) {
                setError(data.username);
            }
            else {
                setError("Something went wrong.");
            }
        }
    }

    // resets the lockout period
    useEffect(() => {
        const interval = setInterval(() => {
            const failedAttempts = JSON.parse(localStorage.getItem("failedAttempts")) || [];
            const now = Date.now();
            // Remove any failed attempts that are older than 1 minute
            const recentAttempts = failedAttempts.filter(attemptTime => now - attemptTime < 60000);
            localStorage.setItem("failedAttempts", JSON.stringify(recentAttempts));
        }, 60000); // Check every minute

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="auth-container">
            <div className="logo-container">
                <img
                    src="/images/logo_xL_64.png"
                    alt="Let's get lyrical!"
                    width={300}
                    height={100}
                />
            </div>

            <div className="log-in-container">
                <form onSubmit={handleSubmit} className="log-in-form">
                    <h1>Sign in</h1>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="login-message">{message}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                               required/>
                    </div>

                    <div className="form-group">
                        <div className="password-label">
                            <label htmlFor="password">Password</label>
                            <button type="button" className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>} Hide
                            </button>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Sign in
                    </button>

                    <div className="log-in-footer">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </div>
                </form>
            </div>

            <div className="team-label-container">
                <img
                    src="/images/TeamLabel_L.png"
                    alt="Team 23"
                    width={150}
                    height={60}
                />
            </div>
        </div>
    )
}

export default LoginPage
