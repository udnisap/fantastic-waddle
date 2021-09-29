const showHeatMapFor = (symbol, type, map,
  {
    filter = s => s,
    perRow
  }
) => {
  fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}`, {
    headers: { 'Authorization': ''}
  })
    .then(data => data.json())
    .then(resp => {
      console.log(resp)
      const context  = {underlyingPrice: resp.underlyingPrice};
      console.log(Object.values(resp.callExpDateMap)
                .concat(Object.values(resp.putExpDateMap))
                .flatMap(c => Object.values(c).map(d => d[0]))
      )
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
      console.log(data.reduce((a, s) => ({ ...a, [s.putCall + s.daysToExpiration]: s}), {}));
      const hightlightX =[closest(resp.underlyingPrice, data.map(s => s.strikePrice))];
      draw(data, { hightlightX, perRow });
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
  { name: 'Price', map: s => s.ask},
  { name: 'Underpriced (To Buy)', map: s => s.theoreticalOptionValue - s.ask},
  { name: 'Overpriced (To Sell)', map: s => s.bid - s.theoreticalOptionValue},
  { name: 'Pain',
    map: (s, { underlyingPrice })=> s.bid * s.openInterest * Math.abs(s.strikePrice - underlyingPrice),
    perRow: true,
    filter: (s, { underlyingPrice }) => s.putCall === 'CALL' ? s.strikePrice < underlyingPrice :s.strikePrice > underlyingPrice
  },
  { name: 'PutSelling',
    map: (s, { underlyingPrice })=> s.bid * 100.00 / (s.strikePrice - s.bid) * (365 / s.daysToExpiration) ,
    filter: (s, { underlyingPrice }) => s.strikePrice <= 30 && s.bid > 0 && s.daysToExpiration < 60
  }
];

ul.selectAll('li')
  .data(options)
  .enter().append('li')
  .html(d => d.name)
  .on('click',d => {
    showHeatMapFor(symbol, type, d.map, d);
    svg.select('text.header').text(d.name);
  });

const symbol = urlParams.get('symbol').toUpperCase();
const type = urlParams.get('type').toUpperCase();
const chart = options.findIndex(s => s.name === urlParams.get('chart')) || 0
document.querySelector(`li:nth-child(${chart + 1})`).click();


