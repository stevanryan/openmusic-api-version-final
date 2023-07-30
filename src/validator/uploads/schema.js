const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  // valid digunakan untuk menentukan validitias nilai dari properti secara spesifik.
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').required(),
  // unknown untuk objek bersifat tidak diketahui yaitu objek boleh memiliki properti apapun.
}).unknown();

module.exports = { ImageHeadersSchema };
