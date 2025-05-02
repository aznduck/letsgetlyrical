import React, { useState, useEffect } from 'react';
import "../styles/ComparePage.css"
import { Search } from "lucide-react"


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
        <div className="friends-search-form" role="search">
            <div className="friends-search-input-container">
                <label htmlFor="friend-search" className="sr-only">
                    Enter a username to compare with
                </label>
                <Search size={18} className="friends-search-icon" aria-hidden="true"/>
                <input
                    id="friend-search"
                    type="text"
                    placeholder="Enter a username"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="friends-search-input"
                    aria-describedby="search-description"
                />
                <div id="search-description" className="sr-only">
                    Type a username and press Enter to add to your comparison list
                </div>
            </div>

            {isLoading ? (
                <p style={{marginTop: '8px', fontSize: '14px', textAlign: 'center'}}>Loading users...</p>
            ) : query && filteredUsers.length > 0 ? (
                <ul
                    style={{
                        listStyle: 'none',
                        padding: 0,
                        marginTop: '6px',
                        borderRadius: '8px',
                        backgroundColor: '#2d3a54',
                        color: '#fff',
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
                                e.currentTarget.style.backgroundColor = '#435272';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#2d3a54';
                            }}
                        >

                            {user.username}
                        </li>
                    ))}
                </ul>
            ) : query && filteredUsers.length === 0 ? (
                <p style={{marginTop: '8px', fontSize: '14px', textAlign: 'center'}}>No users found</p>
            ) : null}
        </div>
    );
};

export default FriendSearchBar;
