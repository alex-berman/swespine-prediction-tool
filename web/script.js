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

function getAddendForScalar(varName) {
  return parseFloat(document.getElementById(varName).value) * satisfaction_disc_herniation_coefs[varName];
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

function updatePrediction() {
  var logOdds = satisfaction_disc_herniation_coefs.Intercept;
  logOdds += getAddendForScalar('AgeAtSurgery');
  logOdds += getAddendForScalar('EQ5DIndex');
  logOdds += getAddendForScalar('ODI');
  logOdds += getAddendForScalar('NRSBackPain');
  logOdds += getAddendForNominal('Female');
  logOdds += getAddendForNominal('IsPreviouslyOperated');
  logOdds += getAddendForNominal('IsSmoker');
  logOdds += getAddendForNominal('IsUnemployed');
  logOdds += getAddendForNominal('HasAgePension');
  logOdds += getAddendForNominal('HasSickPension');
  logOdds += getAddendForNominal('HasOtherIllness');
  logOdds += getAddendForNominal('AbilityWalking');
  logOdds += getAddendForNominal('DurationBackPain');
  logOdds += getAddendForNominal('DurationLegPain');
  var prob = 1 / (1 + Math.exp(-logOdds));
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
  Plotly.newPlot('featureContributions', {
    data: [{
      y: [
        'totalt (89%)',
        'äldre än genomsnittet',
        'kvinna',
        'genomsnittlig<br />diskbråckspatient (86%)',
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