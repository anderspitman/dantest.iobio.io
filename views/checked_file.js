const CheckedFileView = (title) => {
  
  const dom = document.createElement('div');
  dom.classList.add('checked-file-view');

  const titleEl = document.createElement('span');
  titleEl.innerText = title + " file: drag here or select below";
  dom.appendChild(titleEl);

  //const filenameEl = document.createElement('div');
  //filenameEl.innerText = file.name + ": ";
  //dom.appendChild(filenameEl);

  function onStateChange(state) {
    titleEl.innerText = title + " file: " + state.filename;
  }

  return {
    dom,
    onStateChange,
  };
};

export { CheckedFileView };
