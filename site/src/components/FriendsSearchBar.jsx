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
        <div style={{position: 'relative', maxWidth: '400px', margin: '0 auto'}}>
            <input
                type="text"
                placeholder="Enter a username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    color: '#000', // black text
                    backgroundColor: '#fff', // optional: white background
                    padding: '8px',
                    width: '100%',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                }}
            />
            {isLoading ? (
                <p>Loading users...</p>
            ) : query && filteredUsers.length > 0 ? (
                <ul>
                    {filteredUsers.map((user) => (
                        <li key={user.id} onClick={() => onSelectFriend(user)}>
                            {user.username}
                        </li>
                    ))}
                </ul>
            ) : query && filteredUsers.length === 0 ? (
                <p>No users found</p>
            ) : null}
        </div>
    );
};

export default FriendSearchBar;
