import { workerData, parentPort } from 'worker_threads';


async function mockCompressor() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Mock Compressor Resolved');
        }, 5000);
    });

}



(async function compressFile() {
    const fileToCompress = workerData;
    const mockCompress = await mockCompressor();
    parentPort?.postMessage('File has been compressed');    

})();

// https://www.youtube.com/watch?v=c2OSyOyAde0
// https://medium.com/@serhiisamoilenko/speeding-up-file-parsing-with-multi-threading-in-nodejs-and-typescript-9e91728cf607