const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumService, songsService, albumValidator) {
    this._albumService = albumService;
    this._songsService = songsService;
    this._albumValidator = albumValidator;

    // Melakukan binding function.
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    // Validasi data input.
    this._albumValidator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;

    const albumId = await this._albumService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const albumById = await this._albumService.getAlbumById(id);
    const songsFromAlbum = await this._songsService.getSongByAlbumId(id);

    const album = { ...albumById, songs: songsFromAlbum };

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    // Validasi data input.
    this._albumValidator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    await this._albumService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    await this._albumService.deleteAlbumById(request.params.id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
