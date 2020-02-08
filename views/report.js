const ReportView = (readLength, rawGBases) => {
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
            Notes
          </th>
        </tr>
        <tr class='dantest-report__row'>
          <td class='dantest-report__cell'>
            Read Length
          </td>
          <td class='dantest-report__cell'>
            ${readLength.toFixed(2)}
          </td>
          <td class='dantest-report__cell'>
            Detected from bam
          </td>
        </tr>
        <tr class='dantest-report__row'>
          <td class='dantest-report__cell'>
            Raw GBases
          </td>
          <td class='dantest-report__cell'>
            ${rawGBases.toFixed(2)}
          </td>
          <td class='dantest-report__cell'>
          </td>
        </tr>
      </table>
    </div>
  `;

  return dom;
};

export { ReportView };
