const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000, // Max size 512KB
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/covers/{param*}',
    // Permintaan masuk akan dilayani oleh berkas statis yang berada pada folder file.
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file/covers'),
      },
    },
  },
];

module.exports = routes;
