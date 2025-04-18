import { Eye, EyeOff } from "lucide-react"
import { usePasswordVisibility } from "../hooks/UsePassWordVisibility"

export const PasswordInput = ({ id, label, value, onChange, error, required = true, className = "" }) => {
    const { showPassword, togglePasswordVisibility, inputType } = usePasswordVisibility()

    return (
        <div className="form-group">
            <div className="password-label">
                <label htmlFor={id}>{label}</label>
                <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />} Hide
                </button>
            </div>
            <input
                id={id}
                type={inputType}
                value={value}
                onChange={onChange}
                className={error ? `input-error ${className}` : className}
                required={required}
            />
            {error && <div className="error-message">{error}</div>}
        </div>
    )
}