const autoBind = require('auto-bind');
const config = require('../../utils/config/config');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    // Melakukan binding function.
    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    // Mendapatkan data (cover) yang merupakan Readable.
    const { id } = request.params;
    const { cover } = request.payload;

    // Validasi cover adalah gambar.
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    const fileLocation = `http://${config.app.host}:${config.app.port}/albums/${id}/covers/${filename}`;

    await this._albumsService.addAlbumCoverNameByAlbumId(fileLocation, id);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        // Lokasi file dari gambar cover.
        fileLocation,
      },
    });
    response.code(201); // Memberikan kode status dari response.
    return response; // Mengembalikan response ke client.
  }
}

module.exports = UploadsHandler;
