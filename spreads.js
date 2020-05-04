const showHeatMapFor = (symbol, type, fn) => {
  fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}&strategy=VERTICAL&range=ALL`, {
    headers: { 'Authorization': ''}
  })
    .then(data => data.json())
    .then(outer => fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&strike=100&strikeCount=1`)
      .then(s => s.json())
      .then(s => ({ ...outer, underlyingPrice: s.underlyingPrice }))
    )
    .then(data => console.log('RAW', data) || data)
    .then(resp => { 
      const data = resp.monthlyStrategyList
        .flatMap(c => c.optionStrategyList.map(d => ({
          ...d,
          daysToExp: c.daysToExp,
        })))
        .map(s => ({
          ...s,
          value: fn(s),
          x: s.strategyStrike,
          y: s.daysToExp
        }))
      const xGroup = Array.from(new Set(data.map(s => s.x))).sort((a, b) => {
        const aa = parseFloat(a.split('/')[0]);
        const bb = parseFloat(b.split('/')[0]);
        if (aa -bb === 0) {
          const aaa = parseFloat(a.split('/')[1]);
          const bbb = parseFloat(b.split('/')[1]);
          return aaa- bbb;
        } else {
          return aa - bb;
        }
      })
      const hightlightX =closest(resp.underlyingPrice, xGroup);
      draw(data, {xGroup, hightlightX})
      svg.select('text.header').text(resp.symbol);
      svg.select('text.sub').text(`Stock: $${resp.underlyingPrice} Vol: ${resp.volatility}`);
    });
}

function closest(num, arr) {
  return arr.filter(s => {
      const a = parseFloat(s.split('/')[0]);
      const b = parseFloat(s.split('/')[1]);
    return (num >= a && num <= b) || (num <= a && num >= b);
  })
}
const options = [
  { name: 'Volatility', fn: s => s.volatility},
  { name: 'Bid Ask Spread', fn: s => s.strategyAsk - s.strategyBid },
  { name: 'Open Interest', fn: s => s.openInterest },
];

ul.selectAll('li')
  .data(options)
  .enter().append('li')
  .html(d => d.name)
.on('mousedown',d => {
    showHeatMapFor(symbol, type, d.fn);
  });

// setInterval(() => {
// const symbol = ["NFLX", "TSLA", "AAPL", "GOOGL", "F"][Math.floor(Math.random() * Math.floor(5))];
// showHeatMapFor(symbol, 'CALL');
// }, 5000)
const symbol = urlParams.get('symbol');
const type = urlParams.get('type');
showHeatMapFor(symbol, type, options[0].fn);
