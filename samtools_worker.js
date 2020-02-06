Module = {};

Module.noInitialRun = true;

// TODO: This ain't concurrency-safe
let globalStdout = '';
Module.print = (text) => {
  globalStdout += text + '\n';
};

self.importScripts('samtools.js');

const DIR = '/data';

Module.onRuntimeInitialized = () => {
  FS.mkdir(DIR);
};

function doIt(rpc) {

  try {
    FS.unmount(DIR);
  }
  catch (e) {
  }

  // TODO: I think this is leaking memory. Learn more about it.
  FS.streams[1] = FS.open("/dev/stdout", "w");
  FS.streams[2] = FS.open("/dev/stderr", "w");

  const bamFile = rpc.params.bamFile;
  const baiFile = rpc.params.baiFile;

  FS.mount(WORKERFS, {
    files: [bamFile, baiFile],
  }, DIR);

  switch (rpc.method) {
    case 'idxstats': {

      Module.callMain(["idxstats", `/data/${bamFile.name}`]);
      const stats = parseIdxStats(globalStdout);
      globalStdout = '';
      self.postMessage({
        jsonrpc: '2.0',
        result: stats,
        id: rpc.id,
      });

      break;
    }

    case 'getReadLength': {

      const refName = rpc.params.refName;

      // TODO: this is super brittle;
      Module.callMain(["view", `/data/${bamFile.name}`, `${refName}:1-20000`]);
      const viewOutput = parseView(globalStdout);

      const totalReadLength = viewOutput
        .map(record => record[9])
        .filter(read => read)
        .map(read => read.length)
        .reduce((acc, cur) => acc + cur)

      const readLength = totalReadLength / viewOutput.length;

      globalStdout = '';

      self.postMessage({
        jsonrpc: '2.0',
        result: readLength,
        id: rpc.id,
      });

      break;
    }
  }
}

self.onmessage = (message) => {
  const rpc = message.data;
  doIt(rpc);
};

function parseView(text) {
  return text.split('\n')
    .map(line => line.split('\t'));
}


function parseIdxStats(text) {
  return text.split('\n')
    .map(line => line.split('\t'))
    .map(parts => ({
      refSeqName: parts[0],
      seqLength: Number(parts[1]),
      numMapped: Number(parts[2]),
      numUnmapped: Number(parts[3])
    }))
    .filter(rec => rec.refSeqName !== '')
    //.filter(rec => rec.seqLength > 10000000)
}
