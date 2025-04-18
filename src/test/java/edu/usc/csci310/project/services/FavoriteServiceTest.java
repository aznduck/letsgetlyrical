package edu.usc.csci310.project.services;

import edu.usc.csci310.project.Utils;
import edu.usc.csci310.project.requests.CreateUserRequest;
import edu.usc.csci310.project.requests.FavoriteGetRequest;
import edu.usc.csci310.project.requests.FavoriteRemoveRequest;
import edu.usc.csci310.project.requests.FavoriteSongRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FavoriteServiceTest {
    private FavoriteService favoriteService;
    private Connection connection;
    private Statement st;
    private PreparedStatement pst;
    private ResultSet rs;

    @BeforeEach
    void setUpBeforeClass() throws Exception {
        connection = mock(Connection.class);
        favoriteService = spy(new FavoriteService(connection));
        st = mock(Statement.class);
        pst = mock(PreparedStatement.class);
        rs = mock(ResultSet.class);
    }

    FavoriteSongRequest generateValidFavoriteSongRequest() {
        FavoriteSongRequest request = new FavoriteSongRequest();
        request.setUsername("testuser");
        request.setPassword("testpassword");
        request.setSongId(420);
        request.setSongName("Test Song");
        request.setSongArtist("Test Artist");
        request.setFullTitle("Test Song by Test Artist");
        request.setDateReleased("1969-01-01");
        request.setLyrics("Test lyrics");
        return request;
    }

    FavoriteRemoveRequest generateValidFavoriteRemoveRequest() {
        FavoriteRemoveRequest request = new FavoriteRemoveRequest();
        request.setUsername("testuser");
        request.setPassword("testpassword");
        request.setSongId(420);
        return request;
    }

    FavoriteGetRequest generateValidFavoriteGetRequest() {
        FavoriteGetRequest request = new FavoriteGetRequest();
        request.setUsername("testuser");
        request.setPassword("testpassword");
        return request;
    }

    @Test
    void addFavoriteSongValidNewSong() throws SQLException {
        Statement songSt = mock(Statement.class);
        Statement favoritesSt = mock(Statement.class);
        PreparedStatement songInsertPst = mock(PreparedStatement.class);
        PreparedStatement favoritesInsertPst = mock(PreparedStatement.class);
        ResultSet songInsertRs = mock(ResultSet.class);
        ResultSet favoritesInsertRs = mock(ResultSet.class);

        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenReturn(songInsertPst);
        doReturn(false).when(favoriteService).isSongAdded(request.getSongId());

        when(songInsertPst.executeUpdate()).thenReturn(1);

        when(connection.createStatement()).thenReturn(songSt, favoritesSt);
        when(songSt.executeQuery("SELECT last_insert_rowid()")).thenReturn(songInsertRs);
        when(songInsertRs.next()).thenReturn(true);
        when(songInsertRs.getInt(1)).thenReturn(request.getSongId());

        String insertFavoritesSQL = "INSERT INTO favorites (userId, songId) VALUES (?, ?)";

        when(connection.prepareStatement(insertFavoritesSQL)).thenReturn(favoritesInsertPst);
        when(favoritesInsertPst.executeUpdate()).thenReturn(1);
        when(favoritesSt.executeQuery("SELECT last_insert_rowid()")).thenReturn(favoritesInsertRs);
        when(favoritesInsertRs.next()).thenReturn(true);

        assertEquals(request.getSongId(), favoriteService.addFavoriteSong(request));
        verify(songInsertPst).setInt(1, request.getSongId());
        verify(songInsertPst).setString(2, request.getSongName());
        verify(songInsertPst).setString(3, request.getSongArtist());
        verify(songInsertPst).setString(4, request.getFullTitle());
        verify(songInsertPst).setString(5, request.getDateReleased());
        verify(songInsertPst).setString(6, request.getLyrics());
    }

    @Test
    void addFavoriteSongValidDuplicateSong() throws SQLException {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenReturn(pst);
        doReturn(true).when(favoriteService).isSongAdded(request.getSongId());

        String insertFavoritesSQL = "INSERT INTO favorites (userId, songId) VALUES (?, ?)";

        when(connection.createStatement()).thenReturn(st);
        when(connection.prepareStatement(insertFavoritesSQL)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(1);
        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        assertEquals(0, favoriteService.addFavoriteSong(request));
    }

    @Test
    void addFavoriteSongFailedToRetrieveSongs() throws SQLException {
        ResultSet songInsertRs = mock(ResultSet.class);

        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenReturn(pst);
        doReturn(false).when(favoriteService).isSongAdded(request.getSongId());

        when(pst.executeUpdate()).thenReturn(1);

        when(connection.createStatement()).thenReturn(st);
        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(songInsertRs);
        when(songInsertRs.next()).thenReturn(false);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> favoriteService.addFavoriteSong(request));
        assert(rte.getMessage().contains("Failed to retrieve the generated ID in songs."));
    }

    @Test
    void addFavoriteSongFailedToRetrieveFavorites() throws SQLException {
        Statement songSt = mock(Statement.class);
        Statement favoritesSt = mock(Statement.class);
        PreparedStatement songInsertPst = mock(PreparedStatement.class);
        PreparedStatement favoritesInsertPst = mock(PreparedStatement.class);
        ResultSet songInsertRs = mock(ResultSet.class);
        ResultSet favoritesInsertRs = mock(ResultSet.class);

        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenReturn(songInsertPst);
        doReturn(false).when(favoriteService).isSongAdded(request.getSongId());

        when(songInsertPst.executeUpdate()).thenReturn(1);

        when(connection.createStatement()).thenReturn(songSt, favoritesSt);
        when(songSt.executeQuery("SELECT last_insert_rowid()")).thenReturn(songInsertRs);
        when(songInsertRs.next()).thenReturn(true);
        when(songInsertRs.getInt(1)).thenReturn(request.getSongId());

        String insertFavoritesSQL = "INSERT INTO favorites (userId, songId) VALUES (?, ?)";

        when(connection.prepareStatement(insertFavoritesSQL)).thenReturn(favoritesInsertPst);
        when(favoritesInsertPst.executeUpdate()).thenReturn(1);
        when(favoritesSt.executeQuery("SELECT last_insert_rowid()")).thenReturn(favoritesInsertRs);
        when(favoritesInsertRs.next()).thenReturn(false);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> favoriteService.addFavoriteSong(request));
        assert(rte.getMessage().contains("Failed to retrieve the generated ID in favorites."));
    }

    @Test
    void addFavoriteSongNoRowsAffectedSongs() throws SQLException {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenReturn(pst);
        doReturn(false).when(favoriteService).isSongAdded(request.getSongId());

        when(pst.executeUpdate()).thenReturn(0);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> favoriteService.addFavoriteSong(request));
        assert(rte.getMessage().contains("No rows in Songs affected during the insert."));
    }

    @Test
    void addFavoriteSongNoRowsAffectedFavorites() throws SQLException {
        PreparedStatement songInsertPst = mock(PreparedStatement.class);
        PreparedStatement favoritesInsertPst = mock(PreparedStatement.class);

        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenReturn(songInsertPst);
        doReturn(false).when(favoriteService).isSongAdded(request.getSongId());

        when(songInsertPst.executeUpdate()).thenReturn(1);

        when(connection.createStatement()).thenReturn(st);
        when(st.executeQuery("SELECT last_insert_rowid()")).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getInt(1)).thenReturn(request.getSongId());

        String insertFavoritesSQL = "INSERT INTO favorites (userId, songId) VALUES (?, ?)";

        when(connection.prepareStatement(insertFavoritesSQL)).thenReturn(favoritesInsertPst);
        when(favoritesInsertPst.executeUpdate()).thenReturn(0);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> favoriteService.addFavoriteSong(request));
        assert(rte.getMessage().contains("No rows in Favorites affected during the insert."));
    }

    @Test
    void addFavoriteSongInvalidUserId() throws SQLException {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(-1).when(favoriteService).getUserId(request.getUsername());
        assertEquals(-1, favoriteService.addFavoriteSong(request));
    }

    @Test
    void addFavoriteSongSQLException() throws SQLException {
        FavoriteSongRequest request = generateValidFavoriteSongRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String insertSongsSQL = "INSERT INTO songs (songId, songName, songArtist, fullTitle, dateReleased, lyrics) VALUES (?, ?, ?, ?, ?, ?)";
        when(connection.prepareStatement((insertSongsSQL))).thenThrow(new SQLException("Test SQL Exception"));

        assertThrows(RuntimeException.class, () -> favoriteService.addFavoriteSong(request));
    }

    @Test
    void removeFavoriteSongValid() throws SQLException {
        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String deleteSql = "DELETE FROM favorites WHERE userId = ? and songId = ?";

        when(connection.prepareStatement(deleteSql)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(1);

        assertEquals(1, favoriteService.removeFavoriteSong(request));
        verify(pst).setInt(1, 1);
        verify(pst).setInt(2, request.getSongId());
    }

    @Test
    void removeFavoriteSongRowsNotAffected() throws SQLException {
        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String deleteSql = "DELETE FROM favorites WHERE userId = ? and songId = ?";

        when(connection.prepareStatement(deleteSql)).thenReturn(pst);
        when(pst.executeUpdate()).thenReturn(0);

        RuntimeException rte = assertThrows(RuntimeException.class, () -> favoriteService.removeFavoriteSong(request));
        assertTrue(rte.getMessage().contains("Failed to delete the entry from Favorites."));
    }

    @Test
    void removeFavoriteSongInvalidUserId() {
        FavoriteRemoveRequest request = generateValidFavoriteRemoveRequest();
        doReturn(-1).when(favoriteService).getUserId(request.getUsername());
        RuntimeException rte = assertThrows(RuntimeException.class, () -> favoriteService.removeFavoriteSong(request));
        assert(rte.getMessage().contains("User does not exist."));
    }

    @Test
    void isSongAdded_notAdded() throws SQLException {
        int songId = 1;
        String sql = "SELECT * FROM songs WHERE songId = ?";
        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        assertFalse(favoriteService.isSongAdded(songId));
    }

    @Test
    void isSongAdded_added() throws SQLException {
        int songId = 1;
        String sql = "SELECT * FROM songs WHERE songId = ?";
        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);
        assertTrue(favoriteService.isSongAdded(songId));
    }

    @Test
    void isSongAdded_exception() throws SQLException {
        int songId = 1;
        String sql = "SELECT * FROM songs WHERE songId = ?";
        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenThrow(new SQLException("Test SQL Exception"));
        assertThrows(RuntimeException.class, () -> favoriteService.isSongAdded(songId));
    }

    @Test
    void getUserIdValid() throws SQLException {
        String username = "test";
        String hashedUsername = Utils.hashUsername(username);
        String sql = "SELECT id FROM users WHERE username = ?";

        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getInt("id")).thenReturn(1);

        assertEquals(1, favoriteService.getUserId(username));
    }

    @Test
    void getUserIdUsernameNotFound() throws SQLException {
        String username = "test";
        String hashedUsername = Utils.hashUsername(username);
        String sql = "SELECT id FROM users WHERE username = ?";

        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        assertEquals(-1, favoriteService.getUserId(username));
    }

    @Test
    void getUserIdException() throws SQLException {
        String username = "test";
        String hashedUsername = Utils.hashUsername(username);
        String sql = "SELECT id FROM users WHERE username = ?";

        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenThrow(new SQLException("Test SQL Exception"));
        assertThrows(RuntimeException.class, () -> favoriteService.getUserId(username));
    }

    @Test
    void getUserIdExceptionTwo() throws SQLException {
        String username = "test";
        String hashedUsername = Utils.hashUsername(username);
        String sql = "SELECT id FROM users WHERE username = ?";

        when(connection.prepareStatement(sql)).thenThrow(new SQLException("Test SQL Exception"));
        assertThrows(RuntimeException.class, () -> favoriteService.getUserId(username));
    }

    @Test
    void getFavoriteSongsValid() throws SQLException {
        FavoriteGetRequest request = generateValidFavoriteGetRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String sql = "SELECT songId FROM favorites WHERE userId = ?";
        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);

        when(rs.next()).thenReturn(true, true, true, false);
        when(rs.getInt(1)).thenReturn(1, 2, 3);

        List<Integer> result = favoriteService.getFavoriteSongs(request);

        assertEquals(3, result.size());
        assertTrue(result.contains(1));
        assertTrue(result.contains(2));
        assertTrue(result.contains(3));

        verify(pst).setInt(1, 1);
    }

    @Test
    void getFavoriteSongsEmpty() throws SQLException {
        FavoriteGetRequest request = generateValidFavoriteGetRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String sql = "SELECT songId FROM favorites WHERE userId = ?";
        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenReturn(rs);

        when(rs.next()).thenReturn(false);

        List<Integer> result = favoriteService.getFavoriteSongs(request);

        assertTrue(result.isEmpty());
        verify(pst).setInt(1, 1);
    }

    @Test
    void getFavoriteSongsInvalidUserId() {
        FavoriteGetRequest request = generateValidFavoriteGetRequest();
        doReturn(-1).when(favoriteService).getUserId(request.getUsername());

        RuntimeException rte = assertThrows(RuntimeException.class,
                () -> favoriteService.getFavoriteSongs(request));
        assertTrue(rte.getMessage().contains("User does not exist."));
    }

    @Test
    void getFavoriteSongsSQLException() throws SQLException {
        FavoriteGetRequest request = generateValidFavoriteGetRequest();
        doReturn(1).when(favoriteService).getUserId(request.getUsername());

        String sql = "SELECT songId FROM favorites WHERE userId = ?";
        when(connection.prepareStatement(sql)).thenReturn(pst);
        when(pst.executeQuery()).thenThrow(new SQLException("Test SQL Exception"));

        assertThrows(RuntimeException.class, () -> favoriteService.getFavoriteSongs(request));
    }
}