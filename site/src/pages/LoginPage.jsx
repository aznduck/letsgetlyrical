import React from 'react';
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeOff, Eye } from "lucide-react"
import { useAuth } from "../App"

const MOCK_USERS = [
    { username: "user1", password: "Password1" },
    { username: "admin", password: "Admin123" },
]

const LoginPage = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const [error, setError] = useState("")
    const { login } = useAuth()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError("")

        const foundUser = MOCK_USERS.find((user) => user.username === username && user.password === password)

        if (foundUser) {
            // Valid credentials - log in and navigate to landing page
            login({ username: foundUser.username })
            navigate("/landing", { replace: true })
        } else {
            // Invalid credentials - show error message
            setError("Invalid username or password")
        }
    }

    return (
        <div className="auth-container">
            <div className="logo-container">
                <img
                    src="/images/logo_xL_64.png"
                    alt="Let's get lyrical!"
                    width={400}
                    height={150}
                />
            </div>

            <div className="log-in-container">
                <form onSubmit={handleSubmit} className="log-in-form">
                    <h1>Sign in</h1>

                    {error && <div className="error-message">{error}</div>}

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
