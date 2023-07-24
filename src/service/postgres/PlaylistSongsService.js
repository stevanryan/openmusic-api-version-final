const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const songResult = await this._pool.query(query);

    if (!songResult.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
  }

  async getSongsFromPlaylist(id) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1`,
      values: [id],
    };

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
            WHERE songs.id = playlist_songs.song_id AND playlist_songs.playlist_id = $1`,
      values: [id],
    };

    const playlistResult = await this._pool.query(queryPlaylist);
    const songResult = await this._pool.query(querySongs);

    const finalResult = { ...playlistResult.rows[0], songs: songResult.rows };

    return finalResult;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs
            WHERE playlist_songs.playlist_id = $1
            AND playlist_songs.song_id = $2
            RETURNING playlist_songs.song_id`,
      values: [playlistId, songId],
    };

    const songResult = await this._pool.query(query);

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsSongsService;
