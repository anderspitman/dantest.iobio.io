const ChromosomeReport = (idxstats, readLength) => {

  const dom = document.createElement('div');
  dom.classList.add('qual-iobio-report');

  const table = document.createElement('table');
  table.classList.add('qual-iobio-report__table');
  dom.appendChild(table);

  table.innerHTML = `<tr class='qual-iobio-report__row'>
    <th colspan='10' class='qual-iobio-report__cell'>
      Chromosome Breakdown
    </th>
  </tr>`;

  const headerEl = document.createElement('tr');
  headerEl.classList.add('qual-iobio-report__row');
  table.appendChild(headerEl);

  headerEl.innerHTML = `
    <th class='qual-iobio-report__cell'>
      Chr/DNA
    </th>
    <th class='qual-iobio-report__cell'>
      Len in model (bp)
    </th>
    <th class='qual-iobio-report__cell'>
      # Mapped
    </th>
    <th class='qual-iobio-report__cell'>
      # Unmapped
    </th>
    <th class='qual-iobio-report__cell'>
      Mapped GBases
    </th>
    <th class='qual-iobio-report__cell'>
      Avg Read Depth
    </th>
  `;

  for (const chr of idxstats) {
    if (chr.seqLength > 1e7) {
      const row = Row(chr, readLength);
      table.appendChild(row);
    }
  }

  return dom;
};

const Row = (chr, readLength) => {
  const dom = document.createElement('tr');
  dom.classList.add('qual-iobio-report__row');

  const avgReadDepth = (chr.numMapped * readLength) / chr.seqLength;
  const mappedGbase = (chr.numMapped * readLength) / 1e9;

  dom.innerHTML = `
    <td class='qual-iobio-report__cell'>
      ${chr.refSeqName}
    </td>
    <td class='qual-iobio-report__cell'>
      ${chr.seqLength}
    </td>
    <td class='qual-iobio-report__cell'>
      ${chr.numMapped}
    </td>
    <td class='qual-iobio-report__cell'>
      ${chr.numUnmapped}
    </td>
    <td class='qual-iobio-report__cell'>
      ${mappedGbase.toFixed(2)}
    </td>
    <td class='qual-iobio-report__cell avg-read-depth'>
      ${avgReadDepth.toFixed(0)}x
    </td>
  `;

  const goodColor = '#c8ffc8';
  const warningColor = '#ffc8c8';

  const avgReadDepthEl = dom.querySelector('.avg-read-depth');
  avgReadDepthEl.style.backgroundColor = avgReadDepth.toFixed(0) >= 30 ? goodColor : warningColor;

  return dom;
};

export { ChromosomeReport };
