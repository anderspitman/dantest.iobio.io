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

    case 'view': {

      const region = `${rpc.params.refName}:${rpc.params.start}-${rpc.params.end}`;

      Module.callMain(["view", `/data/${bamFile.name}`, region]);

      self.postMessage({
        jsonrpc: '2.0',
        result: globalStdout,
        id: rpc.id,
      });

      globalStdout = '';

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
