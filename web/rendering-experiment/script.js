function renderDeltas(initialValue, deltas) {
    const targetValue = initialValue + deltas.reduce((acc, delta) => acc + delta, 0);
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    addAxisTicks(tableBody, 400);
    addRow(tableBody, 'Initial Value', initialValue, true);
    deltas.forEach((delta, index) => {
        addRow(tableBody, `Delta ${index + 1}`, delta, false);
    });
    addRow(tableBody, 'Sum', targetValue, true);
}

function addAxisTicks(tableBody, containerWidth) {
  const row = document.createElement('tr');
  const emptyCell = document.createElement('td');
  row.appendChild(emptyCell);
  const ticksCell = document.createElement('td');
  ticksCell.className = 'ticksCell';

  function addTicks(texts) {
    // Append all text elements to the container first
    texts.forEach(({ text }) => {
      const textElement = document.createElement("span");
      textElement.textContent = text;
      textElement.style.position = "absolute";
      textElement.style.left = '0px'; // Set temporarily for width calculation
      ticksCell.appendChild(textElement);
    });

    // After all elements are in the DOM, measure and position them inside a single requestAnimationFrame
    window.requestAnimationFrame(() => {
      const containerWidth = ticksCell.offsetWidth;  // Get container width

      // Get all the child elements inside ticksCell (these are the spans we added)
      const children = ticksCell.querySelectorAll('span');

      texts.forEach(({ align, position }, index) => {
        const textElement = children[index];
        const xPos = position * containerWidth;
        const textWidth = textElement.offsetWidth;  // Get the actual width of the text

        // Align the text (left, middle, right)
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

  addTicks([
    { text: "Tveksam/missnöjd", align: "left", position: 0 },
    { text: "Nöjd", align: "right", position: 1 }
  ]);

  row.appendChild(ticksCell);
  tableBody.appendChild(row);
}

function addRow(tableBody, label, value, isBar) {
    // Create a new row
    const row = document.createElement('tr');

    // Create the label cell
    const labelCell = document.createElement('td');
    labelCell.className = 'labelCell';
    labelCell.textContent = label;
    row.appendChild(labelCell);

    // Create the value cell
    const valueCell = document.createElement('td');
    valueCell.className = 'graphicalCell';

    if (isBar) {
        // Create a div for the light gray bar
        const valueDiv = document.createElement('div');
        valueDiv.className = 'bar'; // Apply the bar class

        // Set the width of the bar based on value (percentage)
        const widthPercentage = Math.abs(value) * 100; // Assuming value is a proportion (0 to 1)
        valueDiv.style.width = `${widthPercentage}%`;

        valueCell.appendChild(valueDiv); // Append bar directly
    } else {
        // Create an SVG for the arrow representation
        const arrowSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const arrowHeight = 30; // Height for the arrow row
        arrowSVG.setAttribute("width", "100%"); // Full width for SVG
        arrowSVG.setAttribute("height", arrowHeight);

        // Calculate endX based on the value and a maximum width of 400px
        const endX = 400 * Math.abs(value); // Max width for arrows based on value

        // Center the arrow by calculating startX so that the arrow is centered within the 400px cell
        const startX = (400 - endX) / 2; // Center the arrow

        // Create the arrow line
        const arrowLine = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // Define the arrow path based on positive or negative value
        const isNegative = value < 0;
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

        // Append the arrow line to the SVG
        arrowSVG.appendChild(arrowLine);

        // Append the SVG to the value cell
        valueCell.appendChild(arrowSVG);
    }

    // Append value cell to the row
    row.appendChild(valueCell);

    // Append the row to the table body
    tableBody.appendChild(row);
}

// Call the function with the initial value and an array of deltas
document.addEventListener("DOMContentLoaded", () => {
    renderDeltas(0.7, [0.2, -0.15, 0.05]); // Delta values
});

