const showHeatMapFor = (symbol, type, map, filter = s => s) => {
  fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}`, {
    headers: { 'Authorization': ''}
  })
    .then(data => data.json())
    .then(resp => {
      console.log(resp)
      const context  = {underlyingPrice: resp.underlyingPrice};
      const data = Object.values(resp.callExpDateMap)
        .concat(Object.values(resp.putExpDateMap))
        .flatMap(c => Object.values(c).map(d => d[0]))
        .filter(s => filter(s,context))
        .map(s => ({
          ...s,
          value: map(s, context),
          x: parseFloat(s.strikePrice),
          y: s.daysToExpiration
        }))
      console.log(data);
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
  { name: 'Volatility', map: s => s.volatility},
  { name: 'Bid Ask Spread', map: s => s.ask - s.bid },
  { name: 'Open Interest', map: s => s.openInterest },
  { name: 'Volume', map: s => s.totalVolume },
  { name: 'Mark', map: s => s.mark },
  { name: 'Unusual', map: s => s.openInterest === 0 ? 0: s.totalVolume / s.openInterest },
  { name: 'Underpriced (To Buy)', map: s => s.theoreticalOptionValue - s.ask},
  { name: 'Overpriced (To Sell)', map: s => s.bid - s.theoreticalOptionValue},
  { name: 'Pain',
    map: (s, { underlyingPrice })=> s.bid * s.openInterest * Math.abs(s.strikePrice - underlyingPrice),
    filter: (s, { underlyingPrice }) => s.putCall === 'PUT' ? s.strikePrice< underlyingPrice : underlyingPrice  > s.strikePrice
  }
];

ul.selectAll('li')
  .data(options)
  .enter().append('li')
  .html(d => d.name)
  .on('click',d => {
    showHeatMapFor(symbol, type, d.map);
    svg.select('text.header').text(d.name);
  });

const symbol = urlParams.get('symbol');
const type = urlParams.get('type');
const chart = options.findIndex(s => s.name === urlParams.get('chart')) || 0
document.querySelector(`li:nth-child(${chart + 1})`).click();
