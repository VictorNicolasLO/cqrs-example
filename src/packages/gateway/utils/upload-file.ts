export function upload(fileToUpload, stream) {
  return new Promise((resolve, reject) => {
    try {
      //Write file request to gcloud file
      fileToUpload.pipe(stream);
      let actualSize = 0;

      fileToUpload.on('data', chunk => {
        actualSize += chunk.length;
      });

      stream.on('error', err => {
        reject(err);
      });

      stream.on('finish', () => {
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}
