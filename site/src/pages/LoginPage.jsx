import React, {useEffect} from 'react';
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../App"
import {AuthLayout} from "../components/AuthLayout";
import {PasswordInput} from "../components/PasswordInput";
import "../styles/Auth.css"

const HTTP_STATUS_WRONG_PASSWORD = 401;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_OK = 200;
const LOGIN_TOKEN = ""

const LoginPage = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
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

        const response = await fetch("api/login", {
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
        //     redirect in 2 seconds to landing page
            setTimeout(() => {
                navigate("/landing");
            }, 2000);
        }
        else {
            if(response.status === HTTP_STATUS_WRONG_PASSWORD) {
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
                    setError("Account locked.");
                }
                setError(data.username);
            }
            else if(response.status === HTTP_STATUS_NOT_FOUND) {
                setError(data.username);
            }
            else { // for either invalid username or invalid password
                setError(data.username);
            }
        }
        if (error) {
            document.getElementById("username").focus()
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

    useEffect(() => {
        document.getElementById("username").focus()
    }, [])

    return (
        <AuthLayout>
            <div className="log-in-container">
                <form onSubmit={handleSubmit} className="log-in-form" aria-labelledby="signin-heading">
                    <h1 id="signin-heading">Sign in</h1>

                    {error && <div className="error-message"
                                   role="alert" aria-live="assertive">{error}</div>}
                    {message && <div className="login-message"
                                     role="status" aria-live="polite">{message}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input id="username"
                               type="text"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               aria-required="true"
                               aria-invalid={error && error.includes("username") ? "true" : "false"}
                               aria-describedby={error && error.includes("username") ? "username-error" : undefined}
                               required
                        />
                    </div>

                    <PasswordInput
                        id="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="submit-button"
                            aria-busy={message ? "true" : "false"}>
                        Sign in
                    </button>

                    <div className="log-in-footer">
                        Don't have an account? <Link to="/signup"
                                                     aria-label="Sign up for a new account">Sign up</Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
