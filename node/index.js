import json2Csv from 'json2Csv'
import fs from 'fs'
import iv from 'implied-volatility'
import greeks from 'greeks';

(async () => {
  const csv = fs.readFileSync('./optionVsPrice/SNAP_10-22.csv', 'utf8');
  // console.log(csv);
  // const data = await json2Csv.parseAsync(csv, {delimiter: '	'})
  //
  // getImpliedVolatility(expectedCost, s, k, t, r, callPut, estimate)
  //
  // expectedCost - The market price of the option
  // s - Current price of the underlying
  // k - Strike price
  // t - Time to experiation in years
  // r - Anual risk-free interest rate as a decimal
  // callPut - The type of option priced - "call" or "put"
  // [estimate=.1] - An initial estimate of implied volatility

  const k = 56;
  const s = 55.185;
  const cost = 2.6;
  const exp = 28/365
  const r = 0;
  const type = 'call'
  const vol = iv.getImpliedVolatility(cost, s, k, exp, r, type);
  console.log('vol', vol);
  console.log(greeks.getDelta(s, k, exp, vol, r, type))
})()
