Module = {};

Module.noInitialRun = true;

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

  const bamFile = rpc.params.bamFile;
  const baiFile = rpc.params.baiFile;

  try {
    FS.unmount(DIR);
  }
  catch (e) {
  }

  FS.mount(WORKERFS, {
    files: [bamFile, baiFile],
  }, DIR);

  // TODO: I think this is leaking memory. Learn more about it.
  FS.streams[1] = FS.open("/dev/stdout", "w");
  FS.streams[2] = FS.open("/dev/stderr", "w");


  switch (rpc.method) {
    case 'idxstats':
      Module.callMain(["idxstats", `/data/${bamFile.name}`]);
      const stats = parseIdxStats(globalStdout);
      globalStdout = '';
      console.log(stats);
      break;
  }
}

self.onmessage = (message) => {
  const rpc = message.data;
  doIt(rpc);
};


function parseIdxStats(text) {
  return text.split('\n')
    .map(line => line.split('\t'))
    .map(parts => ({
      refSeqName: parts[0],
      seqLength: Number(parts[1]),
      numMapped: Number(parts[2]),
      numUnmapped: Number(parts[3])
    }))
    .filter(rec => rec.seqLength > 10000000);
}
