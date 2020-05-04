const showHeatMapFor = (symbol, type, fn) => {
  fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}`, {
    headers: { 'Authorization': ''}
  })
    .then(data => data.json())
    .then(resp => {
      console.log(resp)
      const entries = {...resp.callExpDateMap, ...resp.putExpDateMap };
      const data = Object.values(entries)
        .flatMap(c => Object.values(c).map(d => d[0]))
        .map(s => ({
          ...s,
          value: fn(s),
          x: parseFloat(s.strikePrice),
          y: s.daysToExpiration
        }))
      const hightlightX =[closest(resp.underlyingPrice, data.map(s => s.strikePrice))];
      draw(data, { hightlightX });
      svg.select('text.sub').text(`Stock: $${resp.underlyingPrice} Vol: ${resp.volatility}`);
      document.title = resp.symbol;
    });
}

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

const options = [
  { name: 'Volatility', fn: s => s.volatility},
  { name: 'Bid Ask Spread', fn: s => s.ask - s.bid },
  { name: 'Open Interest', fn: s => s.openInterest },
  { name: 'Volume', fn: s => s.totalVolume },
  { name: 'Mark', fn: s => s.mark },
  { name: 'Unusual', fn: s => s.openInterest === 0 ? 0: s.totalVolume / s.openInterest },
];

ul.selectAll('li')
  .data(options)
  .enter().append('li')
  .html(d => d.name)
  .on('click',d => {
    showHeatMapFor(symbol, type, d.fn);
    svg.select('text.header').text(d.name);
  });

const symbol = urlParams.get('symbol');
const type = urlParams.get('type');
document.querySelector('li').click();
