import React, { useState, useEffect } from "react";
import axios from "axios";

const FriendSearchBar = ({ onSelectFriend }) => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/api/users");
                const userData = response.data;
                setUsers(userData);
                setFilteredUsers(userData);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (query === "") {
            setFilteredUsers([]);
        } else {
            const matches = users.filter((user) =>
                user.username?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredUsers(matches);
        }
    }, [query, users]);


    return (
        <div style={{ position: "relative", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for friends..."
                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "16px",
                }}
            />

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "10px" }}>Loading users...</div>
            ) : (
                filteredUsers.length > 0 && (
                    <ul
                        style={{
                            position: "absolute",
                            top: "40px",
                            left: 0,
                            right: 0,
                            backgroundColor: "#2c2c2c",
                            border: "1px solid #444",
                            borderRadius: "8px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 10,
                            listStyle: "none",
                            padding: "5px 0",
                            margin: 0,
                        }}
                    >
                        {filteredUsers.map((user) => (
                            <li
                                key={user.id}
                                onClick={() => onSelectFriend(user)}
                                style={{
                                    padding: "10px",
                                    cursor: "pointer",
                                    color: "white",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3e3e3e")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                {user.username || "(no username)"}
                            </li>
                        ))}
                    </ul>
                )
            )}

            {!isLoading && filteredUsers.length === 0 && (
                <div style={{
                    position: "absolute",
                    top: "40px",
                    left: 0,
                    right: 0,
                    backgroundColor: "#2c2c2c",
                    color: "white",
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center"
                }}>
                    No users found
                </div>
            )}
        </div>
    );
};

export default FriendSearchBar;