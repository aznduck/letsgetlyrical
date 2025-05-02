package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.models.FavoriteSong;
import edu.usc.csci310.project.models.MatchResult;
import edu.usc.csci310.project.requests.FavoriteGetRequest;
import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
import edu.usc.csci310.project.requests.FavoriteSongRequest;
import edu.usc.csci310.project.requests.LoginUserRequest;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

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

    private static final HashMap<Integer, MatchResult > matchCache = new HashMap<>();

    public FavoriteService(Connection connection) { this.connection = connection; }

//  Adds a song to the Songs table, with an entry in the Favorites table
//  Songs: id, songId, songName, songArtist, fullTitle, dateReleased,
//  Favorites: id, userId, songId
    public int addFavoriteSong(FavoriteSongRequest request) {
        int result = -1;

        int userId = getUserId(request.getUsername());
        int songId = request.getSongId();
        if(userId == -1) {
            return result;
        }
        try {
            if(isSongFavorited(songId, userId)) {
                return -2; // represents song is already favorited
            }
        }
        catch(SQLException e) {
            throw new RuntimeException(e);
        }

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, album, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try(PreparedStatement pst = connection.prepareStatement(insertSongsSQL)) {
            if(isSongAdded(songId)) {
                result = 0; // represents song is already in DB
            }
            else {
                pst.setInt(1, songId);
                pst.setString(2, request.getSongName());
                pst.setString(3, request.getSongArtist());
                pst.setString(4, request.getFullTitle());
                pst.setString(5, request.getDateReleased());
                pst.setString(6, request.getAlbum());
                pst.setString(7, request.getLyrics());

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
public List<FavoriteSong> getFavoriteSongs(FavoriteGetRequest request) {
    List<FavoriteSong> result = new ArrayList<>();
    int userId = getUserId(request.getUsername());
    if (userId == -1) {
        throw new RuntimeException("User does not exist.");
    }

    String sql = """
        SELECT f.id, s.songName, s.songArtist, s.album
        FROM favorites f
        JOIN songs s ON f.songId = s.songId
        WHERE f.userId = ?
        ORDER BY f.id ASC
    """;

    try (PreparedStatement pst = connection.prepareStatement(sql)) {
        pst.setInt(1, userId);
        ResultSet rs = pst.executeQuery();
        while (rs.next()) {
            int id = rs.getInt("id"); // order of favorite
            String title = rs.getString("songName");
            String artist = rs.getString("songArtist");
            String album = rs.getString("album");

            result.add(new FavoriteSong(id, title, artist, album));
        }
    } catch (SQLException e) {
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
//   Helper function for seeing if a song is already favorited by a certain user
    public boolean isSongFavorited(int songId, int userId) throws SQLException {
        String sql = "SELECT * FROM favorites WHERE songId = ? AND userId = ?";
        try(PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setInt(1, songId);
            pst.setInt(2, userId);
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
    //get username by userId
    public String getUsername(int userId) {
        String sql = "SELECT username FROM users WHERE id = ?";
        String result = null;

        try (PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setInt(1, userId);
            ResultSet rs = pst.executeQuery();

            if (rs.next()) {
                result = rs.getString("username");
            }
            return result;
        }
        catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }




    /**
     * Find soulmate and enemy matches for a given user.
     * @param userId the userId of the user to find matches for
     * @return a MatchResult object containing the best and worst matches
     * @throws SQLException
     */
    public MatchResult findMatches(int userId) throws SQLException {

        // Check if the result is already cached
        if (matchCache.containsKey(userId)) {
            return matchCache.get(userId);
        }

        // ---------- STEP 1:  Build a word-frequency map for *every* user ----------
        // keys:   userId   ->   Map<String, Integer>   (word-> count)
        Map<Integer, Map<String, Integer>> clouds = new HashMap<>();

        // 1a.     Grab each user’s favourite songIds in one hit
        Map<Integer, List<Integer>> usersToSongs = new HashMap<>();
        try (PreparedStatement ps =
                     connection.prepareStatement("SELECT userId, songId FROM favorites")) {
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int uid   = rs.getInt("userId");
                    int song  = rs.getInt("songId");
                    usersToSongs.computeIfAbsent(uid, k -> new ArrayList<>()).add(song);
                }
            }
        }

        // 1b.     Pull the *lyrics* for all those songs only once
        Set<Integer> allSongIds = usersToSongs.values()
                .stream()
                .flatMap(List::stream)
                .collect(Collectors.toSet());

        Map<Integer, String> lyricsBySong = new HashMap<>();
        if (!allSongIds.isEmpty()) {
            String inClause = allSongIds.stream()
                    .map(x -> "?")
                    .collect(Collectors.joining(","));
            String sql = "SELECT songId, lyrics FROM songs WHERE songId IN (" + inClause + ")";
            try (PreparedStatement ps = connection.prepareStatement(sql)) {
                int idx = 1;
                for (Integer id : allSongIds) ps.setInt(idx++, id);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        lyricsBySong.put(rs.getInt("songId"), rs.getString("lyrics"));
                    }
                }
            }
        }

        // 1c.     Tokenise + count words for each user
        for (Map.Entry<Integer, List<Integer>> e : usersToSongs.entrySet()) {
            Map<String, Integer> freq = new HashMap<>();
            for (Integer sid : e.getValue()) {
                String lyrics = lyricsBySong.get(sid);
                if (lyrics == null) continue;
                for (String w : tokenize(lyrics)) {
                    freq.merge(w, 1, Integer::sum);
                }
            }
            clouds.put(e.getKey(), freq);
        }

        // ---------- STEP 2:  Similarity comparison for the requested user ----------
        Map<String, Integer> mine = clouds.getOrDefault(userId, Collections.emptyMap());
        if (mine.isEmpty()) return new MatchResult();              // no data – bail early

        double   bestScore = -1.0, worstScore = Double.MAX_VALUE;
        Integer  bestUser = null,  worstUser = null;

        for (Map.Entry<Integer, Map<String, Integer>> e : clouds.entrySet()) {
            int otherId = e.getKey();
            if (otherId == userId) continue;

            double sim = similarity(mine, e.getValue());           // apply any comparison metric
            if (sim > bestScore)  { bestScore  = sim; bestUser  = otherId; }
            if (sim < worstScore) { worstScore = sim; worstUser = otherId; }
        }

        // ---------- STEP 3:  Reciprocity check (do they pick us back?) ----------
        boolean mutualBest = false;
        boolean mutualWorst = false;

        if (bestUser != null) {
            mutualBest = isTopMatchOf(clouds, bestUser, userId);
        }
        if (worstUser != null) {
            mutualWorst = isBottomMatchOf(clouds, worstUser, userId);
        }

        // ---------- STEP 4:  Cache the result for later use ----------
MatchResult matchResult = new MatchResult(getUsername(bestUser==null?1:bestUser), mutualBest,
        getUsername(worstUser==null?1:worstUser), mutualWorst);

        matchCache.put(userId, matchResult);
        return matchResult;
    }

    /**
     * Checks if `targetId` is *the* top match of `userX`.
     * Uses the already-built clouds cache where possible; otherwise builds on demand.
     */
    private boolean isTopMatchOf(
                                 Map<Integer, Map<String,Integer>> cache,
                                 int userX,
                                 int targetId) throws SQLException {

        Map<String,Integer> cloudX = cache.computeIfAbsent(userX, uid -> {
            try { return buildCloudFor(uid); } catch (SQLException e) { return Map.of(); }
        });

        double best = -1.0;
        Integer top = null;
        for (Map.Entry<Integer, Map<String,Integer>> e : cache.entrySet()) {
            int other = e.getKey();
            if (other == userX) continue;
            double s = similarity(cloudX, e.getValue());
            if (s > best) { best = s; top = other; }
        }
        return (top != null && top == targetId);
    }

    /** Analogous to isTopMatchOf but finds the *lowest* similarity.             */
    private boolean isBottomMatchOf(
                                    Map<Integer, Map<String,Integer>> cache,
                                    int userX,
                                    int targetId) throws SQLException {

        Map<String,Integer> cloudX = cache.computeIfAbsent(userX, uid -> {
            try { return buildCloudFor(uid); } catch (SQLException e) { return Map.of(); }
        });

        double worst = Double.MAX_VALUE;
        Integer foe = null;
        for (Map.Entry<Integer, Map<String,Integer>> e : cache.entrySet()) {
            int other = e.getKey();
            if (other == userX) continue;
            double s = similarity(cloudX, e.getValue());
            if (s < worst) { worst = s; foe = other; }
        }
        return (foe != null && foe == targetId);
    }



    /** Builds a cloud for one user from scratch (called only on cache miss).   */
    private Map<String,Integer> buildCloudFor(int uid) throws SQLException {
        Map<String,Integer> freq = new HashMap<>();
        String sql = """
        SELECT s.lyrics
        FROM favorites f
        JOIN songs s ON s.songId = f.songId
        WHERE f.userId = ?
    """;
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, uid);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    for (String w : tokenize(rs.getString("lyrics"))) {
                        freq.merge(w, 1, Integer::sum);
                    }
                }
            }
        }
        return freq;
    }

    /** Tokenize lyric, Very small tokenizer: lowercase letters only, strips non-letters.        */
    private List<String> tokenize(String text) {
        return Arrays.stream(text.toLowerCase().split("\\W+"))
                .filter(t -> !t.isBlank())//filter out spaces, potentially also filter out all "filler" words
                .collect(Collectors.toList());//output as a list
    }

    /**
     * Calculate the similarity between two word clouds.
     * @param a Word cloud A, represented as a map of words and their frequencies.
     * @param b Word cloud B, represented as a map of words and their frequencies.
     * @return A similarity score between 0 and 1, where 1 means identical clouds.
     */
    private double similarity(Map<String,Integer> a, Map<String,Integer> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;

        double shared = 0, total = 0;

        // visit every word that appears in either cloud
        Set<String> vocab = new HashSet<>();
        vocab.addAll(a.keySet());
        vocab.addAll(b.keySet());

        for (String w : vocab) {
            int fa = a.getOrDefault(w, 0);
            int fb = b.getOrDefault(w, 0);
            shared += Math.min(fa, fb);   // words in common
            total  += Math.max(fa, fb);   // words anybody says
        }
        return shared / total;            // 0 ≤ score ≤ 1
    }


}
