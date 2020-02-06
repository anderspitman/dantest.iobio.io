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
      break;
  }

  //Module.callMain(["view", "-H", "/tmp/examples/toy.sam"]);
  //Module.callMain(["idxstats", `/data/${file.name}`]);
}

self.onmessage = (message) => {
  const rpc = message.data;
  doIt(rpc);
};
