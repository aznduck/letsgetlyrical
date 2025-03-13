import React from 'react';
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../App"
import { Eye, EyeOff } from "lucide-react"

const SignUpPage = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()

    // If user is already logged in, redirect to landing page
    useEffect(() => {
        if (user) {
            navigate("/landing")
        }
    }, [user, navigate])

    const handleSubmit = (e) => {
        e.preventDefault()
        // In a real app, you would validate and create the account here
        // As per requirements, redirect to login page
        navigate("/login")
    }

    return (
        <div className="auth-container">
            <div className="logo-container">
                <img
                    src="/images/logo_40.png"
                    alt="Let's get lyrical!"
                />
            </div>

            <div className="sign-up-container">
                <form onSubmit={handleSubmit} className="sign-up-form">
                    <h1>Create an account</h1>

                    <div className="sign-up-subtitle">
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <div className="password-label">
                            <label htmlFor="password">Password</label>
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />} Hide
                            </button>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="password-req">Must use 1 uppercase, 1 lowercase, and 1 number</div>
                    </div>

                    <div className="form-group">
                        <div className="password-label">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />} Hide
                            </button>
                        </div>
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="button-group">
                        <button type="button" className="cancel-button" onClick={() => navigate("/login")}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create an account
                        </button>
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

export default SignUpPage