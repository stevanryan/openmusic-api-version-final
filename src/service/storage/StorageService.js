const fs = require('fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    // Jika belum ada foldernya, maka buat baru.
    if (!fs.existsSync(folder)) {
      // recursive true membuat proses mkdirSync bekerja secara rekursif.
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    // filename dari kombinasi unik date timestamp + meta
    const filename = +new Date() + meta.filename;

    // path menampung alamat lengkap dari berkas yang dituliskan.
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    // Jika proses penulisan berkas menggunakan stream berhasil
    // maka promise menghasilkan resolve yang membawa nama berkas (filename).
    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
