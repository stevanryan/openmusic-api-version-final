const redis = require('redis');
const config = require('../../utils/config/config');

class CacheService {
  constructor() {
    // Menggunakan client untuk mengoperasikan Redis server.
    this._client = redis.createClient({
      socket: {
        host: config.redis.host,
      },
    });

    // Membuat client Redis dapat menyebabkan error, sehingga harus dicetak menggunakan console.
    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  async set(key, value, exporationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: exporationInSecond,
    });
  }

  async get(key) {
    const keyResult = await this._client.get(key);

    if (keyResult === null) {
      // Ketika data pada key bernilai nil, maka bangkitkan error.
      throw new Error('Cache tidak ditemukan');
    }

    return keyResult;
  }

  delete(key) {
    // Mengembalikan jumlah dari nilai yang dihapus pada cache.
    return this._client.del(key);
  }
}

module.exports = CacheService;
