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
  var result = [];
  for(var i = 0; i <= thresholdParams.length; i++) {
    const low = thresholds[i] - xb;
    const upp = thresholds[i + 1] - xb;
    const prob = intervalProbability(low, upp);
    result.push(prob);
  }
  return result;
}

function intervalProbability(low, upp) {
  return Math.max(normalCDF(upp) - normalCDF(low), 0);
}

function normalCDF(x) { // NOTE: based on unvalidated output from ChatGPT
  const z = x / Math.sqrt(2);
  const k = 1 / (1 + 0.2316419 * Math.abs(z));
  const cdf = 0.5 * (1 + Math.sign(z) *
    Math.sqrt(1 - Math.exp(-((z * z) / 2) + 0.5 * (k * k * k * k * -1.2655122))));

  return cdf;
}

function linearPrediction(coefs, featureValues) {
  var result = 0;
  for(var i = 0; i < coefs.length; i++) {
    result += coefs[i] * featureValues[i];
  }
  return result;
}

function test() {
  // Based on https://www.statsmodels.org/stable/examples/notebooks/generated/ordinal_regression.html#Probit-ordinal-regression:

  const thresholdParams = [1.2968, 0.1873];
  console.log('transformThresholdParams');
  console.log(transformThresholdParams(thresholdParams));
  // output should correspond to array([ -inf, 1.29684541, 2.50285885, inf])

  const coefs = [0.5981, 0.0102, 0.3582];
  const data = [
    [0, 0, 3.26],
    [1, 0, 3.21],
    [1, 1, 3.94],
  ];

  console.log('linearPrediction');
  for(datum of data) {
    console.log(linearPrediction(coefs, datum));
  }
  /* output should correspond to res_prob.predict(exog=data_student.head(3)[['pared', 'public', 'gpa']], which='linpred'), i.e.
0    1.167604
1    1.747806
2    2.019427
  */

  console.log('predict');
  for(datum of data) {
    console.log(predict(coefs, thresholdParams, datum));
  }
  /* output should correspond to res_prob.predict(exog=data_student.head(3)[['pared', 'public', 'gpa']], which='prob'), i.e.
0    0.551417  0.357687  0.090896
1    0.326009  0.448882  0.225109
2    0.234969  0.450637  0.314394
  */
}
