const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModel = require('../../utils/albums');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum(name, year) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [`album-${id}`, name, year, null],
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

    return albumResult.rows.map(mapDBToModel)[0];
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

  async addAlbumCoverNameByAlbumId(coverName, id) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE albums.id = $2 RETURNING id',
      values: [coverName, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Cover gagal ditambahkan');
    }
  }
}

module.exports = AlbumsService;
