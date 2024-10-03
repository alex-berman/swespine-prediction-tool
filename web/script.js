QUESTIONNAIRE_CONTENT = {
  disc_herniation: {
    satisfaction: {
      question: "Hur är Din inställning till resultatet av Din genomgångna ryggoperation?",
      definition: "<li>Nöjd patient: <i>Nöjd</i><li>Missnöjd patient: <i>tveksam</i> eller <i>missnöjd</i>."
    },
    outcome: {
      question: "Hur är Din bensmärta/ischias idag jämfört med före operationen?",
      definition: "Lyckat utfall: <i>Helt försvunnen</i> eller <i>mycket förbättrad</i>"
    },
  }
}

function initializeContent() {
  var diagnosis = document.getElementById('diagnosis').value;
  for(const task of ['satisfaction', 'outcome']) {
    document.getElementById(`swespine_question_${task}`).innerHTML = QUESTIONNAIRE_CONTENT[
      diagnosis][task].question;
    document.getElementById(`swespine_definition_${task}`).innerHTML = QUESTIONNAIRE_CONTENT[
      diagnosis][task].definition;
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, precision) {
    return (Math.random() * (max - min) + min).toFixed(precision);
}

function setRandomValues() {
    document.querySelectorAll('select').forEach(select => {
        const options = select.options;
        const randomIndex = getRandomInt(0, options.length - 1);
        select.selectedIndex = randomIndex;
    });

    document.querySelectorAll('.radio-group').forEach(group => {
        const radios = group.querySelectorAll('input[type="radio"]');
        const randomIndex = getRandomInt(0, radios.length - 1);
        radios[randomIndex].checked = true;
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
        let min = input.min ? parseInt(input.min) : 50;
        let max = input.max ? parseInt(input.max) : 90;
        input.value = getRandomInt(min, max);
    });

    document.querySelectorAll('input[type="range"]').forEach(input => {
        let min = parseFloat(input.min);
        let max = parseFloat(input.max);
        input.value = getRandomFloat(min, max, 2);
        input.dispatchEvent(new Event('input'));
    });
}

function initializeTabs() {
  document.querySelectorAll('.tab-button-patient-data').forEach(button => {
      button.addEventListener('click', () => {
          document.querySelectorAll('.tab-button-patient-data').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          document.querySelectorAll('.tab-pane-patient-data').forEach(pane => pane.classList.remove('active'));
          document.getElementById(button.dataset.tab).classList.add('active');
      });
  });

  document.querySelectorAll('.tab-button-prediction').forEach(button => {
      button.addEventListener('click', () => {
          document.querySelectorAll('.tab-button-prediction').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          document.querySelectorAll('.tab-pane-prediction').forEach(pane => pane.classList.remove('active'));
          document.getElementById(button.dataset.tab).classList.add('active');
      });
  });
}

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

function getRegressorValuesFromForm(coefs) {
  result = {}
  for(const key in coefs) {
    if(key != 'Intercept') {
      var coef = coefs[key];
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

function getLogOdds(regressorValues, coefs) {
  var result = 0;
  for(const key in coefs) {
    var coef = coefs[key];
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

function updatePrediction(id, coefs) {
  var regressorValues = getRegressorValuesFromForm(coefs);
  var predictedLogOdds = getLogOdds(regressorValues, coefs);
  var predictedProbPerc = Math.round(logOddsToProb(predictedLogOdds) * 100);
  document.getElementById(`tab_prediction_${id}`).innerHTML = predictedProbPerc + '%';
  document.getElementById(`prediction_${id}`).innerHTML = predictedProbPerc + '%';
}

document.addEventListener('DOMContentLoaded', (event) => {
  initializeTabs();
  initializeRangeControl('EQ5DIndex');
  initializeRangeControl('NRSLegPain');
  initializeRangeControl('NRSBackPain');
  initializeRangeControl('ODI');
  setRandomValues();
  initializeCollapsibles();

  function handleInputChange(event) {
    updatePrediction('satisfaction', satisfaction_disc_herniation_coefs);
    plotFeatureContributions('satisfaction', satisfaction_disc_herniation_coefs);
    updatePrediction('outcome', outcome_disc_herniation_coefs);
    plotFeatureContributions('outcome', outcome_disc_herniation_coefs);
  }
  var formElements = document.querySelectorAll("input, select");
  formElements.forEach(function(element) {
      element.addEventListener("input", handleInputChange);
  });

  updatePrediction('satisfaction', satisfaction_disc_herniation_coefs);
  plotFeatureContributions('satisfaction', satisfaction_disc_herniation_coefs);
  generateGlobalExplanationTable('satisfaction', satisfaction_disc_herniation_coefs);
  updatePrediction('outcome', outcome_disc_herniation_coefs);
  plotFeatureContributions('outcome', outcome_disc_herniation_coefs);
  generateGlobalExplanationTable('outcome', outcome_disc_herniation_coefs);
});

function initializeCollapsibles() {
  initializeCollapsible('local-explanation-satisfaction');
  initializeCollapsible('global-explanation-satisfaction');
  initializeCollapsible('local-explanation-outcome');
  initializeCollapsible('global-explanation-outcome');
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

function getLogOddsDeltas(reference, comparison, coefs) {
  var result = {};
  for(const key in coefs) {
    var delta = 0;
    if(key != 'Intercept') {
      var coef = coefs[key];
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

function generateFeatureDescription(regressor, delta, coefs, regressorValues) {
  var coef = coefs[regressor];
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
      return 'Relativt ' + generateAdjective(value < meanValue, regressor) + ' ' + toLeadingLowercase(label);
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
      return 'Relativt ' + (logOddsDelta < 0 ? 'låg' : 'hög') + ' funktionsnedsättning';
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

function logOddsToColor(logOdds) {
  function hue() {
    if(logOdds < 0) {
      return 0; // red
    }
    return 120; // green
  }

  function hslToRgb(h, s, l) {
      s /= 100;
      l /= 100;

      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 60) {
          r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
      }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return `rgb(${r}, ${g}, ${b})`;
  }

  const lightness = 60;
  const saturation = 40;
  return hslToRgb(hue(), saturation, lightness);
}

function plotFeatureContributions(id, coefs) {
  const logOddsThreshold = 0.1; // Factors below this log odds delta get grouped under "Other factors"
  var meanLogOdds = getLogOdds(mean_disc_herniation, coefs);
  var meanProbPerc = Math.round(logOddsToProb(meanLogOdds) * 100);
  var regressorValues = getRegressorValuesFromForm(coefs);
  var logOddsDeltas = sortByValue(getLogOddsDeltas(mean_disc_herniation, regressorValues, coefs));

  function filterLogOddsDeltas(f) {
    return Object.fromEntries(Object.entries(logOddsDeltas).filter(f));
  }

  var logOddsDeltasAboveThreshold = filterLogOddsDeltas(([_, x]) => Math.abs(x) >= logOddsThreshold);
  var logOddsDeltasBelowThreshold = filterLogOddsDeltas(([_, x]) => Math.abs(x) < logOddsThreshold);
  var predictedLogOdds = getLogOdds(regressorValues, coefs);
  var predictedProbPerc = Math.round(logOddsToProb(predictedLogOdds) * 100);
  var colors = ['#eee'];
  var y = ['Sammanlagd förutsägelse: <b>' + predictedProbPerc + '%</b>'];
  var x = [predictedLogOdds];
  if(Object.values(logOddsDeltasBelowThreshold).length > 0) {
    var delta = Object.values(logOddsDeltasBelowThreshold).reduce((acc, curr) => acc + curr, 0);
    y.push('Övriga faktorer');
    x.push(delta);
    colors.push(logOddsToColor(delta, 30));
  }
  for(const regressor in logOddsDeltasAboveThreshold) {
    var delta = logOddsDeltas[regressor];
    y.push(generateFeatureDescription(regressor, delta, coefs, regressorValues));
    x.push(delta);
    colors.push(logOddsToColor(delta, 30));
  }
  y.push('Genomsnittlig diskbråckspatient: ' + meanProbPerc + '%');
  x.push(meanLogOdds);
  colors.push('#eee');

  const dividers = [
    {
      type: 'line',
      x0: -2,
      y0: 0.5,
      x1: 2,
      y1: 0.5,
      yref: 'y',
      xref: 'paper',
      line: {
        color: 'lightgray',
        width: 1
      }
    }
  ];
  if(y.length > 2) {
    dividers.push(
      {
        type: 'line',
        x0: -2,
        y0: y.length - 2 + 0.5,
        x1: 2,
        y1: y.length - 2 + 0.5,
        yref: 'y',
        xref: 'paper',
        line: {
          color: 'lightgray',
          width: 1
        }
      }
    )
  }
  Plotly.newPlot(`featureContributions_${id}`, {
    data: [{
      y: y,
      x: x,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: colors,
        line: {
          width: 2.5
        }
      }
    }],
    layout: {
        shapes: dividers,
        margin: {
            t: 50,
            b: 50,
            l: 250,
            r: 50
        },
        width: 500,
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

function generateGlobalExplanationTable(id, coefs) {
  let content = '<table>';

  var probabilityObjectSingular;
  var probabilityObjectPlural;
  if(id == 'satisfaction') {
    probabilityObjectSingular = 'att bli nöjd';
    probabilityObjectPlural = 'att bli nöjda';
  }
  else if(id == 'outcome') {
    probabilityObjectSingular = probabilityObjectPlural = 'för lyckat utfall';
  }

  function addRow(name, header, cellContent) {
    if(name in coefs) {
      content += '<tr>';
      content += '<td class="tableHeader">' + header + '</td>';
      content += '<td class="tableContent">' + cellContent + '</td>';
      content += '</tr>';
    }
  }

  function addNominal(header, name) {
    addRow(
      name,
      header,
      generateOptionNounPhrase(name, getIndexOfMaxCoef(name)) + ' beräknas ha högst sannolikhet ' + probabilityObjectPlural + '. ' +
      generateOptionNounPhrase(name, getIndexOfMinCoef(name)) + ' beräknas ha lägst sannolikhet ' + probabilityObjectPlural + '. ' +
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
    'AgeAtSurgery',
    'Ålder',
    'Ju ' + (coefs.AgeAtSurgery < 0 ? 'lägre' : 'högre') + ' ålder, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Sannolikheten påverkas med upp till ' + coefToPercentageDelta(coefs.AgeAtSurgery*10, 1) + ' per tiotal år.');
  addRow(
    'Female',
    'Kön',
    (coefs.Female < 0 ? 'Män' : 'Kvinnor') + ' beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden mellan kvinnor och män kan vara upp till ' + coefToPercentageDelta(coefs.Female) + '.');
  addRow(
    'IsPreviouslyOperated',
    'Tidigare ryggop',
    'Patienter som ' + (coefs.IsPreviouslyOperated < 0 ? 'inte' : '') + ' tidigare ryggopererats beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.IsPreviouslyOperated) + '.');
  addRow(
    'IsSmoker',
    'Rökare',
    (coefs.IsSmoker < 0 ? 'Icke-rökare' : 'rökare') + ' beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.IsSmoker) + '.');
  addRow(
    'IsUnemployed',
    'Arbetslös',
    (coefs.IsUnemployed < 0 ? 'Icke-arbetslösa' : 'Arbetslösa') + ' beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.IsUnemployed) + '.');
  addRow(
    'HasAgePension',
    'Ålderspension',
    'Patienter ' + (coefs.HasAgePension < 0 ? 'utan' : 'med') + ' ålderspension beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.HasAgePension) + '.');
  addRow(
    'HasSickPension',
    'Sjukpension',
    'Patienter ' + (coefs.HasSickPension < 0 ? 'utan' : 'med') + ' sjukpension beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.HasSickPension) + '.');
  addRow(
    'HasOtherIllness',
    'Samsjuklighet',
    'Patienter ' + (coefs.HasOtherIllness < 0 ? 'utan' : 'med') + ' andra sjukdomar beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.HasOtherIllness) + '.');
  addRow(
    'EQ5DIndex',
    'EQ5D',
    'Ju ' + (coefs.EQ5DIndex < 0 ? 'lägre' : 'högre') + ' EQ5D, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.EQ5DIndex * formElementRangeSize('EQ5DIndex')) + '.');
  addNominal('Promenadsträcka', 'AbilityWalking');
  addNominal('Smärtduration i ben', 'DurationLegPain');
  addNominal('Smärtduration i rygg', 'DurationBackPain');
  addRow(
    'NRSBackPain',
    'Smärta i rygg',
    'Ju ' + (coefs.NRSBackPain < 0 ? 'mindre' : 'mer') + ' ryggsmärta, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.NRSBackPain * formElementRangeSize('NRSBackPain')) + '.');
  addRow(
    'ODI',
    'Funktionsnedsättning',
    'Ju ' + (coefs.ODI < 0 ? 'lägre' : 'högre') + ' funktionsnedsättning, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Skillnaden kan vara upp till ' + coefToPercentageDelta(coefs.ODI * formElementRangeSize('ODI')) + '.');

  content += '</table>';
  const table = document.getElementById(`globalExplanationTable_${id}`);
  table.innerHTML = content;
}
