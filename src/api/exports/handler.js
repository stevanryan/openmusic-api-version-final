const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    // Melakukan binding function.
    autoBind(this);
  }

  async postExportSongsHandler(request, h) {
    // Validasi data input.
    this._validator.validateExportSongsPayload(request.payload);

    const message = {
      playlistId: request.params.playlistId,
      userId: request.auth.credentials.id,
      targetEmail: request.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistOwner(message.playlistId, message.userId);

    // Menggunakan stringify karena parameter hanya menerima bentuk string sehingga harus diubah.
    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201); // Memberikan kode status dari response.
    return response; // Mengembalikan response ke client.
  }
}

module.exports = ExportsHandler;
