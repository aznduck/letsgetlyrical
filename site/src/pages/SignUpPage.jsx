import React, {useRef} from 'react';
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

import {AuthLayout} from "../components/AuthLayout";
import {PasswordInput} from "../components/PasswordInput";
import {SuccessModal, CancelModal} from "../components/AuthModals";
import "../styles/Auth.css"

const SignUpPage = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const navigate = useNavigate()
    const [errors, setErrors] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        general: "" // Added general error field for API errors
    })
    const [success, setSuccess] = useState(false)
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

    const formRef = useRef(null)
    const usernameRef = useRef(null)
    const generalErrorRef = useRef(null)

    useEffect(() => {
        if (usernameRef.current) {
            usernameRef.current.focus()
        }
    }, [])

    useEffect(() => {
        if (errors.general && generalErrorRef.current) {
            generalErrorRef.current.focus()
        }
    }, [errors.general])

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
            general: ""
        })
        setShowCancelConfirmation(false)

        if (usernameRef.current) {
            usernameRef.current.focus()
        }
    }

    const handleCancelConfirmation = () => {
        setShowCancelConfirmation(false)

        const cancelButton = document.querySelector(".cancel-button")
        if (cancelButton) {
            cancelButton.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setErrors({
            username: "",
            password: "",
            confirmPassword: "",
            general: ""
        })

        let hasErrors = false
        const newErrors = {
            username: "",
            password: "",
            confirmPassword: "",
            general: ""
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

        try {
            const response = await fetch('/api/register', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            })

            if(response.ok) {
                setSuccess(true)
                // The navigation to login happens in the useEffect after success is set to true
            } else {
                const errorData = await response.json()
                setErrors({
                    ...newErrors,
                    general: errorData.message || 'Registration failed. Please try again.'
                })
            }

        } catch(error) {
            console.error('Error during registration:', error)
            setErrors({
                ...newErrors,
                general: "Registration failed. Please try again."
            })
        }
    }

    return (
        <AuthLayout>
            {success && <SuccessModal />}
            {showCancelConfirmation && <CancelModal onConfirm={handleConfirmCancel} onCancel={handleCancelConfirmation} />}

            <div className="sign-up-container">
                <form onSubmit={handleSubmit}
                      className="sign-up-form"
                      aria-labelledby="signup-heading"
                      noValidate>
                    <h1 id="signup-heading">Create an account</h1>

                    <div className="sign-up-subtitle">
                        Already have an account? <Link to="/login"
                                                       aria-label="Log in to your existing account">Log in</Link>
                    </div>

                    {/* Display general error if present */}
                    {errors.general && (
                        <div className="error-message general-error"
                             role="alert"
                             aria-live="assertive"
                             ref={generalErrorRef}
                             tabIndex={-1}>
                            {errors.general}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input id="username"
                               type="text"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               className={errors.username ? "input-error" : ""}
                               aria-required="true"
                               aria-invalid={errors.username ? "true" : "false"}
                               aria-describedby={errors.username ? "username-error" : undefined}
                               required
                        />
                        {errors.username && <div className="error-message"
                                                 id="username-error" role="alert">{errors.username}</div>}
                    </div>

                    <PasswordInput
                        id="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        aria-describedby={!errors.password ? "password-requirements" : undefined}
                    />
                    {!errors.password && <div className="password-req" id="password-requirements">Must use 1 uppercase, 1 lowercase, and 1 number</div>}

                    <PasswordInput
                        id="confirmpassword"
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                    />

                    <div className="button-group">
                        <button type="button"
                                className="cancel-button"
                                onClick={handleCancelClick}
                                disabled={success}
                                aria-label="Cancel account creation">
                            Cancel
                        </button>
                        <button type="submit"
                                className="submit-button"
                                aria-label="create an account">
                            Create an account
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    )
}

export default SignUpPage