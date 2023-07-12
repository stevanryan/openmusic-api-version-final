const autoBind = require('auto-bind');

class SongsHandler {
  constructor(songService, songValidator) {
    this._songService = songService;
    this._songValidator = songValidator;

    // Melakukan binding function.
    autoBind(this);
  }

  async postSongHandler(request, h) {
    // Validasi data input.
    this._songValidator.validateSongPayload(request.payload);

    const {
      title = 'untitled',
      year,
      performer,
      genre,
      duration,
      albumId = null,
    } = request.payload;

    const songId = await this._songService.addSong({
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201); // Memberikan kode status dari response.
    return response; // Mengembalikan response ke client.
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this._songService.getSongs({ title, performer });

    return {
      status: 'success',
      data: {
        songs: songs.map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._songService.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    // Validasi data input.
    this._songValidator.validateSongPayload(request.payload);

    const { id } = request.params;
    await this._songService.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    await this._songService.deleteSongById(request.params.id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
