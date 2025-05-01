import React, { useState, useEffect } from 'react';

const FriendSearchBar = ({ onSelectFriend }) => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                const userData = await response.json();
                setUsers(userData);
                setFilteredUsers(userData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        if (query === '') {
            setFilteredUsers(users);
        } else {
            const matches = users.filter((user) =>
                user.username?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredUsers(matches);
        }
    }, [query, users]);

    return (
        <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
            <input
                id="friend-search"
                type="text"
                placeholder="Search for friends..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-controls="search-results"
                aria-autocomplete="list"
            />
            {isLoading ? (
                <p role="status" aria-live="polite">Loading users...</p>
            ) : query && filteredUsers.length > 0 ? (
                <ul id="search-results" role="listbox" aria-label="Search results" className="search-results">
                    {filteredUsers.map((user) => (
                        <li key={user.id}
                            id={`user-${user.id}`}
                            role="option"
                            onClick={() => onSelectFriend(user)}
                            tabIndex={-1}>
                            {user.username}
                        </li>
                    ))}
                </ul>
            ) : query && filteredUsers.length === 0 ? (
                <p role="status" aria-live="polite">No users found</p>
            ) : null}
        </div>
    );
};

export default FriendSearchBar;
