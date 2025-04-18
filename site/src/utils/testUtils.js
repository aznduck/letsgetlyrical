
/** This file is for utility functions that are used in multiple test files **/
import { fireEvent, screen } from '@testing-library/react'

/**
 * Utility function to test the logout button click. This function can be reused in multiple test files
 * Refactored from Search and FavClouds page to be more generic and reusable #63
 * @param renderComponent A function that renders the component to be tested
 * @param mockLogout A mock function for the logout function
 * @param mockNavigate A mock function for the navigate function
 */
export const testLogoutButtonClick = (renderComponent, mockLogout, mockNavigate) => {
    renderComponent()

    // Click logout button
    fireEvent.click(screen.getByTestId("logout-button"))

    // Check that logout was called
    expect(mockLogout).toHaveBeenCalled()

    // Check that navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/login")
}