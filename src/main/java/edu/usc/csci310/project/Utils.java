package edu.usc.csci310.project;

public class Utils {
    public static boolean isValidUsername(String username) {
        return username != null && username.matches("^[a-zA-Z0-9 _-]+$");
    }

    public static boolean isValidPassword(String username) {
        return username != null && username.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*");
    }
}
