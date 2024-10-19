import { dataModel, getDataDefinition } from "./assets/data_model.js";
import { tabs, getLayoutField } from "./assets/tool_form_layout.js";
import { mean_disc_herniation } from "./assets/models/mean_disc_herniation.js";
import { outcome_disc_herniation_coefs } from "./assets/models/outcome_disc_herniation_coefs.js";
import { satisfaction_disc_herniation_coefs } from "./assets/models/satisfaction_disc_herniation_coefs.js";
import { presets } from "./assets/presets.js";

const SATISFACTION_POLES = [
  "Tveksam/missnöjd",
  "Nöjd",
];
const SATISFACTION_COLORS = [
  [243, 126, 119],
  [77, 200, 129],
];
const POSITIVE_COLOR = SATISFACTION_COLORS[0];

const OUTCOME_POLES = [
  "Lyckat utfall",
  "Ej lyckat utfall",
];
const OUTCOME_LEVELS = [
  "Helt försvunnen",
  "Mycket förbättrad",
  "Något förbättrad",
  "Oförändrad",
  "Försämrad",
];
const OUTCOME_COLORS = [
  [77, 200, 129],
  [197, 229, 209],
  [255, 234, 118],
  [255, 210, 107],
  [243, 126, 119],
];

const disc_herniation = 0;

const QUESTIONNAIRE_CONTENT = {
  [disc_herniation]: {
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

const MAX_SLOPE_LOGISTIC_REGRESSION = 0.25;
const MAX_SLOPE_ORDERED_PROBIT = -1 / Math.sqrt(2 * Math.PI);

var profileValues;

export function initializePredictionTool() {
  initializeTabs();
  initializeForm();

  const urlParams = new URLSearchParams(window.location.search);
  const preset = urlParams.get('preset');
  if(preset) {
    profileValues = presets[preset];
  }
  else {
    profileValues = randomProfileValues();
  }

  updateFormFieldsFromProfileValues();

  initializeCollapsibles();

  function handleInputChange(event) {
    profileValues = getProfileValuesFromForm();
    updatePredictionsAndLocalExplanations();
  }

  function updatePredictionsAndLocalExplanations() {
    updateLogisticRegressionPrediction('satisfaction', satisfaction_disc_herniation_coefs);
    updateLogisticRegressionExplanation(
      'satisfaction', satisfaction_disc_herniation_coefs, SATISFACTION_POLES, SATISFACTION_COLORS);

    updateOrderedProbitPrediction('outcome', outcome_disc_herniation_coefs);
    plotOrderedProbabilitiesPieChart('outcome', outcome_disc_herniation_coefs, OUTCOME_LEVELS, OUTCOME_COLORS);
    updateOrderedProbitExplanation('outcome', outcome_disc_herniation_coefs, OUTCOME_POLES, OUTCOME_COLORS);
  }

  var formElements = document.querySelectorAll("input, select");
  formElements.forEach(function(element) {
      element.addEventListener("input", handleInputChange);
  });

  generateGlobalExplanationTable('satisfaction', satisfaction_disc_herniation_coefs, MAX_SLOPE_LOGISTIC_REGRESSION);
  generateGlobalExplanationTable('outcome', outcome_disc_herniation_coefs, MAX_SLOPE_ORDERED_PROBIT);
  updatePredictionsAndLocalExplanations();

  const diagnosis = document.getElementById('Diagnosis').value;
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

function randomProfileValues() {
  function randomValue(dataDefinition) {
    if(dataDefinition.type == 'categorical') {
      return Math.floor(Math.random() * dataDefinition.num_categories);
    }
    else if(dataDefinition.type == 'numerical') {
      const range = dataDefinition.range.max - dataDefinition.range.min;
      const numSteps = Math.floor(range / dataDefinition.range.step);
      const randomStep = Math.floor(Math.random() * (numSteps + 1));
      return dataDefinition.range.min + (randomStep * dataDefinition.range.step);
    }
    else if(dataDefinition.type == 'binary') {
      return Math.floor(Math.random() * 2);
    }
    else {
      throw new Error('Unsupported data type ' + dataDefinition.type);
    }
  }

  var result = {};
  for(const dataDefinition of dataModel) {
    result[dataDefinition.name] = randomValue(dataDefinition);
  }
  return result;
}

function updateFormFieldsFromProfileValues() {
  for(const tab of tabs) {
    for(const group of tab.groups) {
      for(const field of group.fields) {
        updateFormFieldFromValue(field, profileValues[field.name]);
      }
    }
  }
}

function updateFormFieldFromValue(field, value) {
  if(field.type == 'select') {
    var input = document.getElementById(field.name);
    input.selectedIndex = value;
  }
  else if(field.type == 'radio') {
    var radio = document.getElementById(field.name + value);
    radio.checked = true;
  }
  else if(field.type == 'toggle') {
    var radio = document.getElementById(field.name + value);
    radio.checked = true;
  }
  else if(field.type == 'number') {
    var input = document.getElementById(field.name);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }
}

function initializeTabs() {
  const tabsDiv = document.getElementById('tabs');
  tabsDiv.innerHTML = '';
  var firstTab = true;
  for(const tab of tabs) {
    var button = document.createElement('button');
    button.dataset.tab = tab.name;
    button.classList.add('tab-button');
    button.classList.add('tab-button-patient-data');
    if(firstTab) {
      button.classList.add('active');
      firstTab = false;
    }
    button.innerHTML = tab.label;
    tabsDiv.appendChild(button);
  }

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

function initializeForm() {
  const tabContent = document.getElementById('tab-content');
  var firstTab = true;
  for(const tab of tabs) {
    const tabDiv = document.createElement('div');
    tabDiv.id = tab.name;
    tabDiv.classList.add('tab-pane');
    tabDiv.classList.add('tab-pane-patient-data');
    if(firstTab) {
      tabDiv.classList.add('active');
      firstTab = false;
    }

    for(const group of tab.groups) {
      const h = document.createElement('div');
      h.className = 'formHeader';
      h.innerHTML = group.header;
      tabDiv.appendChild(h);

      for(const field of group.fields) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', field.name);
        label.className = 'label';
        label.innerHTML = field.label;
        groupDiv.appendChild(label);

        if(field.type == 'select') {
          const select = document.createElement('select');
          select.id = field.name;
          select.className = 'input';
          for(let i = 0; i < field.labels.length; i++) {
            const option = document.createElement('option');
            option.text = field.labels[i];
            option.value = i;
            select.appendChild(option);
          }
          groupDiv.appendChild(select);
        }
        else if(field.type == 'radio') {
          const div = document.createElement('div');
          div.classList.add('input');
          div.classList.add('radio-group');
          for(let i = 0; i < field.labels.length; i++) {
            const input = document.createElement('input');
            input.type = 'radio';
            input.id = field.name + i;
            input.name = field.name;
            input.value = i;
            div.appendChild(input);

            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.innerHTML = field.labels[i];
            div.appendChild(label);
          }
          groupDiv.appendChild(div);
        }
        else if(field.type == 'toggle') {
          const div = document.createElement('div');
          div.classList.add('input');
          div.classList.add('radio-group');
          for(let i = 1; i >= 0; i--) {
            const input = document.createElement('input');
            input.type = 'radio';
            input.id = field.name + i;
            input.name = field.name;
            input.value = i;
            div.appendChild(input);

            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.innerHTML = field.labels[i];
            div.appendChild(label);
          }
          groupDiv.appendChild(div);
        }
        else if(field.type == 'number') {
          const valueElement = document.createElement('input');
          valueElement.type = 'text';
          valueElement.inputmode = 'numeric';
          valueElement.id = field.name + '-value';
          valueElement.className = 'input';

          const rangeElement = document.createElement('input');
          rangeElement.type = 'range';
          rangeElement.id = field.name;
          const dataDefinition = getDataDefinition(field.name);
          rangeElement.min = dataDefinition.range.min;
          rangeElement.max = dataDefinition.range.max;
          rangeElement.step = dataDefinition.range.step;
          rangeElement.className = 'input';
          rangeElement.addEventListener('input', () => {
              valueElement.value = rangeElement.value;
          });

          valueElement.addEventListener('input', () => {
              let parsedValue = parseFloat(valueElement.value);
              if (parsedValue < dataDefinition.range.min) {
                  parsedValue = dataDefinition.range.min;
              } else if (parsedValue > dataDefinition.range.max) {
                  parsedValue = dataDefinition.range.max;
              }
              rangeElement.value = parsedValue;
          });

          groupDiv.appendChild(valueElement);
          groupDiv.appendChild(rangeElement);
        }
        else {
          throw new Error('Unsupported field type ' + field.type);
        }
        tabDiv.appendChild(groupDiv);
      }
    }

    tabContent.appendChild(tabDiv);
  }
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function getNominalRegressorValues(varName, n) {
  if(n == 1) {
    if(profileValues[varName]) {
      return [1];
    } else {
      return [0];
    }
  }
  else if(n > 1) {
    return range(n).map(function(i) { return profileValues[varName] == i ? 1 : 0; })
  }
}

function getProfileValuesFromForm() {
  var result = {};
  for(const tab of tabs) {
    for(const group of tab.groups) {
      for(const field of group.fields) {
        if(field.type == 'select') {
          const element = document.getElementById(field.name);
          result[field.name] = element.selectedIndex;
        }
        else if(field.type == 'number') {
          const element = document.getElementById(field.name);
          result[field.name] = parseFloat(element.value);
        }
        else if(field.type == 'radio' || field.type == 'toggle') {
          for(let i = 0; i < field.labels.length; i++) {
            const element = document.getElementById(field.name + i);
            if(element.checked) {
              result[field.name] = i;
            }
          }
        }
      }
    }
  }
  return result;
}

function getRegressorValues(coefs) {
  var result = {}
  for(const key in coefs) {
    if(key != 'Intercept' && key != 'Thresholds') {
      var coef = coefs[key];
      if(Array.isArray(coef)) {
        result[key] = getNominalRegressorValues(key, coef.length);
      }
      else {
        result[key] = profileValues[key];
      }
    }
  }
  return result;
}


function getProductSum(regressorValues, coefs, log) {
  var result = 0;
  for(const key in coefs) {
    const coef = coefs[key];
    const delta = getDelta(key, regressorValues, coef);
    if(log) {
      console.log(`delta for ${key}: ${delta}`);
    }
    if(delta) {
      result += delta;
    }
  }
  return result;
}

function getDelta(key, regressorValues, coef) {
  if(key == 'Intercept') {
    return coef[0];
  }
  else if(key != 'Thresholds') {
    if(regressorValues[key]) {
      if(Array.isArray(coef)) {
        var result = 0;
        for(let i = 0; i < coef.length; i++) {
          result += coef[i] * regressorValues[key][i];
        }
        return result;
      }
      else {
        return coef * regressorValues[key];
      }
    }
  }
  return 0;
}

function logOddsToProb(logOdds) {
  return 1 / (1 + Math.exp(-logOdds));
}

function probToLogOdds(probability) {
  return Math.log(probability / (1 - probability));
}

function updateLogisticRegressionPrediction(id, coefs) {
  const percs = getLogisticRegressionProbabilityPercs(coefs);
  updatePrediction(id, percs[0]);
}

function updateLogisticRegressionExplanation(id, coefs, levels, colors) {
  plotLocalFeatureContributions(id, coefs, levels, colors, [0, 1], logOddsToProb, 'positive');
}

function updateOrderedProbitPrediction(id, coefs) {
  const regressorValues = getRegressorValues(coefs);
  console.log('updateOrderedProbitPrediction: regressor values: '); console.log(regressorValues);
  console.log('calculating product sum for ordered probit');
  const productSum = getProductSum(regressorValues, coefs);
  const positiveProbability = orderedProbitProbabilityOfPositiveOutcome(coefs, productSum);
  updatePrediction(id, Math.round(positiveProbability * 100));
}

function orderedProbitProbabilityOfPositiveOutcome(coefs, productSum) {
  const probs = getOrderedProbitProbabilities(coefs, productSum);
  console.log('orderedProbitProbabilityOfPositiveOutcome: productSum='); console.log(productSum);
  console.log('orderedProbitProbabilityOfPositiveOutcome: probs='); console.log(probs);
  return probs[0] + probs[1]; // Helt försvunnen + Mycket förbättrad
}

function getOrderedProbitProbabilities(coefs, productSum) {
  const thresholds = [-Infinity, ...coefs.Thresholds, Infinity];
  return probabilitiesGivenLatentVariableAndThresholds(productSum, thresholds);
}

function updateOrderedProbitExplanation(id, coefs, levels, colors) {
  const minProb = 0.001;
  const maxProb = 0.999;
  const minProductSum = linearPredictionGivenThresholdAndProbability(
    coefs.Thresholds[0], minProb);
  const maxProductSum = linearPredictionGivenThresholdAndProbability(
    coefs.Thresholds[coefs.Thresholds.length - 1], maxProb);

  function toRelativePosition(threshold) {
    return (threshold - minProductSum) / (maxProductSum - minProductSum);
  }

  function probabilityOfPositiveOutcome(productSum) {
    return orderedProbitProbabilityOfPositiveOutcome(coefs, productSum);
  }

  plotLocalFeatureContributions(
    id,
    coefs,
    levels,
    colors,
    [0, ...coefs.Thresholds.toReversed().map(toRelativePosition), 1],
    probabilityOfPositiveOutcome,
    'negative'
  );
}

function updatePrediction(id, perc) {
  document.getElementById(`tab_prediction_${id}`).innerHTML = perc + '%';
  document.getElementById(`prediction_${id}`).innerHTML = perc + '%';
}

function initializeCollapsibles() {
  initializeCollapsible('global-explanation-satisfaction');
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

function getProductSumDeltas(reference, comparison, coefs) {
  var result = {};
  for(const key in coefs) {
    var delta = 0;
    if(key != 'Intercept' && key != 'Thresholds') {
      if(comparison[key] && reference[key]) {
        var coef = coefs[key];
        if(Array.isArray(coef)) {
          for(let i = 0; i < coef.length; i++) {
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
  const valuesForRegressor = valuesForAllRegressors[regressor];
  for(var i = 0; i < valuesForRegressor.length; i++) {
    if(valuesForRegressor[i] == 1) {
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

const sortByValue = (obj) => {
  const entries = Object.entries(obj);
  entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  return Object.fromEntries(entries);
};

function plotLocalFeatureContributions(id, coefs, levels, colors, colorSteps, productSumToProbability, polarity) {
  function generateGradient() {
    var result = 'linear-gradient(to ' + (polarity == 'positive' ? 'right' : 'left');
    for(let i = 0; i < colors.length; i++) {
      const color = colors[i];
      result += `, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`;
      result += ` ${Math.round(100 * colorSteps[i])}%`;
    }
    result += ')';
    return result;
  }

  const meanProductSum = getProductSum(mean_disc_herniation, coefs);
  const meanProb = productSumToProbability(meanProductSum);
  const regressorValues = getRegressorValues(coefs);
  const productSum = getProductSum(regressorValues, coefs);
  console.log('plotLocalFeatureContributions: productSum=' + productSum);
  const predictedProb = productSumToProbability(productSum);
  console.log('plotLocalFeatureContributions: predictedProb=' + predictedProb);
  const productSumDeltas = getProductSumDeltas(mean_disc_herniation, regressorValues, coefs);
  console.log('productSumDeltas for ' + id + ': '); console.log(productSumDeltas);
  const deltas = Object.fromEntries(
    Object.entries(productSumDeltas).map(([key, value]) => [
      key, productSumToProbability(productSum + value) - predictedProb]));
  console.log('deltas for ' + id + ': '); console.log(deltas);

  const gradient = generateGradient();
  const container = document.getElementById(`featureContributions_${id}`);
  container.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'localExplanationsTable';

  const probabilityBarContainerWidth = 400;
  const probabilityBarContainerHalfWidth = probabilityBarContainerWidth / 2;
  const minShownDelta = 2 / probabilityBarContainerHalfWidth;

  function probabilityBarWidth(probability) {
    return Math.abs(probability) * probabilityBarContainerHalfWidth;
  }

  function filterDeltas(deltas, f) {
    return Object.fromEntries(Object.entries(deltas).filter(f));
  }

  function generateFeatureDescription(regressor) {
    const delta = productSumDeltas[regressor];
    const coef = coefs[regressor];
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
        const meanValue = getNominalValue(regressor, mean_disc_herniation);
        const value = getNominalValue(regressor, regressorValues);
        const label = getNominalLabel(regressor);
        return 'Relativt ' + generateAdjective(value < meanValue, regressor) + ' ' + toLeadingLowercase(label);
      }
    }
    else {
      if(regressor == 'AgeAtSurgery') {
        return 'Relativt ' + (delta * coef < 0 ? 'låg' : 'hög') + ' ålder';
      }
      if(regressor == 'EQ5DIndex') {
        return 'Relativt ' + (delta * coef < 0 ? 'låg' : 'hög') + ' EQ5D';
      }
      if(regressor == 'ODI') {
        return 'Relativt ' + (delta * coef < 0 ? 'låg' : 'hög') + ' funktionsnedsättning';
      }
      if(regressor == 'NRSBackPain') {
        return 'Relativt ' + (delta * coef < 0 ? 'lite' : 'mycket') + ' ryggsmärta';
      }
    }
  }

  function addAxisTicks() {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    row.appendChild(emptyCell);

    const ticksCell = document.createElement('td');
    const innerTable = document.createElement('table');
    innerTable.style.width = '100%';
    const innerRow = document.createElement('tr');

    const leftCell = document.createElement('td')
    leftCell.align = 'left';
    leftCell.className = 'tick';
    leftCell.innerHTML = levels[polarity == 'positive' ? 0 : levels.length - 1];
    innerRow.appendChild(leftCell);

    const rightCell = document.createElement('td')
    rightCell.align = 'right';
    rightCell.className = 'tick';
    rightCell.innerHTML = levels[polarity == 'positive' ? levels.length - 1 : 0];
    innerRow.appendChild(rightCell);

    innerTable.appendChild(innerRow);
    ticksCell.appendChild(innerTable);
    row.appendChild(ticksCell);
    table.appendChild(row);
  }

  function addVerticalSpace() {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colspan = 2;
    cell.className = 'verticalSpace';
    row.appendChild(cell);
    table.appendChild(row);
  }

  function addHeader(header) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'featureContributionsHeader';
    cell.innerHTML = header + ':';
    row.appendChild(cell);

    const contentCell = document.createElement('td');
    contentCell.className = 'contentCell';
    const line = document.createElement('div');
    line.className = 'verticalLine';
    contentCell.appendChild(line);
    row.appendChild(contentCell);

    table.appendChild(row);
  }

  function addRow(label, value, labelClass, type) {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.className = labelClass;
      labelCell.innerHTML = label;
      row.appendChild(labelCell);
      const contentCell = document.createElement('td');
      contentCell.className = 'contentCell';

      if(type == 'probability') {
        const probabilityRangeDiv = document.createElement('div');
        probabilityRangeDiv.className = 'probabilityRange';
        probabilityRangeDiv.style.background = gradient;
        const valueDiv = document.createElement('div');
        valueDiv.className = 'probabilityMarker';
        const relativeWidth = 0.1;
        valueDiv.style.width = `${Math.round(relativeWidth * 100)}%`;
        valueDiv.style.position = 'relative';
        valueDiv.style.left = `${Math.round(value * (1 - relativeWidth) * 100)}%`;
        valueDiv.innerHTML = `${Math.round(value * 100)}%`;
        probabilityRangeDiv.appendChild(valueDiv);
        contentCell.appendChild(probabilityRangeDiv);
      }
      else if(type == 'delta') {
        const line = document.createElement('div');
        line.className = 'verticalLine';
        contentCell.appendChild(line);

        const bar = document.createElement('div');
        bar.className = 'bar';
        const barWidth = probabilityBarWidth(value);
        bar.style.width = `${barWidth}px`;
        if(value < 0) {
          bar.style.left = `${probabilityBarContainerHalfWidth - barWidth}px`;
        } else {
          bar.style.left = `${probabilityBarContainerHalfWidth}px`;
        }
        contentCell.appendChild(bar);
      }

      row.appendChild(contentCell);
      table.appendChild(row);
  }

  function addPotentialSection(deltas, header) {
    const numDeltas = Object.values(deltas).length;
    const maxShownDeltas = 5;
    if(numDeltas > 0) {
      const sortedDeltas = sortByValue(deltas);
      const shownDeltas = Object.fromEntries(
        Object.entries(sortedDeltas).slice(0, maxShownDeltas)
      );
      addVerticalSpace();
      addHeader(header);
      for(const regressor in shownDeltas) {
        const delta = shownDeltas[regressor];
        addRow(generateFeatureDescription(regressor), delta, 'featureLabel', 'delta')
      }
      if(numDeltas > maxShownDeltas) {
        const notShownDeltas = Object.fromEntries(
          Object.entries(sortedDeltas).slice(maxShownDeltas)
        );
        const delta = Object.values(notShownDeltas).reduce((acc, curr) => acc + curr, 0);
        addRow('Övriga faktorer', delta, 'featureLabel', 'delta');
      }
    }
  }

  addAxisTicks();
  addRow('Genomsnittlig diskbråckspatient', meanProb, 'nonFeatureLabel', 'probability');
  const positiveDeltas = filterDeltas(deltas, ([_, x]) => x > minShownDelta);
  const negativeDeltas = filterDeltas(deltas, ([_, x]) => x < -minShownDelta);
  addPotentialSection(positiveDeltas, 'Positiva faktorer');
  addPotentialSection(negativeDeltas, 'Negativa faktorer');

  addRow('Sammanlagd sannolikhet', predictedProb, 'nonFeatureLabel', 'probability');
  container.appendChild(table);
}

function formElementRangeSize(name) {
  const dataDefinition = getDataDefinition(name);
  return dataDefinition.range.max - dataDefinition.range.min;
}

function generateGlobalExplanationTable(id, coefs, maxSlope) {
  var probabilityObjectSingular;
  var probabilityObjectPlural;
  if(id == 'satisfaction') {
    probabilityObjectSingular = 'att bli nöjd';
    probabilityObjectPlural = 'att bli nöjda';
  }
  else if(id == 'outcome') {
    probabilityObjectSingular = probabilityObjectPlural = 'för lyckat utfall';
  }

  const slopePolarity = (maxSlope > 0) ? 1 : -1;
  let items = [];

  function addItem(name, header, coef, cellContentTemplate) {
    if(name in coefs) {
      let coefMagnitude = Math.abs(coef);
      let cellContent = cellContentTemplate.replace('${P}', coefToPercentageDelta(coefMagnitude));
      items.push({header: header, coefMagnitude: coefMagnitude, cellContent: cellContent});
    }
  }

  function addNominal(header, name) {
    addItem(
      name,
      header,
      coefsGroupRangeSize(coefs[name]),
      generateOptionNounPhrase(name, getIndexOfMaxCoef(name)) + ' beräknas ha högst sannolikhet ' + probabilityObjectPlural + '. ' +
      generateOptionNounPhrase(name, getIndexOfMinCoef(name)) + ' beräknas ha lägst sannolikhet ' + probabilityObjectPlural + '. ' +
      'Skillnaden kan vara upp till ${P}.');
  }

  function coefToPercentageDelta(coefMagnitude) {
    let delta = coefMagnitude * Math.abs(maxSlope) * 100;
    let digits = (delta < 1) ? 1 : 0;
    let formattedFloat = delta.toFixed(digits);
    return '<b>' + formattedFloat + '</b> ' + ((
      formattedFloat === '1' || formattedFloat.startsWith('1.')) ? 'procentenhet' : 'procentenheter');
  }

  function getIndexOfMaxCoef(name) {
    let coefsToCompare = coefs[name];
    return coefsToCompare.reduce((maxIndex, currentValue, currentIndex, array) => {
      return currentValue * slopePolarity > array[maxIndex] * slopePolarity ? currentIndex : maxIndex;
    }, 0);
  }

  function getIndexOfMinCoef(name) {
    let coefsToCompare = coefs[name];
    return coefsToCompare.reduce((maxIndex, currentValue, currentIndex, array) => {
      return currentValue * slopePolarity < array[maxIndex] * slopePolarity ? currentIndex : maxIndex;
    }, 0);
  }

  function generateOptionNounPhrase(name, optionIndex) {
    const field = getLayoutField(name);
    if(name == 'AbilityWalking') {
      let optionText = field.labels[optionIndex];
      return 'Patienter som kan gå ' + toLeadingLowercase(optionText);
    }
    if(name == 'DurationLegPain' || name == 'DurationBackPain') {
      if(optionIndex == 0) {
        return 'Patienter utan smärta';
      }
      else {
        let optionText = field.labels[optionIndex];
        return 'Patienter som upplevt smärta i ' + toLeadingLowercase(optionText);
      }
    }
  }

  function coefsGroupRangeSize(coefsGroup) {
    let coefsToCompare = [0].concat(coefsGroup);
    return Math.max(...coefsToCompare) - Math.min(...coefsToCompare);
  }

  addItem(
    'AgeAtSurgery',
    'Ålder',
    coefs.AgeAtSurgery * 10,
    'Ju ' + (coefs.AgeAtSurgery * slopePolarity < 0 ? 'lägre' : 'högre') + ' ålder, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Sannolikheten påverkas med upp till ${P} per tiotal år.');
  addItem(
    'Female',
    'Kön',
    coefs.Female,
    (coefs.Female * slopePolarity < 0 ? 'Män' : 'Kvinnor') + ' beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden mellan kvinnor och män kan vara upp till ${P}.');
  addItem(
    'IsPreviouslyOperated',
    'Tidigare ryggop',
    coefs.IsPreviouslyOperated,
    'Patienter som ' + (coefs.IsPreviouslyOperated * slopePolarity < 0 ? 'inte' : '') + ' tidigare ryggopererats beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'IsSmoker',
    'Rökare',
    coefs.IsSmoker,
    (coefs.IsSmoker * slopePolarity < 0 ? 'Icke-rökare' : 'rökare') + ' beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'IsUnemployed',
    'Arbetslös',
    coefs.IsUnemployed,
    (coefs.IsUnemployed * slopePolarity < 0 ? 'Icke-arbetslösa' : 'Arbetslösa') + ' beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'HasAgePension',
    'Ålderspension',
    coefs.HasAgePension,
    'Patienter ' + (coefs.HasAgePension * slopePolarity < 0 ? 'utan' : 'med') + ' ålderspension beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'HasSickPension',
    'Sjukpension',
    coefs.HasSickPension,
    'Patienter ' + (coefs.HasSickPension * slopePolarity < 0 ? 'utan' : 'med') + ' sjukpension beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'HasOtherIllness',
    'Samsjuklighet',
    coefs.HasOtherIllness,
    'Patienter ' + (coefs.HasOtherIllness * slopePolarity < 0 ? 'utan' : 'med') + ' andra sjukdomar beräknas ha högre sannolikhet ' + probabilityObjectPlural + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'EQ5DIndex',
    'EQ5D',
    coefs.EQ5DIndex * formElementRangeSize('EQ5DIndex'),
    'Ju ' + (coefs.EQ5DIndex * slopePolarity < 0 ? 'lägre' : 'högre') + ' EQ5D, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addNominal('Promenadsträcka', 'AbilityWalking');
  addNominal('Smärtduration i ben', 'DurationLegPain');
  addNominal('Smärtduration i rygg', 'DurationBackPain');
  addItem(
    'NRSBackPain',
    'Smärta i rygg',
    coefs.NRSBackPain * formElementRangeSize('NRSBackPain'),
    'Ju ' + (coefs.NRSBackPain * slopePolarity < 0 ? 'mindre' : 'mer') + ' ryggsmärta, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Skillnaden kan vara upp till ${P}.');
  addItem(
    'ODI',
    'Funktionsnedsättning',
    coefs.ODI * formElementRangeSize('ODI'),
    'Ju ' + (coefs.ODI * slopePolarity < 0 ? 'lägre' : 'högre') + ' funktionsnedsättning, desto högre beräknas sannolikheten ' + probabilityObjectSingular + '. ' +
    'Skillnaden kan vara upp till ${P}.');

  let content = '<table>';
  items.sort((a, b) => b.coefMagnitude - a.coefMagnitude);
  for(const item of items) {
    content += '<tr>';
    content += '<td class="globalExplanationsTableHeader">' + item.header + '</td>';
    content += '<td class="globalExplanationsTableContent">' + item.cellContent + '</td>';
    content += '</tr>';
  }
  content += '</table>';
  const table = document.getElementById(`globalExplanationTable_${id}`);
  table.innerHTML = content;
}

function plotOrderedProbabilitiesPieChart(id, coefs, levels, colors) {
  const regressorValues = getRegressorValues(coefs);
  const productSum = getProductSum(regressorValues, coefs, true);
  console.log('product sum for ordered probabilities: ' + productSum);
  const probs = getOrderedProbitProbabilities(coefs, productSum);
  console.log('probabilities:'); console.log(probs);
  const percentages = probs.map((prob, _) => Math.round(prob * 100));
  plotPieChart(id, percentages, levels, colors);
}

function getLogisticRegressionProbabilityPercs(coefs) {
  const regressorValues = getRegressorValues(coefs);

  const positivePredictedLogOdds = getProductSum(regressorValues, coefs);
  const positiveProbability = logOddsToProb(positivePredictedLogOdds);
  const positiveProbabilityPerc = Math.round(positiveProbability * 100);

  const negativeProbability = 1 - positiveProbability;
  const negativeProbabilityPerc = Math.round(negativeProbability * 100);
  return [positiveProbabilityPerc, negativeProbabilityPerc];
}

function plotPieChart(id, values, levels, colors) {
  var data = [{
    values: values,
    labels: levels,
    type: 'pie',
    marker: {
      colors: colors.map(cssColorString),
    },
    sort: false,
    rotation: 0,
    direction: 'clockwise',
  }];
  console.log(data);

  var layout = {
    margin: {
        t: 0,
        b: 0,
        l: 20,
        r: 50
    },
    width: 500,
    height: 400,
    legend: {
      traceorder: 'normal',
      x: 1,
      y: 0.5,
      orientation: 'v',
    }
  };

  const divID = `probabilitiesPieChart_${id}`;
  Plotly.newPlot(
    divID,
    {
      data: data,
      layout: layout,
      config: {
          displayModeBar: false,
          responsive: false
      }
    });
}

function cssColorString(rgbValues) {
  return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
}

export function getProfileValues() {
  return profileValues;
}
