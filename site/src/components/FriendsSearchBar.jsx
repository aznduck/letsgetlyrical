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
                placeholder="Enter a username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    color: '#222',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                }}
            />
            {isLoading ? (
                <p style={{ marginTop: '8px', fontSize: '14px', textAlign: 'center' }}>Loading users...</p>
            ) : query && filteredUsers.length > 0 ? (
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        marginTop: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        backgroundColor: '#000', // black dropdown
                        color: '#fff',            // white text
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                        maxHeight: '180px',
                        overflowY: 'auto',
                    }}
                >
                    {filteredUsers.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => onSelectFriend(user)}
                            style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                color: '#fff',
                                transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#000';
                            }}
                        >

                            {user.username}
                        </li>
                    ))}
                </ul>
            ) : query && filteredUsers.length === 0 ? (
                <p style={{ marginTop: '8px', fontSize: '14px', textAlign: 'center' }}>No users found</p>
            ) : null}
        </div>
    );
};

export default FriendSearchBar;
