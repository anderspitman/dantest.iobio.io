const ReportView = (readLength, rawGBases) => {
  const dom = document.createElement('div');
  dom.classList.add('dantest-report-view');

  dom.innerHTML = `
    <div>
      Read Length: ${readLength.toFixed(2)}
    </div>
    <div>
      Raw GBases: ${rawGBases.toFixed(2)}
    </div>
  `;

  return dom;
};

export { ReportView };
