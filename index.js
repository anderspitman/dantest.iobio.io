import { ReportView } from './views/report.js';


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

let bamFile = null;
let baiFile = null;

const samtoolsRpc = new WorkerRPC('./samtools_worker.js');

const uppie = new Uppie();
uppie(document.querySelector('#file-input'), async (event, formData, files) => {

  for (const entry of formData.entries()) {

    const file = entry[1];

    if (file.name.endsWith('bam')) {
      bamFile = file;
    }

    if (file.name.endsWith('bai')) {
      baiFile = file;
    }

    if (bamFile && baiFile) {

      const idxstats = await samtoolsRpc.call('idxstats', {
        bamFile,
        baiFile,
      });

      let refName;
      for (const stat of idxstats) {
        if (stat.refSeqName === 'chr1') {
          refName = 'chr1';
          break;
        }
        if (stat.refSeqName === '1') {
          refName = '1';
          break;
        }
      }

      if (!refName) {
        alert("Missing chr1, which is needed for read length estimation");
      }

      const readLength = await samtoolsRpc.call('getReadLength', {
        bamFile,
        baiFile,
        refName,
      });
      console.log(readLength);

      const avgReadDepths = idxstats
        .map(stat => {
          const avgDepth = (stat.numMapped * readLength) / stat.seqLength;
          return {
            [stat.refSeqName]: avgDepth,
          };
        });

      console.log(idxstats);
      console.log(avgReadDepths);

      const stats = [];

      let totalMapped = 0;
      let totalUnmapped = 0;
      for (const stat of idxstats) {
        totalMapped += stat.numMapped;
        totalUnmapped += stat.numUnmapped;
      }

      const rawGBases = ((totalMapped + totalUnmapped) * readLength) / 1e9;
      console.log("Raw GBases: ", rawGBases);

      const reportView = ReportView(readLength, rawGBases);
      contentEl.appendChild(reportView);
    }
  }
});



