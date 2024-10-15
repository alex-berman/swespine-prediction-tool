function renderDeltas(initialValue, deltas) {
    // Calculate the target value as the sum of the initial value and all deltas
    const targetValue = initialValue + deltas.reduce((acc, delta) => acc + delta, 0);

    // Get the table body where rows will be added
    const tableBody = document.getElementById('table-body');

    // Clear the table body before rendering
    tableBody.innerHTML = '';

    // Create a row for the initial value
    addRow(tableBody, 'Initial Value', initialValue, true); // Light gray bar

    // Create rows for each delta
    deltas.forEach((delta, index) => {
        addRow(tableBody, `Delta ${index + 1}`, delta, false); // Arrows for deltas
    });

    // Create a row for the sum
    addRow(tableBody, 'Sum', targetValue, true); // Light gray bar
}

function addRow(tableBody, label, value, isBar) {
    // Create a new row
    const row = document.createElement('tr');

    // Create the label cell
    const labelCell = document.createElement('td');
    labelCell.textContent = label;
    row.appendChild(labelCell);

    // Create the value cell
    const valueCell = document.createElement('td');

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
