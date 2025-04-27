import React, {useCallback, useEffect} from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { createContext, useContext, useState } from "react"
import "./styles/Auth.css"
import "./styles/LandingPage.css"
import "./styles/NavBar.css"
import "./styles/Favorites.css"
import "./styles/Footer.css"
import "./styles/WordCloud.css"

// Import page components
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignUpPage"
import LandingPage from "./pages/LandingPage"
import FavsCloudPage from "./pages/FavsCloudPage"
import SearchPage from "./pages/SearchPage"
import Wordcloud from "./components/WordCloudContent";

// Create auth context
export const AuthContext = createContext(null)

export function useAuth() {
    return useContext(AuthContext)
}

// Protected Route component
export function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    // If still loading, show a loading indicator or nothing
    if (isLoading) {
        return <div className="loading">Loading...</div>
    }

    if (!user) {
        // Redirect to login page but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Main App component with routes
function App() {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [lastActivity, setLastActivity] = useState(Date.now())
    const inactivityTimeout = 60000; // 60 seconds in milliseconds

    // Load user from localStorage on initial render
    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser)
                } catch (error) {
                    console.error('Failed to parse stored user:', error)
                    localStorage.removeItem('user')
                }
            }
            setIsLoading(false) // Mark loading as complete
        }

        loadUser()
    }, [])

    // Function to handle user activity
    const handleUserActivity = useCallback(() => {
        setLastActivity(Date.now())
    }, [])

    // Set up event listeners for user activity
    useEffect(() => {
        if (user) {
            // Track user activity
            window.addEventListener('mousemove', handleUserActivity)
            window.addEventListener('keydown', handleUserActivity)
            window.addEventListener('click', handleUserActivity)
            window.addEventListener('scroll', handleUserActivity)

            // Check for inactivity
            const intervalId = setInterval(() => {
                const currentTime = Date.now()
                if (currentTime - lastActivity > inactivityTimeout) {
                    // Log out user due to inactivity
                    console.log('Logging out due to inactivity')
                    localStorage.removeItem('user')
                    setUser(null)
                }
            }, 100000) // Check every 10 seconds //this is annoying im making it 100 for now

            return () => {
                // Clean up event listeners and interval
                window.removeEventListener('mousemove', handleUserActivity)
                window.removeEventListener('keydown', handleUserActivity)
                window.removeEventListener('click', handleUserActivity)
                window.removeEventListener('scroll', handleUserActivity)
                clearInterval(intervalId)
            }
        }
    }, [user, lastActivity, handleUserActivity, inactivityTimeout])

    // Auth context value with login and logout functions
    const authValue = {
        user,
        isLoading,
        login: (userData) => {
            // Save user to state and localStorage
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            setLastActivity(Date.now())
        },
        logout: () => {
            // Clear user from state and localStorage
            setUser(null)
            localStorage.removeItem('user')
        },
    }

    // If still loading, show a minimal loading indicator
    if (isLoading) {
        return <div className="app-loading">Loading...</div>
    }

    return (


        <AuthContext.Provider value={authValue}>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={
                            user
                                ? <Navigate to="/landing" replace />
                                : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            user
                                ? <Navigate to="/landing" replace />
                                : <LoginPage />
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            user
                                ? <Navigate to="/landing" replace />
                                : <SignupPage />
                        }
                    />

                    <Route
                        path="/compare"
                        element={
                            <LandingPage />
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/landing"
                        element={
                            <ProtectedRoute>
                                <LandingPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Word Cloud Page */}
                    <Route
                        path="/favscloud"
                        element={
                            <ProtectedRoute>
                                <FavsCloudPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Search Page */}
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <SearchPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/wordcloud"
                        element={
                            <ProtectedRoute>
                                <Wordcloud />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all route - redirect to landing if logged in, otherwise login */}
                    <Route
                        path="*"
                        element={
                            user
                                ? <Navigate to="/landing" replace />
                                : <Navigate to="/login" replace />
                        }
                    />
                </Routes>
            </div>
        </AuthContext.Provider>
    )
}

export default App