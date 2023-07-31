const amqp = require('amqplib');
const config = require('../../utils/config/config');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    // Menutup koneksi satu detik setelah mengirim pesan.
    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
