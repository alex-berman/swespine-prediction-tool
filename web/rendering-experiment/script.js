function renderDeltas(initialValue, deltas, ticks, colors, colorSteps) {
  function generateGradient() {
    var result = 'linear-gradient(to right';
    for(let i = 0; i < colors.length; i++) {
      const color = colors[i];
      result += `, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`;
      result += ` ${Math.round(100 * colorSteps[i])}%`;
    }
    result += ')';
    return result;
  }

  const targetValue = initialValue + deltas.reduce((acc, delta) => acc + delta, 0);
  const gradient = generateGradient();
  const tableBody = document.getElementById('localExplanationsTableBody');

  function addAxisTicks() {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    row.appendChild(emptyCell);
    const ticksCell = document.createElement('td');
    ticksCell.className = 'ticksCell';

    function addTicks(texts) {
      texts.forEach(({ text }) => {
        const textElement = document.createElement("span");
        textElement.textContent = text;
        textElement.style.position = "absolute";
        textElement.style.left = '0px';
        ticksCell.appendChild(textElement);
      });

      window.requestAnimationFrame(() => {
        const containerWidth = ticksCell.offsetWidth;
        const children = ticksCell.querySelectorAll('span');

        texts.forEach(({ align, position }, index) => {
          const textElement = children[index];
          const xPos = position * containerWidth;
          const textWidth = textElement.offsetWidth;

          if (align === "left") {
            textElement.style.left = `${xPos}px`;
          } else if (align === "middle") {
            textElement.style.left = `${xPos - textWidth / 2}px`;
          } else if (align === "right") {
            textElement.style.left = `${Math.min(xPos - textWidth, containerWidth - textWidth)}px`;
          }
        });
      });
    }

    addTicks(ticks);

    row.appendChild(ticksCell);
    tableBody.appendChild(row);
  }

  function addRow(label, value, isProbability) {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.className = 'labelCell';
      labelCell.textContent = label;
      row.appendChild(labelCell);
      const contentCell = document.createElement('td');
      contentCell.className = 'contentCell';

      if (isProbability) {
          contentCell.style.background = gradient;
          const valueDiv = document.createElement('div');
          valueDiv.className = 'probabilityMarker';
          const relativeWidth = 0.1;
          valueDiv.style.width = `${Math.round(relativeWidth * 100)}%`;
          valueDiv.style.position = 'relative';
          valueDiv.style.left = `${Math.round(value * (1 - relativeWidth) * 100)}%`;
          valueDiv.innerHTML = `${Math.round(value * 100)}%`;
          contentCell.appendChild(valueDiv);
      } else {
        const line = document.createElement('div');
        line.className = 'verticalLine';
        contentCell.appendChild(line);

        const bar = document.createElement('div');
        bar.className = 'bar';
        const containerWidth = 400;
        const halfWidth = containerWidth / 2;
        const barWidth = Math.abs(value) * halfWidth;
        bar.style.width = `${barWidth}px`;
        if(value < 0) {
          bar.style.left = `${halfWidth - barWidth}px`;
        } else {
          bar.style.left = `${halfWidth}px`;
        }
        contentCell.appendChild(bar);
      }

      row.appendChild(contentCell);
      tableBody.appendChild(row);
  }

  tableBody.innerHTML = '';
  addAxisTicks();
  addRow('Initial Value', initialValue, true);
  deltas.forEach((delta, index) => {
      addRow(`Delta ${index + 1}`, delta, false);
  });
  addRow('Sum', targetValue, true);
}

// Call the function with the initial value and an array of deltas
document.addEventListener("DOMContentLoaded", () => {
  const ticks = [
    { text: "Tveksam/missnöjd", align: "left", position: 0 },
    { text: "Nöjd", align: "right", position: 1 },
  ];
  const colors = [
    [243, 126, 119],
    [77, 200, 129],
  ];
  const colorSteps = [
    0,
    1,
  ];
  renderDeltas(0.7, [0.2, -0.15, 0.05], ticks, colors, colorSteps);
});

