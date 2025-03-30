import React from 'react';
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../App"
import {AlertCircle, CheckCircle, Eye, EyeOff} from "lucide-react"

const MOCK_USERS = [
    { username: "user1", password: "Password1" },
    { username: "admin", password: "Admin123" },
]

// Success Modal Component
const SuccessModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="success-modal">
                <div className="success-icon">
                    <CheckCircle size={50}/>
                </div>
                <h2>Account Created!</h2>
                <p>Your account has been created successfully.</p>
                <p className="redirect-text">Redirecting to login...</p>
            </div>
        </div>
    )
}

// Cancel Modal Component
const CancelModal = ({ onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="cancel-modal">
                <div className="cancel-icon">
                    <AlertCircle size={50} />
                </div>
                <h2>Are you sure?</h2>
                <p>All info entered will be cleared.</p>
                <div className="cancel-buttons">
                    <button className="cancel-button-secondary" onClick={onCancel}>
                        No, continue
                    </button>
                    <button className="cancel-button-primary" onClick={onConfirm}>
                        Yes, cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

const SignUpPage = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()
    const { user } = useAuth()
    const [errors, setErrors] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    })
    const [success, setSuccess] = useState(false)
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

    // If user is already logged in, redirect to landing page
    useEffect(() => {
        if (user) {
            navigate("/landing")
        }
    }, [user, navigate])

    useEffect(() => {
        let redirectTimer
        if (success) {
            redirectTimer = setTimeout(() => {
                navigate("/login")
            }, 2000) // 2-second delay before redirecting
        }
        return () => clearTimeout(redirectTimer)
    }, [success, navigate])

    const validatePassword = (password) => {
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)

        return hasUppercase && hasLowercase && hasNumber
    }

    const isUsernameTaken = (username) => {
        return MOCK_USERS.some((user) =>
            user.username.toLowerCase() === username.toLowerCase())
    }

    // Handle cancel confirmation
    const handleCancelClick = () => {
        setShowCancelConfirmation(true)
    }

    // Handle confirmation result
    const handleConfirmCancel = () => {
        // Clear all inputs
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        setErrors({
            username: "",
            password: "",
            confirmPassword: "",
        })
        setShowCancelConfirmation(false)
    }

    const handleCancelConfirmation = () => {
        setShowCancelConfirmation(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        setErrors({
            username: "",
            password: "",
            confirmPassword: "",
        })

        let hasErrors = false
        const newErrors = {
            username: "",
            password: "",
            confirmPassword: "",
        }

        if (isUsernameTaken(username)) {
            newErrors.username = "Username is already taken"
            hasErrors = true
        }

        if (!validatePassword(password)) {
            newErrors.password = "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
            hasErrors = true
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
            hasErrors = true
        }

        if (hasErrors) {
            setErrors(newErrors)
            return
        }

        setSuccess(true)
    }

    return (
        <div className="auth-container">
            {success && <SuccessModal onClose={() => setSuccess(false)} />}
            {showCancelConfirmation && <CancelModal onConfirm={handleConfirmCancel} onCancel={handleCancelConfirmation} />}
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
                        <input id="username"
                               type="text"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               className={errors.username ? "input-error" : ""}
                               required
                        />
                        {errors.username && <div className="error-message">{errors.username}</div>}
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
                            className={errors.password ? "input-error" : ""}
                            required
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
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
                            className={errors.confirmPassword ? "input-error" : ""}
                            required
                        />
                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>

                    <div className="button-group">
                        <button type="button" className="cancel-button" onClick={handleCancelClick} disabled={success}>
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