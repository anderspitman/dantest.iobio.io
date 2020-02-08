const ReportView = (readLength, rawGBases, ratioMapped, mappedAvgReadDepth) => {
  const dom = document.createElement('div');
  dom.classList.add('dantest-report-view');

  dom.innerHTML = `
    <div class='dantest-report'>
      <table class='dantest-report__table'>
        <tr class='dantest-report__row'>
          <th class='dantest-report__cell'>
            Item
          </th>
          <th class='dantest-report__cell'>
            Value
          </th>
          <th class='dantest-report__cell'>
            Expected
          </th>
        </tr>
        <tr class='dantest-report__row read-length'>
          <td class='dantest-report__cell'>
            Read Length
          </td>
          <td class='dantest-report__cell'>
            ${readLength.toFixed(2)}
          </td>
          <td class='dantest-report__cell'>
            Usually about 100, 150, etc
          </td>
        </tr>
        <tr class='dantest-report__row raw-gbases'>
          <td class='dantest-report__cell'>
            Raw GBases
          </td>
          <td class='dantest-report__cell'>
            ${rawGBases.toFixed(2)}
          </td>
          <td class='dantest-report__cell'>
            >90; less than 90 and Dante will re-sequence
          </td>
        </tr>
        <tr class='dantest-report__row ratio-mapped'>
          <td class='dantest-report__cell'>
            % Mapped
          </td>
          <td class='dantest-report__cell'>
            ${(ratioMapped * 100).toFixed(2)}
          </td>
          <td class='dantest-report__cell'>
            Looking for 95% or higher usually
          </td>
        </tr>
        <tr class='dantest-report__row mapped-avg-read-depth'>
          <td class='dantest-report__cell'>
            Mapped Avg Read Depth
          </td>
          <td class='dantest-report__cell'>
            ${mappedAvgReadDepth.toFixed(2)}
          </td>
          <td class='dantest-report__cell'>
            Preferably >30 (the real source of the 30x declaration)
          </td>
        </tr>
      </table>
    </div>
  `;

  const goodColor = '#c8ffc8';
  const warningColor = '#ffc8c8';

  const readLengthEl = dom.querySelector('.read-length');
  readLengthEl.style.backgroundColor = readLength && readLength !== NaN && readLength > 0 ? goodColor : warningColor;

  const rawGbasesEl = dom.querySelector('.raw-gbases');
  rawGbasesEl.style.backgroundColor = rawGBases >= 90 ? goodColor : warningColor;

  const ratioMappedEl = dom.querySelector('.ratio-mapped');
  ratioMappedEl.style.backgroundColor = ratioMapped >= 0.95 ? goodColor : warningColor;

  const mappedAvgReadDepthEl = dom.querySelector('.mapped-avg-read-depth');
  mappedAvgReadDepthEl.style.backgroundColor = mappedAvgReadDepth >= 30 ? goodColor : warningColor;

  return dom;
};

export { ReportView };
