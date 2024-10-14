function renderDeltas(initialValue, deltas) {
    // Calculate the target value as the sum of the initial value and all deltas
    const targetValue = initialValue + deltas.reduce((acc, delta) => acc + delta, 0);

    // Get the top and bottom bars
    const topBar = document.getElementById('top-bar');
    const bottomBar = document.getElementById('bottom-bar');

    // Set the widths of the bars based on initial and target values
    topBar.style.width = `${initialValue * 100}%`; // Top bar reflects the initial value (as percentage)
    bottomBar.style.width = `${targetValue * 100}%`; // Bottom bar reflects the target value (as percentage)

    // Get the arrows container
    const arrowsContainer = document.getElementById('arrows-container');

    // Clear the container before rendering
    arrowsContainer.innerHTML = '';

    // Create an array of all deltas, filtering out zero values
    const allDeltas = [...deltas].filter(delta => delta !== 0);

    // Set the height of the SVG container based on the number of deltas
    const rowHeight = 30; // Height for each row
    const svgHeight = allDeltas.length * rowHeight; // Total height based on the number of rows
    arrowsContainer.setAttribute('height', svgHeight); // Set the height of the SVG

    // Update widths and content for each delta
    allDeltas.forEach((delta) => {
        // Create a new row for each arrow
        const arrowRow = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Set the maximum width of the SVG container
        const maxArrowWidth = arrowsContainer.clientWidth; // Max width in pixels
        const arrowWidth = Math.abs(delta) * maxArrowWidth; // Set width based on delta and max width

        // Create an SVG line for the arrow
        const arrowLine = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // Center the arrow horizontally
        const startY = rowHeight / 2; // Center vertically in the SVG row
        const rowIndex = arrowsContainer.childElementCount; // Get current row index
        const startX = (maxArrowWidth - arrowWidth) / 2; // Center arrow horizontally

        // Check if delta is negative and adjust positions accordingly
        const isNegative = delta < 0;
        const endX = isNegative ? startX - arrowWidth : startX + arrowWidth; // Adjust end position for negative delta

        // Arrow path with a simple line and head
        const arrowPath = isNegative
            ? `M ${startX},${startY}
               L ${endX},${startY}
               M ${endX},${startY}
               L ${endX + 10},${startY - 5}
               M ${endX},${startY}
               L ${endX + 10},${startY + 5}`
            : `M ${startX},${startY}
               L ${endX},${startY}
               M ${endX},${startY}
               L ${endX - 10},${startY - 5}
               M ${endX},${startY}
               L ${endX - 10},${startY + 5}`;

        // Set attributes for the arrow line
        arrowLine.setAttribute("d", arrowPath);
        arrowLine.setAttribute("class", "arrow");
        arrowLine.setAttribute("stroke", "black"); // Use black for all arrows
        arrowLine.setAttribute("stroke-width", "2");
        arrowLine.setAttribute("fill", "none");

        // Position the arrow row based on its index
        arrowRow.setAttribute("transform", `translate(0, ${rowIndex * rowHeight})`); // Set spacing between rows

        // Append arrow line to the arrow row
        arrowRow.appendChild(arrowLine);

        // Append arrow row to the arrows container
        arrowsContainer.appendChild(arrowRow);
    });
}

// Call the function with the initial value and an array of deltas
document.addEventListener("DOMContentLoaded", () => {
    renderDeltas(0.7, [0.2, -0.15, 0.05]); // Delta values
});
