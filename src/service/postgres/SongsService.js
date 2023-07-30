const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const mapDBToModel = require('../../utils/songs/index');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [`song-${id}`, title, year, performer, genre, duration, albumId],
    };

    const songResult = await this._pool.query(query);

    if (!songResult.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return songResult.rows[0].id;
  }

  async getSongs({ title, performer }) {
    if (title !== undefined && performer !== undefined) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };

      const findResult = await this._pool.query(query);
      return findResult.rows;
    }

    if (title !== undefined || performer !== undefined) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1 OR LOWER(performer) LIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };

      const findResult = await this._pool.query(query);
      return findResult.rows;
    }

    const songResult = await this._pool.query('SELECT id, title, performer FROM songs');
    return songResult.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const songResult = await this._pool.query(query);

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return songResult.rows.map(mapDBToModel)[0];
  }

  async getSongByAlbumId(id) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
            LEFT JOIN albums ON albums.id = songs.album_id
            WHERE songs.album_id = $1`,
      values: [id],
    };

    const songResult = await this._pool.query(query);

    return songResult.rows;
  }

  async editSongById(id, {
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const songResult = await this._pool.query(query);

    if (!songResult.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const songResult = await this._pool.query(query);

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
