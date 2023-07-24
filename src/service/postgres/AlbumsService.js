const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [`album-${id}`, name, year],
    };

    const albumResult = await this._pool.query(query);

    if (!albumResult.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return albumResult.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(query);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return albumResult.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const albumResult = await this._pool.query(query);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const albumResult = await this._pool.query(query);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
