package edu.usc.csci310.project.responses;

public class UserResponse {
    private int id;
    private String username;
    private String password;

    public UserResponse(int id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    public int getId() {
        return id;
    }

    public String getPassword() {
        return password;
    }

    public String getUsername() {
        return username;
    }
}
