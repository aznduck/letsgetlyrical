package edu.usc.csci310.project.exception;

public class UsernameNotAvailableException extends RuntimeException {
    public UsernameNotAvailableException(String message) {
        super(message);
    }
}
