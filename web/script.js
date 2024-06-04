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

function getAddendForNominal(varName) {
  var coefs = satisfaction_disc_herniation_coefs[varName];
  if(coefs.length == 1) {
    if(document.getElementById(varName + '1').checked) {
      return coefs[0];
    } else {
      return 0;
    }
  }
  else if(coefs.length > 1) {
    var element = document.getElementById(varName);
    for(let i = 0; i < coefs.length; i++) {
      if(element.options[i+1].selected) {
        return coefs[i];
      }
    }
    return 0;
  }
}

function getScalarValueFromForm(varName) {
  return parseFloat(document.getElementById(varName).value);
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function getNominalValuesFromForm(varName, n) {
  if(n == 1) {
    if(document.getElementById(varName + '1').checked) {
      return [1];
    } else {
      return [0];
    }
  }
  else if(n > 1) {
    var element = document.getElementById(varName);
    return range(n).map(function(i) { return element.options[i + 1].selected ? 1 : 0; })
  }
}

function getRegressorValuesFromForm() {
  result = {}
  for(const key in satisfaction_disc_herniation_coefs) {
    if(key != 'Intercept') {
      var coef = satisfaction_disc_herniation_coefs[key];
      if(Array.isArray(coef)) {
        result[key] = getNominalValuesFromForm(key, coef.length);
      }
      else {
        result[key] = getScalarValueFromForm(key);
      }
    }
  }
  return result;
}

function getLogOdds(regressorValues) {
  var result = 0;
  for(const key in satisfaction_disc_herniation_coefs) {
    var coef = satisfaction_disc_herniation_coefs[key];
    if(key == 'Intercept') {
      result += coef;
    }
    else {
      if(Array.isArray(coef)) {
        for(var i = 0; i < coef.length; i++) {
          result += coef[i] * regressorValues[key][i];
        }
      }
      else {
        result += coef * regressorValues[key];
      }
    }
  }
  return result;
}

function logOddsToProb(logOdds) {
  return 1 / (1 + Math.exp(-logOdds));
}

function updatePrediction() {
  var regressorValues = getRegressorValuesFromForm();
  console.log(regressorValues);
  var logOdds = getLogOdds(regressorValues);
  var prob = logOddsToProb(logOdds);
  var probPerc = Math.round(prob * 100);
  document.getElementById('prediction').innerHTML = probPerc + '%';
}

document.addEventListener('DOMContentLoaded', (event) => {
  initializeRangeControl('EQ5DIndex');
  initializeRangeControl('NRSLegPain');
  initializeRangeControl('NRSBackPain');
  initializeRangeControl('ODI');

  function handleInputChange(event) {
    updatePrediction();
  }
  var formElements = document.querySelectorAll("input, select");
  formElements.forEach(function(element) {
      element.addEventListener("input", handleInputChange);
  });

  updatePrediction();
  plotFeatureContributions();
});

function plotFeatureContributions() {
  var meanLogOdds = getLogOdds(mean_disc_herniation);
  var meanProbPerc = Math.round(logOddsToProb(meanLogOdds) * 100);
  Plotly.newPlot('featureContributions', {
    data: [{
      y: [
        'totalt (89%)',
        'äldre än genomsnittet',
        'kvinna',
        'genomsnittlig<br />diskbråckspatient (' + meanProbPerc + '%)',
      ],
      x: [
        1.9,
        -0.15,
        0.86,
        1.8208186,
      ],
      type: 'bar',
      orientation: 'h',
      marker: {
        color: '#C8A2C8',
        line: {
          width: 2.5
        }
      }
    }],
    layout: {
        margin: {
            t: 50,
            b: 50,
            l: 170,
            r: 50
        },
        xaxis: {
          showgrid: true,
          zeroline: true,
          visible: false
        },
        showlegend: false
    },
    config: {
        staticPlot: true,
        responsive: true
    }
  });
}