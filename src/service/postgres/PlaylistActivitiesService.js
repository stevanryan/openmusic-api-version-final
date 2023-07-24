const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistActivities(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(16)}`;

    const dateTime = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, dateTime],
    };

    const activitiesResult = await this._pool.query(query);

    if (!activitiesResult.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return activitiesResult.rows[0].id;
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
            FROM users
            LEFT JOIN playlist_song_activities ON playlist_song_activities.user_id = users.id
            LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
            WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const activitiesResult = await this._pool.query(query);

    return activitiesResult.rows;
  }

  async deletePlaylistActivitiesByPlaylistId(playlistId) {
    const query = {
      text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };

    const activitiesResult = await this._pool.query(query);

    if (!activitiesResult.rows.length) {
      throw new NotFoundError('Playlist activities gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsActivitiesService;
