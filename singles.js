const symbol = urlParams.get('symbol');
const type = urlParams.get('type');
fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}`, {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(data => ({ underlyingPrice: data.underlyingPrice, entires: {...data.callExpDateMap, ...data.putExpDateMap }}))
  .then(resp => {
    const data = Object.values(resp.entires)
      .flatMap(c => Object.values(c).map(d => d[0]))
      .map(s => ({
        ...s,
        value: s.ask - s.bid,
        value: s.volatility,
        // value: s.openInterest,
        // value: s.totalVolume === 0 ? 0 : parseInt(s.openInterest)/parseFloat(s.totalVolume),
        x: parseFloat(s.strikePrice),
        y: s.daysToExpiration
      }))
    const hightlightX =[closest(resp.underlyingPrice, data.map(s => s.strikePrice))];
    draw(data, { hightlightX });
  });

function closest(num, arr) {
  var curr = arr[0];
  var diff = Math.abs (num - curr);
  for (var val = 0; val < arr.length; val++) {
    var newdiff = Math.abs (num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
    }
  }
  return curr;
}

