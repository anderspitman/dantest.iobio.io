const FileChooserView = () => {
  
  const dom = document.createElement('div');
  dom.classList.add('file-chooser');

  const btnEl = document.createElement('button');
  btnEl.classList.add('file-chooser__btn');
  btnEl.innerText = 'Open file(s)';
  dom.appendChild(btnEl);

  const inputEl = document.createElement('input');
  inputEl.classList.add('file-chooser__input');
  inputEl.type = 'file';
  inputEl.multiple = true;
  dom.appendChild(inputEl);

  btnEl.addEventListener('click', (e) => {
    inputEl.click();
  });

  return { dom, fileInput: inputEl };
};

export { FileChooserView };
