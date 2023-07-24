const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistService, playlistSongsService, playlistActivitiesService, playlistValidator) {
    this._playlistService = playlistService;
    this._playlistSongsService = playlistSongsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._playlistValidator = playlistValidator;

    // Melakukan binding function.
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    // Validasi data input.
    this._playlistValidator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistService.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201); // Memberikan kode status dari response.
    return response; // Mengembalikan response ke client.
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId);
    await this._playlistService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    // Validasi data input.
    this._playlistValidator.validatePlaylistSongsPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);

    await this._playlistService.verifySongId(songId);

    // Playlist activity.
    const action = 'add';
    await this._playlistActivitiesService.addPlaylistActivities(id, songId, credentialId, action);

    await this._playlistSongsService.addSongToPlaylist(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistSongsService.getSongsFromPlaylist(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    // Validasi data input.
    this._playlistValidator.validatePlaylistSongsPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);

    // Playlist activity.
    const action = 'delete';
    await this._playlistActivitiesService.addPlaylistActivities(id, songId, credentialId, action);

    await this._playlistSongsService.deleteSongFromPlaylist(id, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const activities = await this._playlistActivitiesService.getPlaylistActivities(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
