import { FileView } from './views/file.js';

const contentEl = document.querySelector('.content');

const samtoolsWorker = new Worker('./file_handler_worker.js');

let bamFile = null;
let baiFile = null;

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
      samtoolsWorker.postMessage({
        jsonrpc: '2.0',
        method: 'idxstats',
        params: {
          bamFile,
          baiFile,
        }
      });
    }

    //const fileView = FileView(file);
    //contentEl.appendChild(fileView);
  }
});
