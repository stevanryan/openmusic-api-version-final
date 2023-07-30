const { ImageHeadersSchema } = require('./schema');
// Client Error exceptions.
const InvariantError = require('../../exceptions/InvariantError');

const ImagesValidator = {
  validateImageHeaders: (payload) => {
    const validationResult = ImageHeadersSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ImagesValidator;
