// Based on https://www.statsmodels.org/dev/_modules/statsmodels/miscmodels/ordinal_model.html#OrderedModel

function transformThresholdParams(thresholdParams) {
  var currentValue = thresholdParams[0];
  var result = [-Infinity, currentValue];
  for(var i = 1; i < thresholdParams.length; i++) {
    currentValue += Math.exp(thresholdParams[i]);
    result.push(currentValue);
  }
  result.push(Infinity);
  return result;
}

function predict(coefs, thresholdParams, featureValues) {
  const thresholds = transformThresholdParams(thresholdParams);
  const xb = linearPrediction(coefs, featureValues);
  return probabilitiesGivenLatentVariableAndThresholds(xb, thresholds);
}

function probabilitiesGivenLatentVariableAndThresholds(xb, thresholds) {
  var result = [];
  for(var i = 0; i < (thresholds.length - 1); i++) {
    const low = thresholds[i] - xb;
    const upp = thresholds[i + 1] - xb;
    const prob = intervalProbability(low, upp);
    result.push(prob);
  }
  return result;
}

function intervalProbability(low, upp) {
  return Math.max(jStat.normal.cdf(upp, 0, 1) - jStat.normal.cdf(low, 0, 1), 0);
}

function linearPrediction(coefs, featureValues) {
  var result = 0;
  for(var i = 0; i < coefs.length; i++) {
    result += coefs[i] * featureValues[i];
  }
  return result;
}

