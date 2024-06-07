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

    slider.addEventListener('input', () => {
        valueElement.value = slider.value;
    });

    valueElement.addEventListener('input', () => {
        let parsedValue = parseFloat(valueElement.value);
        if (parsedValue < parseFloat(slider.min)) {
            parsedValue = parseFloat(slider.min);
        } else if (parsedValue > parseFloat(slider.max)) {
            parsedValue = parseFloat(slider.max);
        }
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

var predictedProbPerc;
var predictedLogOdds;
var regressorValues;

function updatePrediction() {
  var regressorValues = getRegressorValuesFromForm();
  predictedLogOdds = getLogOdds(regressorValues);
  predictedProbPerc = Math.round(logOddsToProb(predictedLogOdds) * 100);
  document.getElementById('prediction').innerHTML = predictedProbPerc + '%';
}

document.addEventListener('DOMContentLoaded', (event) => {
  initializeRangeControl('EQ5DIndex');
  initializeRangeControl('NRSLegPain');
  initializeRangeControl('NRSBackPain');
  initializeRangeControl('ODI');
  initializeCollapsibles();

  function handleInputChange(event) {
    updatePrediction();
    plotFeatureContributions();
  }
  var formElements = document.querySelectorAll("input, select");
  formElements.forEach(function(element) {
      element.addEventListener("input", handleInputChange);
  });

  updatePrediction();
  plotFeatureContributions();
  generateGlobalExplanationTable();
});

function initializeCollapsibles() {
  initializeCollapsible('local-explanation');
  initializeCollapsible('global-explanation');
}

function initializeCollapsible(id) {
    const toggleClickable = document.getElementById('toggle-clickable-' + id);
    const toggleButton = document.getElementById('toggle-button-' + id);
    const collapsibleContent = document.getElementById('collapsible-content-' + id);
    const collapsibleContainer = document.getElementById('collapsible-container-' + id);

    toggleClickable.addEventListener('click', function() {
        if (collapsibleContainer.style.maxHeight === '0px' || collapsibleContainer.style.maxHeight === '') {
            collapsibleContainer.style.maxHeight = collapsibleContent.scrollHeight + 'px';
            toggleButton.innerHTML = '&ndash;';
        } else {
            collapsibleContainer.style.maxHeight = '0px';
            toggleButton.innerHTML = '+';
        }
    });

    // Initialize with collapsed state
    collapsibleContainer.style.maxHeight = '0px';
};

function getLogOddsDeltas(reference, comparison) {
  var result = {};
  for(const key in satisfaction_disc_herniation_coefs) {
    var delta = 0;
    if(key != 'Intercept') {
      var coef = satisfaction_disc_herniation_coefs[key];
      if(Array.isArray(coef)) {
        for(var i = 0; i < coef.length; i++) {
          delta += coef[i] * (comparison[key][i] - reference[key][i]);
        }
      }
      else {
        delta = coef * (comparison[key] - reference[key]);
      }
    }
    if(delta != 0) {
      result[key] = delta;
    }
  }
  return result;
}

function getCheckedValue(name) {
  var i = 0;
  while(true) {
    var element = document.getElementById(name + i);
    if(element == null) {
      return null;
    }
    if(element.checked) {
      return i;
    }
    i++;
  }
}

function getLabelByFor(forId) {
  const labels = document.querySelectorAll("label");
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const labelFor = label.getAttribute("for");
    if (labelFor === forId) {
      return label;
    }
  }
}

function getCheckedLabel(name) {
  const checkedValue = getCheckedValue(name);
  const labelElement = getLabelByFor(name + checkedValue);
  return labelElement.innerHTML;
}

function getNominalValue(regressor, valuesForAllRegressors) {
  const values = valuesForAllRegressors[regressor];
  for(var i = 0; i < values.length; i++) {
    if(values[i] == 1) {
      return i + 1;
    }
  }
  return 0;
}

function getNominalLabel(regressor) {
  if(regressor == 'AbilityWalking') { return 'Promenadsträcka'; }
  if(regressor == 'DurationLegPain') { return 'Smärtduration i ben'; }
  if(regressor == 'DurationBackPain') { return 'Smärtduration i rygg'; }
}

function toLeadingLowercase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function generateAdjective(isLow, name) {
  return isLow ? 'kort' : 'lång';
}

function generateFeatureDescription(regressor, delta) {
  var coef = satisfaction_disc_herniation_coefs[regressor];
  if(Array.isArray(coef)) {
    if(coef.length == 1) {
      if(regressor == 'Female') {
        return getCheckedLabel(regressor);
      }
      else {
        const value = getCheckedValue(regressor);
        if(regressor == 'IsUnemployed') { return value ? 'Arbetslös' : 'Inte arbetslös'; }
        if(regressor == 'HasSickPension') { return value ? 'Sjukpension' : 'Ingen sjukpension'; }
        if(regressor == 'HasAgePension') { return value ? 'Ålderspension' : 'Ingen ålderspension'; }
        if(regressor == 'IsSmoker') { return value ? 'Rökare' : 'Inte rökare'; }
        if(regressor == 'IsPreviouslyOperated') { return value ? 'Tidigare ryggop' : 'Inte tidigare ryggop'; }
        if(regressor == 'HasOtherIllness') { return value ? 'Samsjuklighet' : 'Ingen samsjuklighet'; }
      }
    }
    else if(coef.length > 1) {
      meanValue = getNominalValue(regressor, mean_disc_herniation);
      value = getNominalValue(regressor, regressorValues);
      const label = getNominalLabel(regressor);
      return 'Relativt ' + generateAdjective(value < meanValue, regressor) + '<br />' + toLeadingLowercase(label);
    }
  }
  else {
    logOddsDelta = delta / coef;
    if(regressor == 'AgeAtSurgery') {
      return 'Relativt ' + (logOddsDelta < 0 ? 'låg' : 'hög') + ' ålder';
    }
    if(regressor == 'EQ5DIndex') {
      return 'Relativt ' + (logOddsDelta < 0 ? 'låg' : 'hög') + ' EQ5D';
    }
    if(regressor == 'ODI') {
      return 'Relativt ' + (logOddsDelta < 0 ? 'låg' : 'hög') + '<br />funktionsnedsättning';
    }
    if(regressor == 'NRSBackPain') {
      return 'Relativt ' + (logOddsDelta < 0 ? 'lite' : 'mycket') + ' ryggsmärta';
    }
  }
}

const sortByValue = (obj) => {
  const entries = Object.entries(obj);
  entries.sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
  return Object.fromEntries(entries);
};

function plotFeatureContributions() {
  var meanLogOdds = getLogOdds(mean_disc_herniation);
  var meanProbPerc = Math.round(logOddsToProb(meanLogOdds) * 100);
  regressorValues = getRegressorValuesFromForm();
  var logOddsDeltas = sortByValue(getLogOddsDeltas(mean_disc_herniation, regressorValues));
  var y = ['Sammanlagd<br />förutsägelse: <b>' + predictedProbPerc + '%</b>'];
  var x = [predictedLogOdds];
  for(const regressor in logOddsDeltas) {
    var delta = logOddsDeltas[regressor];
    y.push(generateFeatureDescription(regressor, delta));
    x.push(delta);
  }
  y.push('Genomsnittlig<br />diskbråckspatient: ' + meanProbPerc + '%');
  x.push(meanLogOdds);
  Plotly.newPlot('featureContributions', {
    data: [{
      y: y,
      x: x,
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

function formElementRangeSize(name) {
  var rangeElement = document.getElementById(name);
  return rangeElement.max - rangeElement.min;
}

function generateGlobalExplanationTable() {
  const coefs = satisfaction_disc_herniation_coefs;
  let content = '<table>';

  function addRow(header, cellContent) {
    content += '<tr>';
    content += '<td class="tableHeader">' + header + '</td>';
    content += '<td class="tableContent">' + cellContent + '</td>';
    content += '</tr>';
  }

  function addNominal(header, name) {
    addRow(
      header,
      generateOptionNounPhrase(name, getIndexOfMaxCoef(name)) + ' bedöms ha högst sannolikhet att bli nöjda. ' +
      generateOptionNounPhrase(name, getIndexOfMinCoef(name)) + ' bedöms ha lägst sannolikhet att bli nöjda. ' +
      'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefsGroupRangeSize(coefs[name])) + '.');
  }

  function coefToPercentageDelta(coef, digits) {
    let formattedFloat = Math.abs(coef / 4 * 100).toFixed(digits);
    return '<b>' + formattedFloat + '</b> ' + (formattedFloat.endsWith('1') ? 'procentenhet' : 'procentenheter');
  }

  function getIndexOfMaxCoef(name) {
    let coefsToCompare = [0].concat(coefs[name]);
    return coefsToCompare.reduce((maxIndex, currentValue, currentIndex, array) => {
      return currentValue > array[maxIndex] ? currentIndex : maxIndex;
    }, 0);
  }

  function getIndexOfMinCoef(name) {
    let coefsToCompare = [0].concat(coefs[name]);
    return coefsToCompare.reduce((maxIndex, currentValue, currentIndex, array) => {
      return currentValue < array[maxIndex] ? currentIndex : maxIndex;
    }, 0);
  }

  function generateOptionNounPhrase(name, optionIndex) {
    if(name == 'AbilityWalking') {
      let optionText = document.getElementById(name).options[optionIndex].innerHTML;
      return 'Patienter som kan gå ' + toLeadingLowercase(optionText);
    }
    if(name == 'DurationLegPain' || name == 'DurationBackPain') {
      if(optionIndex == 0) {
        return 'Patienter utan smärta';
      }
      else {
        let optionText = document.getElementById(name).options[optionIndex].innerHTML;
        return 'Patienter som upplevt smärta i ' + toLeadingLowercase(optionText);
      }
    }
  }

  function coefsGroupRangeSize(coefsGroup) {
    let coefsToCompare = [0].concat(coefsGroup);
    return Math.max(...coefsToCompare) - Math.min(...coefsToCompare);
  }
  
  addRow(
    'Ålder',
    'Ju högre ålder, desto ' + (coefs.AgeAtSurgery < 0 ? 'lägre' : 'högre') + ' bedöms sannolikheten att bli nöjd. ' +
    'Som mest påverkas sannolikheten med ' + coefToPercentageDelta(coefs.AgeAtSurgery*10, 1) + ' per tiotal år.');
  addRow(
    'Kön',
    'Kvinnor bedöms ha ' + (coefs.Female < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden mellan kvinnor och män kan vara upp till ' + coefToPercentageDelta(coefs.Female) + '.');
  addRow(
    'Tidigare ryggop',
    'Patienter som tidigare ryggopererats bedöms ha ' + (coefs.IsPreviouslyOperated < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.IsPreviouslyOperated) + '.');
  addRow(
    'Rökare',
    'Rökare bedöms ha ' + (coefs.IsSmoker < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.IsSmoker) + '.');
  addRow(
    'Arbetslös',
    'Arbetslösa bedöms ha ' + (coefs.IsUnemployed < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.IsUnemployed) + '.');
  addRow(
    'Ålderspension',
    'Patienter med ålderspension bedöms ha ' + (coefs.HasAgePension < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.HasAgePension) + '.');
  addRow(
    'Sjukpension',
    'Patienter med sjukpension bedöms ha ' + (coefs.HasSickPension < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.HasSickPension) + '.');
  addRow(
    'Samsjuklighet',
    'Patienter med andra sjukdomar bedöms ha ' + (coefs.HasOtherIllness < 0 ? 'lägre' : 'högre') + ' sannolikhet att bli nöjda. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.HasOtherIllness) + '.');
  addRow(
    'EQ5D',
    'Ju högre EQ5D, desto ' + (coefs.EQ5DIndex < 0 ? 'lägre' : 'högre') + ' bedöms sannolikheten att bli nöjd. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.EQ5DIndex * formElementRangeSize('EQ5DIndex')) + '.');
  addNominal('Promenadsträcka', 'AbilityWalking');
  addNominal('Smärtduration i ben', 'DurationLegPain');
  addNominal('Smärtduration i rygg', 'DurationBackPain');
  addRow(
    'Smärta i rygg',
    'Ju mer ryggsmärta, desto ' + (coefs.NRSBackPain < 0 ? 'lägre' : 'högre') + ' bedöms sannolikheten att bli nöjd. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.NRSBackPain * formElementRangeSize('NRSBackPain')) + '.');
  addRow(
    'Funktionsnedsättning',
    'Ju högre funktionsnedsättning, desto ' + (coefs.ODI < 0 ? 'lägre' : 'högre') + ' bedöms sannolikheten att bli nöjd. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.ODI * formElementRangeSize('ODI')) + '.');

  content += '</table>';
  const table = document.getElementById('globalExplanationTable');
  table.innerHTML = content;
}