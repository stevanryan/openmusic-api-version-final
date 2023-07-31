const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const ClientError = require('../../exceptions/ClientError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLikeToAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const likeResult = await this._pool.query(query);

    if (!likeResult.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan pada album');
    }

    await this._cacheService.delete(`openmusic:${albumId}`);
    return likeResult.rows[0].id;
  }

  async deleteLikeById(userId, albumId) {
    const query = {
      text: `DELETE FROM user_album_likes
            WHERE user_id = $1 AND album_id = $2
            RETURNING id`,
      values: [userId, albumId],
    };

    const likeResult = await this._pool.query(query);

    if (!likeResult.rows.length) {
      throw new NotFoundError('Like gagal dihapus. Id album tidak ditemukan');
    }

    await this._cacheService.delete(`openmusic:${albumId}`);
  }

  async getLikeByAlbumId(id) {
    try {
      // Mencoba mendapatkan data like dari cache.
      const likeCacheResult = await this._cacheService.get(`openmusic:${id}`);
      const result = JSON.parse(likeCacheResult);
      return {
        likeResult: result,
        fromCache: true,
      };
    } catch (error) {
      // Jika data pada cache tidak ada atau gagal, maka ambil dari database.
      const query = {
        text: `SELECT user_album_likes.id FROM user_album_likes
              LEFT JOIN albums ON albums.id = user_album_likes.album_id
              WHERE user_album_likes.album_id = $1`,
        values: [id],
      };

      const likeResult = await this._pool.query(query);

      // Menyimpan data pada cache sebelum kembali.
      await this._cacheService.set(`openmusic:${id}`, likeResult.rows.length);

      return {
        likeResult: likeResult.rows.length,
      };
    }
  }

  async verifyUserLike(userId) {
    const query = {
      text: 'SELECT user_id FROM user_album_likes WHERE user_id = $1',
      values: [userId],
    };

    const userResult = await this._pool.query(query);

    if (userResult.rows.length) {
      throw new ClientError('Like sudah ditambahkan, tidak bisa menambahkan lagi');
    }
  }
}

module.exports = LikesService;
