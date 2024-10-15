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

  function addRow(label, value, isBar) {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.className = 'labelCell';
      labelCell.textContent = label;
      row.appendChild(labelCell);
      const graphicalCell = document.createElement('td');
      graphicalCell.className = 'graphicalCell';
      graphicalCell.style.background = gradient;

      if (isBar) {
          const valueDiv = document.createElement('div');
          valueDiv.className = 'bar';
          const widthPercentage = Math.abs(value) * 100;
          valueDiv.style.width = `${widthPercentage}%`;
          graphicalCell.appendChild(valueDiv);
      } else {
          const arrowSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          const arrowHeight = 30;
          arrowSVG.setAttribute("width", "100%");
          arrowSVG.setAttribute("height", arrowHeight);
          const endX = 400 * Math.abs(value);
          const isNegative = value < 0;
          const startX = isNegative ? 400/2 - endX : 400/2;

          const arrowLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const arrowPath = isNegative
              ? `M ${startX + endX},${arrowHeight / 2}
                 L ${startX},${arrowHeight / 2}
                 M ${startX},${arrowHeight / 2}
                 L ${startX + 10},${(arrowHeight / 2) - 5}
                 M ${startX},${arrowHeight / 2}
                 L ${startX + 10},${(arrowHeight / 2) + 5}`
              : `M ${startX},${arrowHeight / 2}
                 L ${startX + endX},${arrowHeight / 2}
                 M ${startX + endX},${arrowHeight / 2}
                 L ${startX + endX - 10},${(arrowHeight / 2) - 5}
                 M ${startX + endX},${arrowHeight / 2}
                 L ${startX + endX - 10},${(arrowHeight / 2) + 5}`;

          arrowLine.setAttribute("d", arrowPath);
          arrowLine.setAttribute("class", "arrow");
          arrowLine.setAttribute("stroke", "#fff");
          arrowLine.setAttribute("stroke-width", "3");
          arrowLine.setAttribute("fill", "none");

          arrowSVG.appendChild(arrowLine);

          graphicalCell.appendChild(arrowSVG);
      }

      row.appendChild(graphicalCell);
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

