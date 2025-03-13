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
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()

    // If user is already logged in, redirect to landing page
    useEffect(() => {
        if (user) {
            navigate("/landing")
        }
    }, [user, navigate])

    const validateForm = () => {

        setError("")

        //check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return false
        }

        // validate user name format
        if (!username || !username.match(/^[a-zA-Z0-9 _-]+$/)) {
            setError("Username must only contain letters, numbers, spaces, underscores, or hyphens")
            return false
        }

        // validate password requirements
        if (!password || !password.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
            setError("Password must contain at least one lowercase letter, one uppercase letter, and one number")
            return false
        }
        return true
    }


    const handleSubmit = async (e) => {
        e.preventDefault()

        //validate form before submitting
        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // backend registration api
            const response = await fetch('/api/register/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })

            const contentType = response.headers.get('content-type')

            if (!contentType || !contentType.includes('application/json')) {
                console.error('Non-JSON response received:', await response.text())
                throw new Error('Server returned an unexpected response format')
            }

            const data = await response.json()

            if (!response.ok) {
                //handle registration errors
                throw new Error(data.message || "Registration failed")
            }
            //go to login if registration is successful
            navigate("/login")
        } catch (error) {
            setError(error.message || "An error occurred during registration")
        } finally {
            setIsLoading(false)
        }
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

                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="password-label">
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
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
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/login")}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create an account"}
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