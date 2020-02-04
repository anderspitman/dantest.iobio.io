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

  const bitrateEl = document.createElement('div');
  dom.appendChild(bitrateEl);

  readFastq(file, function onProgress(ratio, megabytesPerSecond) {
    const percent = ratio*100;
    progressBarEl.value = percent;
    bitrateEl.innerText = megabytesPerSecond + " MB/s";
  });


  return dom;
};

export { FileView };
