import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { createContext, useContext, useState } from "react"
import "./styles/App.css"

// Import page components
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignUpPage"
import LandingPage from "./pages/LandingPage"

// Create auth context
export const AuthContext = createContext(null)

export function useAuth() {
    return useContext(AuthContext)
}

// Protected Route component
function ProtectedRoute({ children }) {
    const { user } = useAuth()
    const location = useLocation()

    if (!user) {
        // Redirect to login page but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Main App component with routes
function App() {
    const [user, setUser] = useState(null)

    // Auth context value with login and logout functions
    const authValue = {
        user,
        login: (userData) => {
            setUser(userData)
        },
        logout: () => {
            setUser(null)
        },
    }

    return (
        <AuthContext.Provider value={authValue}>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Protected Routes */}
                    <Route
                        path="/landing"
                        element={
                            <ProtectedRoute>
                                <LandingPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all route - redirect to log-in */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </AuthContext.Provider>
    )
}

export default App