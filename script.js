document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

function initializeRangeControl(name) {
    const slider = document.getElementById(name);
    const valueElement = document.getElementById(name + '-value');

    // Update the text box value when the slider value changes
    slider.addEventListener('input', () => {
        valueElement.value = slider.value;
    });

    // Update the slider value when the text box value changes
    valueElement.addEventListener('input', () => {
        // Parse the value to ensure it's within the slider's range
        let parsedValue = parseFloat(valueElement.value);
        if (parsedValue < parseFloat(slider.min)) {
            parsedValue = parseFloat(slider.min);
        } else if (parsedValue > parseFloat(slider.max)) {
            parsedValue = parseFloat(slider.max);
        }
        // Update the slider value
        slider.value = parsedValue;
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
  initializeRangeControl('EQ5DIndex');
  initializeRangeControl('painLevelLeg');
  initializeRangeControl('painLevelBack');
  initializeRangeControl('ODI');
});
