const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const userResult = await this._pool.query(query);

    if (!userResult.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return userResult.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const userResult = await this._pool.query(query);

    if (userResult.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const userResult = await this._pool.query(query);

    if (!userResult.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return userResult.rows[0];
  }

  // Digunakan untuk verifikasi kredensial dari user.
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const userResult = await this._pool.query(query);

    if (!userResult.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    // Mendapatkan id dan password dari hasil query.
    const { id, password: hashedPassword } = userResult.rows[0];

    // Menggunakan method compare untuk mendapatkan boolean hasil dari komparasi password.
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }

  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };

    const userResult = await this._pool.query(query);
    return userResult.rows;
  }
}

module.exports = UsersService;
