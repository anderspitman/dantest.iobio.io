import { FileView } from './views/file.js';

const contentEl = document.querySelector('.content');

const uppie = new Uppie();
uppie(document.querySelector('#file-input'), async (event, formData, files) => {

  for (const entry of formData.entries()) {

    const file = entry[1];

    console.log(file);

    const fileView = FileView(file);
    contentEl.appendChild(fileView);
  }
});
