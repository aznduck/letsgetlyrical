import { Eye, EyeOff } from "lucide-react"
import { usePasswordVisibility } from "../hooks/UsePassWordVisibility"

export const PasswordInput = ({ id, label, value, onChange, error, required = true, className = "" }) => {
    const { showPassword, togglePasswordVisibility, inputType } = usePasswordVisibility()
    const errorId = error ? `${id}-error` : undefined

    return (
        <div className="form-group">
            <div className="password-label">
                <label htmlFor={id}>{label}</label>
                <button type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide" : "Show"}
                        aria-pressed={showPassword}
                >
                    {showPassword ? <EyeOff size={16} aria-hidden="true"/>
                        : <Eye size={16} aria-hidden="true"/>} Hide
                    <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                </button>
            </div>
            <input
                id={id}
                type={inputType}
                value={value}
                onChange={onChange}
                className={error ? `input-error ${className}` : className}
                required={required}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={errorId}
                aria-required={required}
            />
            {error && <div className="error-message" id={errorId} role="alert">{error}</div>}
        </div>
    )
}