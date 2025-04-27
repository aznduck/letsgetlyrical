import { render, screen, fireEvent, act } from "@testing-library/react"
import WordCloudHeader from "./WordCloudHeader"

describe("WordCloudHeader Component", () => {
    const mockOnTypeChange = jest.fn()
    const mockOnAddFavorites = jest.fn()
    const mockOnGenerateFavorites = jest.fn()
    const mockOnCompareWithFriends = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("renders with default props", () => {
        render(<WordCloudHeader />)

        // Check for default title
        expect(screen.getByText("Your Word Cloud")).toBeInTheDocument()

        // Check for edit button
        expect(screen.getByLabelText("Edit word cloud type")).toBeInTheDocument()
    })

    test("shows type selector when edit button is clicked", () => {
        render(<WordCloudHeader onTypeChange={mockOnTypeChange} />)

        // Click edit button
        const editButton = screen.getByLabelText("Edit word cloud type")
        fireEvent.click(editButton)

        // Check that type selector is shown
        expect(screen.getByText("Cloud")).toBeInTheDocument()
        expect(screen.getByText("Table")).toBeInTheDocument()
    })

    test("calls onTypeChange when a type is selected", () => {
        render(<WordCloudHeader onTypeChange={mockOnTypeChange} />)

        // Click edit button to show type selector
        const editButton = screen.getByLabelText("Edit word cloud type")
        fireEvent.click(editButton)

        // Click table option
        const tableOption = screen.getByText("Table")
        fireEvent.click(tableOption)

        // Check that onTypeChange was called with 'table'
        expect(mockOnTypeChange).toHaveBeenCalledWith("table")

        // Check that type selector is hidden
        expect(screen.queryByText("Cloud")).not.toBeInTheDocument()
    })

    test("closes type selector when clicking outside", () => {
        render(<WordCloudHeader onTypeChange={mockOnTypeChange} />)

        // Click edit button to show type selector
        const editButton = screen.getByLabelText("Edit word cloud type")
        fireEvent.click(editButton)

        // Check that type selector is shown
        expect(screen.getByText("Cloud")).toBeInTheDocument()

        // Click outside
        act(() => {
            const event = new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
            })
            document.dispatchEvent(event)
        })

        // Check that type selector is hidden
        expect(screen.queryByText("Cloud")).not.toBeInTheDocument()
    })

    test("renders add favorites button in default variant", () => {
        render(<WordCloudHeader variant="default" onAddFavorites={mockOnAddFavorites} />)

        // Check for add favorites button
        const addButton = screen.getByText("Add your favorites list")
        expect(addButton).toBeInTheDocument()

        // Click button
        fireEvent.click(addButton)

        // Check that onAddFavorites was called
        expect(mockOnAddFavorites).toHaveBeenCalled()
    })

    test("renders generate favorites and compare buttons in favorites variant", () => {
        render(
            <WordCloudHeader
                variant="favorites"
                onGenerateFavorites={mockOnGenerateFavorites}
                onCompareWithFriends={mockOnCompareWithFriends}
            />,
        )

        // Check for generate favorites button
        const generateButton = screen.getByText("Generate favorites cloud")
        expect(generateButton).toBeInTheDocument()

        // Check for compare with friends button
        const compareButton = screen.getByText("Compare with friends!")
        expect(compareButton).toBeInTheDocument()

        // Click generate button
        fireEvent.click(generateButton)

        // Check that onGenerateFavorites was called
        expect(mockOnGenerateFavorites).toHaveBeenCalled()

        // Click compare button
        fireEvent.click(compareButton)

        // Check that onCompareWithFriends was called
        expect(mockOnCompareWithFriends).toHaveBeenCalled()
    })

    test("disables generate button when cloud is already generated", () => {
        render(
            <WordCloudHeader variant="favorites" isCloudGenerated={true} onGenerateFavorites={mockOnGenerateFavorites} />,
        )

        // Check that generate button is disabled
        const generateButton = screen.getByText("Generate favorites cloud")
        expect(generateButton).toBeDisabled()

        // Click generate button
        fireEvent.click(generateButton)

        // Check that onGenerateFavorites was not called
        expect(mockOnGenerateFavorites).not.toHaveBeenCalled()
    })

    test("updates title based on selected type", () => {
        const { rerender } = render(<WordCloudHeader variant="favorites" selectedType="cloud" />)

        // Check for favorites cloud title
        expect(screen.getByText("Your Favorites Word Cloud")).toBeInTheDocument()

        // Update to table type
        rerender(<WordCloudHeader variant="favorites" selectedType="table" />)

        // Check for favorites table title
        expect(screen.getByText("Your Favorites Word Table")).toBeInTheDocument()

        rerender(<WordCloudHeader variant="default" selectedType="table" />)

        expect(screen.getByText("Your Word Table")).toBeInTheDocument()
    })


    describe("WordCloudHeader", () => {
        test("calls onTypeChange with 'cloud' when Cloud option is clicked", () => {
            const onTypeChangeMock = jest.fn();

            render(
                <WordCloudHeader
                    variant="favorites"
                    selectedType="table"
                    onTypeChange={onTypeChangeMock}
                />
            );

            const editButton = screen.getByLabelText("Edit word cloud type");
            fireEvent.click(editButton);

            const cloudButton = screen.getByText(/Cloud/);
            fireEvent.click(cloudButton);

            expect(onTypeChangeMock).toHaveBeenCalledWith("cloud");
        });
    });

})