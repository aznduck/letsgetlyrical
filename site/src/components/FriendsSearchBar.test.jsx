const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const FriendSearchBar = require('./FriendsSearchBar').default; // Adjust path as needed

jest.mock('axios', () => ({
    get: jest.fn()
}));
const axios = require('axios');

describe('FriendSearchBar Component', () => {
    const mockUsers = [
        { id: 1, username: 'testuser1' },
        { id: 2, username: 'aznduck' },
        { id: 3, username: 'testuser' },
    ];

    const mockOnSelectFriend = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        axios.get.mockResolvedValue({ data: mockUsers });
    });

    test('renders the search input', () => {
        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        expect(screen.getByPlaceholderText('Search for friends...')).toBeInTheDocument();
    });

    test('displays loading state while fetching users', async () => {
        axios.get.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => {
            resolve({ data: mockUsers });
        }, 100)));

        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        expect(screen.getByText('Loading users...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
        });
    });

    test('fetches users on mount', async () => {
        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        expect(axios.get).toHaveBeenCalledWith('/api/users');

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    test('shows no dropdown when search input is empty', async () => {
        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        expect(screen.queryByText('testuser1')).not.toBeInTheDocument();
        expect(screen.queryByText('aznduck')).not.toBeInTheDocument();
        expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    test('filters users based on search query', async () => {
        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        const searchInput = screen.getByPlaceholderText('Search for friends...');

        fireEvent.change(searchInput, { target: { value: 'test' } });

        await waitFor(() => {
            expect(screen.getByText('testuser1')).toBeInTheDocument();
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.queryByText('aznduck')).not.toBeInTheDocument();
        });

        fireEvent.change(searchInput, { target: { value: '' } });

        await waitFor(() => {
            expect(screen.queryByText('testuser1')).not.toBeInTheDocument();
            expect(screen.queryByText('testuser')).not.toBeInTheDocument();
            expect(screen.queryByText('aznduck')).not.toBeInTheDocument();
        });
    });

    test('shows "No users found" message when no matches', async () => {
        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        const searchInput = screen.getByPlaceholderText('Search for friends...');

        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        await waitFor(() => {
            expect(screen.getByText('No users found')).toBeInTheDocument();
        });
    });

    test('calls onSelectFriend when a user is clicked', async () => {
        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        const searchInput = screen.getByPlaceholderText('Search for friends...');

        fireEvent.change(searchInput, { target: { value: 'test' } });

        await waitFor(() => {
            fireEvent.click(screen.getByText('testuser1'));
        });

        expect(mockOnSelectFriend).toHaveBeenCalledWith(mockUsers[0]);
    });

    test('handles API error gracefully', async () => {
        // Mock API failure
        axios.get.mockRejectedValueOnce(new Error('API error'));

        render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        const searchInput = screen.getByPlaceholderText('Search for friends...');
        expect(searchInput).toBeInTheDocument();
    });
});