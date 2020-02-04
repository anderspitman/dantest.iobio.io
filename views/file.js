import { readFastq } from '../fastq_reader.js';

const FileView = (file) => {
  
  const dom = document.createElement('div');
  dom.classList.add('dantest-file-view');

  const filenameEl = document.createElement('div');
  filenameEl.innerText = file.name + ": ";
  dom.appendChild(filenameEl);

  const progressBarEl = document.createElement('progress');
  progressBarEl.max = 100;
  progressBarEl.value = 0;
  dom.appendChild(progressBarEl);

  const progressTextEl = document.createElement('div');
  dom.appendChild(progressTextEl);

  const bitrateEl = document.createElement('div');
  dom.appendChild(bitrateEl);

  readFastq(file, function onProgress(bytes, megabytesPerSecond) {
    const ratio = bytes / file.size;
    const percent = ratio*100;
    progressBarEl.value = percent;
    progressTextEl.innerText = (bytes/1e6).toFixed(2) + "/" + (file.size/1e6).toFixed(2) + " MB";
    bitrateEl.innerText = megabytesPerSecond.toFixed(0) + " MB/s";
  });


  return dom;
};

export { FileView };
