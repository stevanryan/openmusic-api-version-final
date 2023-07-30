// Mengimport .env dan menjalankan konfigurasi.
require('dotenv').config();

// hapi.
const Hapi = require('@hapi/hapi');

// hapi inert to serve requests using files
// digunakan untuk melayani request berbentuk file serta melayani permintaan berbasis direktori.
const Inert = require('@hapi/inert');

// jwt.
const Jwt = require('@hapi/jwt');

// directory path.
const path = require('path');

// custom error exceptions.
const ClientError = require('./exceptions/ClientError');

// albums.
const albums = require('./api/album');
const AlbumsService = require('./service/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs.
const songs = require('./api/songs');
const SongsService = require('./service/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// playlists.
const playlists = require('./api/playlists');
const PlaylistsService = require('./service/postgres/PlaylistsService');
const playlistsValidator = require('./validator/playlists');

// playlist songs.
const PlaylistSongsService = require('./service/postgres/PlaylistSongsService');

// playlist activities.
const PlaylistActivitiesService = require('./service/postgres/PlaylistActivitiesService');

// users.
const users = require('./api/users');
const UsersService = require('./service/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications.
const authentications = require('./api/authentications');
const AuthenticationsService = require('./service/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations.
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// uploads.
const uploads = require('./api/uploads');
const StorageService = require('./service/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  // __dirname berisi path lengkap dari direktori atau folder yang sedang dibuka.
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/covers'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Registrasi plugin eksternal.
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Mendefinisikan strategy autentikasi jwt.
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Mendaftarkan plugin di server Hapi.
  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        songsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistSongsService,
        playlistActivitiesService,
        validator: playlistsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
  ]);

  // onPreResponse untuk handle response.
  server.ext('onPreResponse', (request, h) => {
    // Mendapatkan konteks response dari request.
    const { response } = request;

    if (response instanceof Error) {
      // Penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Mempertahankan penanganan client error oleh Hapi secara native.
      if (!response.isServer) {
        return h.continue;
      }

      // Mengecek error yang terjadi.
      console.error(response.message);
      if (response.stack) {
        console.error(response.stack);
      }

      // Penanganan server error sesuai kebutuhan.
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    // Jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
