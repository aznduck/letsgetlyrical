package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.requests.FavoriteGetRequest;
import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
import edu.usc.csci310.project.requests.FavoriteSongRequest;
import edu.usc.csci310.project.requests.LoginUserRequest;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import static edu.usc.csci310.project.Utils.hashUsername;

//const response = await fetch('/api/register', {
//    method:'POST',
//            headers: {
//        'Content-Type': 'application/json',
//    },
//    body: JSON.stringify({
//            username: username,
//            password: password
//            songName: data[i]["title"]
//            songArtist: data[i]["primary_artist"]["name"]
//            fullTitle: data[i]["fullTitle"]
//            dateReleased: data["release_date_for_display"]
//            songId: data[i]["id"]"
//            lyrics: string...
//                }),
//})

@Service
public class FavoriteService {
    private final Connection connection;

    public FavoriteService(Connection connection) { this.connection = connection; }

//  Adds a song to the Songs table, with an entry in the Favorites table
//  Songs: id, songId, songName, songArtist, fullTitle, dateReleased,
//  Favorites: id, userId, songId
    public int addFavoriteSong(FavoriteSongRequest request) throws RuntimeException {
        int result = -1;

        int userId = getUserId(request.getUsername());
        if(userId == -1) {
            return result;
        }

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        try(PreparedStatement pst = connection.prepareStatement(insertSongsSQL)) {
            int songId = request.getSongId();
            if(isSongAdded(songId)) {
                result = 0; // represents song is already in DB
            }
            else {
                pst.setInt(1, songId);
                pst.setString(2, request.getSongName());
                pst.setString(3, request.getSongArtist());
                pst.setString(4, request.getFullTitle());
                pst.setString(5, request.getDateReleased());
                pst.setString(6, request.getLyrics());

                int rowsAffected = pst.executeUpdate();

                if (rowsAffected > 0) {
                    try (Statement statement = connection.createStatement();
                         ResultSet rs = statement.executeQuery("SELECT last_insert_rowid()")) {
                        if (rs.next()) {
                            result = rs.getInt(1); // Return the generated ID
                        } else {
                            throw new SQLException("Failed to retrieve the generated ID in songs.");
                        }
                    }
                } else {
                    throw new SQLException("No rows in Songs affected during the insert.");
                }
            }
        }
        catch(SQLException e) {
            throw new RuntimeException(e);
        }

        String insertFavoritesSQL = "INSERT INTO favorites (userId, songId) VALUES (?, ?)";
        try(PreparedStatement pst = connection.prepareStatement(insertFavoritesSQL)) {
            pst.setInt(1, userId);
            pst.setInt(2, request.getSongId());

            int rowsAffected = pst.executeUpdate();
            if(rowsAffected > 0) {
                try (Statement statement = connection.createStatement();
                     ResultSet rs = statement.executeQuery("SELECT last_insert_rowid()")) {
                    if(!rs.next()) {
                        throw new SQLException("Failed to retrieve the generated ID in favorites.");
                    }
                }
            }
            else {
                throw new SQLException("No rows in Favorites affected during the insert.");
            }
        }
        catch(SQLException e) {
            throw new RuntimeException(e);
        }

        return result;
    }

//  Removes a favorited song using its songId
    public int removeFavoriteSong(FavoriteRemoveRequest request) throws RuntimeException {
        int result = -1;
        int userId = getUserId(request.getUsername());
        if(userId == -1) {
            throw new RuntimeException("User does not exist.");
        }

        String sql = "DELETE FROM favorites WHERE userId = ? and songId = ?";
        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setInt(1, userId);
            pst.setInt(2, request.getSongId());
            int rowsAffected = pst.executeUpdate();
            if(rowsAffected == 0) {
                throw new SQLException("Failed to delete the entry from Favorites.");
            }
            else result = rowsAffected;
        }
        catch(SQLException e) {
            throw new RuntimeException(e);
        }

        return result;
    }

//  Get all favorite songs of a user
    public List<Integer> getFavoriteSongs(FavoriteGetRequest request) throws RuntimeException {
        List<Integer> result = new ArrayList<>();
        int userId = getUserId(request.getUsername());
        if(userId == -1) {
            throw new RuntimeException("User does not exist.");
        }

        String sql = "SELECT songId FROM favorites WHERE userId = ?";

        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setInt(1, userId);
            ResultSet rs = pst.executeQuery();
            while(rs.next()) {
                result.add(rs.getInt(1));
            }
        }
        catch(SQLException e) {
            throw new RuntimeException(e);
        }

        return result;
    }

//  Helper function for seeing if a song already exists in the SQL database
    public boolean isSongAdded(int songId) throws SQLException {
        String sql = "SELECT * FROM songs WHERE songId = ?";

        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setInt(1, songId);
            ResultSet rs = pst.executeQuery();
            return rs.next();
        }
        catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

//  Helper function for retrieving the userId by giving an argument of a username
    public int getUserId(String username) {
        String hashedUsername = Utils.hashUsername(username);
        String sql = "SELECT id FROM users WHERE username = ?";

        int result = -1;

        try (PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setString(1, hashedUsername);
            ResultSet rs = pst.executeQuery();

            if (rs.next()) {
                result = rs.getInt("id");
            }
            return result;
        }
        catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
