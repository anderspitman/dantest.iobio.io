import { ReportView } from './views/report.js';
import { CheckedFileView } from './views/checked_file.js';
import { FileChooserView } from './views/file_chooser.js';


class WorkerRPC {

  constructor(workerScriptUri) {
    this._nextId = 1;
    this._worker = new Worker(workerScriptUri);

    this._worker.onmessage = this._handleMessage.bind(this);
    this._requestPromises = {};
  }

  async call(method, params) {

    const id = this._nextId++;

    this._worker.postMessage({
      jsonrpc: '2.0',
      method,
      params,
      id,
    });

    return new Promise((resolve, reject) => {
      this._requestPromises[id] = {
        resolve,
        reject,
      };
    });
  }

  _handleMessage(message) {
    const rpc = message.data;

    if (this._requestPromises[rpc.id]) {
      this._requestPromises[rpc.id].resolve(rpc.result);
      delete this._requestPromises[rpc.id];
    }
  }
}



const contentEl = document.querySelector('.content');

const requiredFilesEl = document.createElement('h1');
requiredFilesEl.classList.add('section-header');
requiredFilesEl.innerText = "Required files:";
contentEl.appendChild(requiredFilesEl);

const bamFileView = CheckedFileView('BAM');
contentEl.appendChild(bamFileView.dom);

const baiFileView = CheckedFileView('BAM index (BAI)');
contentEl.appendChild(baiFileView.dom);

const fileChooserEl = FileChooserView();
contentEl.appendChild(fileChooserEl.dom);

const reportHeaderEl = document.createElement('h1');
reportHeaderEl.classList.add('section-header');
reportHeaderEl.innerText = "Report:";
contentEl.appendChild(reportHeaderEl);

const reportContainer = document.createElement('div');
reportContainer.innerText = "Waiting for required files";
contentEl.appendChild(reportContainer);

let bamFile = null;
let baiFile = null;

const samtoolsRpc = new WorkerRPC('./samtools_worker.js');

const uppie = new Uppie();

//const fileInput = document.querySelector('.file-chooser__input');
//const fileInputBtn = document.querySelector('.file-chooser__btn');


// Handle input files
uppie(fileChooserEl.fileInput, (event, formData, filenames) => {
  handleFormData(formData);
});

// Handle drag-and-drop files
uppie(document.documentElement, (event, formData, filenames) => {
  handleFormData(formData);
});


async function handleFormData(formData) {
  for (const entry of formData.entries()) {

    const file = entry[1];

    if (file.name.endsWith('bam')) {
      bamFile = file;
      bamFileView.onStateChange({ filename: file.name });
    }

    if (file.name.endsWith('bai')) {
      baiFile = file;
      baiFileView.onStateChange({ filename: file.name });
    }

    if (bamFile && baiFile) {

      reportContainer.innerText = "Generating report...";

      const idxstats = await samtoolsRpc.call('idxstats', {
        bamFile,
        baiFile,
      });

      const readLength = await getReadLength(samtoolsRpc, bamFile, baiFile, idxstats);

      const avgReadDepths = idxstats
        .map(stat => {
          const avgDepth = (stat.numMapped * readLength) / stat.seqLength;
          return {
            [stat.refSeqName]: avgDepth,
          };
        });

      const stats = [];

      let totalMapped = 0;
      let totalUnmapped = 0;
      let totalSeqLength = 0;
      for (const stat of idxstats) {
        totalMapped += stat.numMapped;
        totalUnmapped += stat.numUnmapped;
        totalSeqLength += stat.seqLength;
      }

      const rawGBases = ((totalMapped + totalUnmapped) * readLength) / 1e9;

      const ratioMapped = totalMapped / (totalMapped + totalUnmapped);

      const mappedAvgReadDepth = (totalMapped * readLength) / totalSeqLength;

      const reportView = ReportView(readLength, rawGBases, ratioMapped, mappedAvgReadDepth);
      reportContainer.innerText = '';
      reportContainer.appendChild(reportView);
    }
  }
}

// TODO: this is a pretty hacky method of doing this. Ideally we would be able
// to make samtools block on stdout, so we just read as many lines as we need
// until we have enough reads. But I haven't figured out a way to do that, so
// I'm splitting it across multiple calls.
async function getReadLength(samtoolsRpc, bamFile, baiFile, refs) {

  // Sort refs descending by sequence length
  const sortedRefs = refs 
    .slice()
    .sort((a, b) => {
      if (a.seqLength < b.seqLength) return -1;
      if (a.seqLength > b.seqLength) return 1;
      return 0;
    })
    .reverse()

  let readsRemaining = 1000;
  let readsCollected = 0;

  let totalReadLength = 0;

  for (const ref of sortedRefs) {

    const reads = await getReadsFromRef(samtoolsRpc, bamFile, baiFile, ref, readsRemaining);
    readsCollected += reads.length;
    readsRemaining -= reads.length;

    totalReadLength += reads
      .map(line => line.split('\t'))
      .map(record => record[9])
      .filter(read => read !== undefined)
      .map(read => read.length)
      .reduce((acc, cur) => acc + cur)

    if (readsRemaining < 0) {
      break;
    }
  }

  return totalReadLength / readsCollected;
}

async function getReadsFromRef(samtoolsRpc, bamFile, baiFile, ref, maxReads) {

  const step = 100000;

  let allReads = [];

  for (let i = 0; i < ref.seqLength; i += step) {

    const view = await samtoolsRpc.call('view', {
      bamFile,
      baiFile,
      refName: ref.refSeqName,
      start: i,
      end: i + step,
    });

    const reads = view.split('\n');
    allReads = [...allReads, ...reads];

    if (allReads.length > maxReads) {
      break;
    }
  }

  return allReads;
}
