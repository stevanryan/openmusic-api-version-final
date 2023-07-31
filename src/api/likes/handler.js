const autoBind = require('auto-bind');

class LikesHandler {
  constructor(likesService, albumsService) {
    this._likesService = likesService;
    this._albumsService = albumsService;

    // Melakukan binding function.
    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.verifyAlbumExists(id);
    await this._likesService.verifyUserLike(credentialId);

    await this._likesService.addLikeToAlbum(credentialId, id);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan pada album',
    });
    response.code(201); // Memberikan kode status dari response.
    return response; // Mengembalikan response ke client.
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const { likeResult, fromCache = false } = await this._likesService.getLikeByAlbumId(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: likeResult,
      },
    });

    if (fromCache) {
      // Mengembalikan custom header fromCache bernilai true.
      response.header('X-Data-Source', 'cache');
      return response;
    }
    return response;
  }

  async deleteLikeByAlbumIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._likesService.deleteLikeById(credentialId, id);

    return {
      status: 'success',
      message: 'Like berhasil dihapus',
    };
  }
}

module.exports = LikesHandler;
