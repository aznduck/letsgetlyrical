import { renderHook, act } from "@testing-library/react"
import { usePasswordVisibility } from "./UsePassWordVisibility.js"

describe("usePasswordVisibility Hook", () => {
    test("should initialize with showPassword as false by default", () => {
        const { result } = renderHook(() => usePasswordVisibility())

        expect(result.current.showPassword).toBe(false)
        expect(result.current.inputType).toBe("password")
    })

    test("should initialize with custom initial state when provided", () => {
        const { result } = renderHook(() => usePasswordVisibility(true))

        expect(result.current.showPassword).toBe(true)
        expect(result.current.inputType).toBe("text")
    })

    test("should toggle showPassword from false to true", () => {
        const { result } = renderHook(() => usePasswordVisibility())

        // Initial state
        expect(result.current.showPassword).toBe(false)
        expect(result.current.inputType).toBe("password")

        // Toggle state
        act(() => {
            result.current.togglePasswordVisibility()
        })

        // State after toggle
        expect(result.current.showPassword).toBe(true)
        expect(result.current.inputType).toBe("text")
    })

    test("should toggle showPassword from true to false", () => {
        const { result } = renderHook(() => usePasswordVisibility(true))

        // Initial state
        expect(result.current.showPassword).toBe(true)
        expect(result.current.inputType).toBe("text")

        // Toggle state
        act(() => {
            result.current.togglePasswordVisibility()
        })

        // State after toggle
        expect(result.current.showPassword).toBe(false)
        expect(result.current.inputType).toBe("password")
    })

    test("should toggle showPassword multiple times", () => {
        const { result } = renderHook(() => usePasswordVisibility())

        // Initial state
        expect(result.current.showPassword).toBe(false)

        // First toggle
        act(() => {
            result.current.togglePasswordVisibility()
        })
        expect(result.current.showPassword).toBe(true)
        expect(result.current.inputType).toBe("text")

        // Second toggle
        act(() => {
            result.current.togglePasswordVisibility()
        })
        expect(result.current.showPassword).toBe(false)
        expect(result.current.inputType).toBe("password")

        // Third toggle
        act(() => {
            result.current.togglePasswordVisibility()
        })
        expect(result.current.showPassword).toBe(true)
        expect(result.current.inputType).toBe("text")
    })
})
