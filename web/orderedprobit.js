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
