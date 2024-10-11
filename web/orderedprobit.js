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

function erf(x) { // Note: Output from ChatGPT
    // Constants
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    // Save the sign of x
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    // A&S formula 7.1.26 approximation for erf
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

// Note: Output from ChatGPT
function normalCDF(x, mean = 0, stdDev = 1) {
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
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
