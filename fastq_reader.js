function readFastq(file, onProgress) {
  const inflate = new pako.Inflate({ level: 3});

  const decoder = new TextDecoder('utf-8');

  let numReads = 0;
  let totalLines = 0;
  let readLengthSum = 0;
  let remainder = '';

  // process data, splitting on newlines
  inflate.onData = (data) => {
    let chunk = decoder.decode(data);

    if (remainder.length > 0) {
      chunk = remainder + chunk;
      remainder = '';
    }

    let index = 0;
    while (true) {
      index = chunk.indexOf('\n');

      if (index < 0) {
        break;
      }

      // don't include the newline
      const line = chunk.slice(0, index);
      chunk = chunk.slice(index + 1);

      const isSeqLine = totalLines % 4 === 1;
      totalLines += 1;

      if (isSeqLine) {
        readLengthSum += line.length;
        numReads += 1;
      }
    }

    if (chunk.length > 0) {
      remainder = chunk;
    }
  };

  inflate.onEnd = (status) => {
    const gBases = readLengthSum / 1e9;
    console.log("Read length: ", readLengthSum/numReads);
    console.log("GBases: ", gBases);
  };

  const chunkSize = 1024*1024;

  let curBytes = 0;
  let bytesPerSeconds = 0;

  const intervalId = setInterval(() => {
    bytesPerSeconds = curBytes;
    curBytes = 0;
  }, 1000);


  function readChunk(file, offset) {

    const fileReader = new FileReader();

    fileReader.onload = (event) => {

      curBytes += chunkSize;

      const buf = new Uint8Array(event.target.result);
      if (offset + chunkSize > file.size) {
        const success = inflate.push(buf, true);
        clearInterval(intervalId);
      }
      else {
        const success = inflate.push(buf, false);
        readChunk(file, offset + chunkSize);
      }

      if (onProgress) {
        const megabytesPerSecond = bytesPerSeconds / 1e6;
        const progressBytes = Math.min(offset + chunkSize, file.size);
        onProgress(progressBytes, megabytesPerSecond);
      }
    };

    fileReader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
  }

  readChunk(file, 0);
}

export { readFastq };
