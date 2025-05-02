const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { act } = require('react-dom/test-utils');
const FriendSearchBar = require('./FriendsSearchBar').default;

describe('FriendSearchBar Component', () => {
    const mockUsers = [
        { id: 1, username: 'testuser1' },
        { id: 2, username: 'aznduck' },
        { id: 3, username: 'testuser' },
    ];

    const mockOnSelectFriend = jest.fn();

    beforeEach(() => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockUsers)
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('renders the search input', async () => {
        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });
        expect(screen.getByPlaceholderText('Enter a username')).toBeInTheDocument();
    });

    test('displays loading state while fetching users', async () => {
        global.fetch.mockImplementationOnce(() =>
            new Promise(resolve => setTimeout(() => {
                resolve({
                    json: () => Promise.resolve(mockUsers)
                });
            }, 100))
        );

        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        expect(screen.getByText('Loading users...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
        });
    });

    test('fetches users on mount', async () => {
        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/users');
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    test('shows no dropdown when search input is empty', async () => {
        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        expect(screen.queryByText('testuser1')).not.toBeInTheDocument();
        expect(screen.queryByText('aznduck')).not.toBeInTheDocument();
        expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    test('filters users based on search query', async () => {
        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        const searchInput = screen.getByPlaceholderText('Enter a username');
        fireEvent.change(searchInput, { target: { value: 'test' } });

        await waitFor(() => {
            expect(screen.getByText('testuser1')).toBeInTheDocument();
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.queryByText('aznduck')).not.toBeInTheDocument();
        });
    });

    test('shows "No users found" message when no matches', async () => {
        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        const searchInput = screen.getByPlaceholderText('Enter a username');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        await waitFor(() => {
            expect(screen.getByText('No users found')).toBeInTheDocument();
        });
    });

    test('calls onSelectFriend when a user is clicked', async () => {
        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        const searchInput = screen.getByPlaceholderText('Enter a username');
        fireEvent.change(searchInput, { target: { value: 'test' } });

        await waitFor(() => {
            fireEvent.click(screen.getByText('testuser1'));
        });

        expect(mockOnSelectFriend).toHaveBeenCalledWith(mockUsers[0]);
    });

    test('handles API error gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('API error'));

        await act(async () => {
            render(<FriendSearchBar onSelectFriend={mockOnSelectFriend} />);
        });

        expect(global.fetch).toHaveBeenCalled();
        expect(screen.getByPlaceholderText('Enter a username')).toBeInTheDocument();
    });
});
