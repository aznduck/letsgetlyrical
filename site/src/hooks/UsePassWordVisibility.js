import { useState } from "react"

export function usePasswordVisibility(initialState = false) {
    const [showPassword, setShowPassword] = useState(initialState)

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

    return {
        showPassword,
        togglePasswordVisibility,
        inputType: showPassword ? "text" : "password",
    }
}