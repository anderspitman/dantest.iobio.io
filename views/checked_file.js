const CheckedFileView = (title) => {
  
  const dom = document.createElement('div');
  dom.classList.add('checked-file-view');

  const titleEl = document.createElement('span');
  titleEl.innerText = title + " file: please select one";
  dom.appendChild(titleEl);

  //const filenameEl = document.createElement('div');
  //filenameEl.innerText = file.name + ": ";
  //dom.appendChild(filenameEl);

  function onStateChange(state) {
    console.log("changy");
    titleEl.innerText = title + " file: " + state.filename;
  }

  return {
    dom,
    onStateChange,
  };
};

export { CheckedFileView };
