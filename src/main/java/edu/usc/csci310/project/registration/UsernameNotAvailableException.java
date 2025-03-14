package edu.usc.csci310.project.registration;

public class UsernameNotAvailableException extends RuntimeException {
    public UsernameNotAvailableException(String message) {
        super(message);
    }
}
