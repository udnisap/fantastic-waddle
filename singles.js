const showHeatMapFor = (symbol, type, map,
  {
    filter = s => s,
    pivot = s => s,
    perRow,
    init = s => s,
  }
) => {
  init();
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
      const hightlightX =[closest(resp.underlyingPrice, data.map(s => s.strikePrice))];
      const dataForChart = pivot(data, context);
      draw(dataForChart, { hightlightX, perRow });
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
  { name: 'Open Interest', map: s => s.openInterest, perRow: true,
    pivot: (data) => {
      const expirationStrikeMap = (data.reduce((a, s) => ({
        ...a,
        [s.daysToExpiration + ':' +s.strikePrice ]: (a[s.daysToExpiration + ':' + s.strikePrice] || []).concat(s)
      }), {}));
      return Object.values(expirationStrikeMap)
        .map(([o1, o2]) => {
          const c = o1.putCall === 'CALL' ? o1 : o2;
          const p = o1.putCall === 'PUT' ? o1 : o2;

          return ({
            'c.openInterest': c.openInterest,
            'p.openInterest': p.openInterest,
            'c.delta': c.delta,
            'p.delta': p.delta,
            'c.gamma': c.gamma,
            'p.gamma': p.gamma,
            value: Math.abs(c.openInterest - p.openInterest),
            // both o1, o2 has same expirationDate and strike
            x: parseFloat(o1.strikePrice),
            y: o1.daysToExpiration
          })
        })

    }},
  { name: 'Volume', map: s => s.totalVolume },
  { name: 'Mark', map: s => s.mark },
  { name: 'Unusual', map: s => s.openInterest === 0 ? s.totalVolume: s.totalVolume / s.openInterest },
  { name: 'Price', map: s => s.ask},
  { name: 'Underpriced (To Buy)', map: s => s.theoreticalOptionValue - s.ask},
  { name: 'Overpriced (To Sell)', map: s => s.bid - s.theoreticalOptionValue},
  { name: 'Pain',
    map: (s, { underlyingPrice })=> s.bid * s.openInterest * Math.abs(s.strikePrice - underlyingPrice),
    perRow: true,
    filter: (s, { underlyingPrice }) => s.putCall === 'CALL' ? s.strikePrice < underlyingPrice :s.strikePrice > underlyingPrice
  },
  { name: 'MM Shares',
    perRow: true,
    map: (s, { underlyingPrice })=> s.delta * s.openInterest,
    init: () => {
      // console.log('hiding tooltips');
      // tooltip.style('display', 'none');
    },
    pivot: (data, { underlyingPrice }) => {
      console.log(data)
      const expirationStrikeMap = (data.reduce((a, s) => ({
        ...a,
        [s.daysToExpiration + ':' +s.strikePrice ]: (a[s.daysToExpiration + ':' + s.strikePrice] || []).concat(s)
      }), {}));
      console.log(expirationStrikeMap);

      const mmHedgedStocks = Object.values(expirationStrikeMap)
        .map(([o1, o2]) => {
          const c = o1.putCall === 'CALL' ? o1 : o2;
          const p = o1.putCall === 'PUT' ? o1 : o2;

          return ({
            'c.openInterest': c.openInterest,
            'p.openInterest': p.openInterest,
            'c.delta': c.delta,
            'p.delta': p.delta,
            'c.gamma': c.gamma,
            'p.gamma': p.gamma,
            value: o1.delta * o1.openInterest + o2.delta * o2.openInterest,
            // both o1, o2 has same expirationDate and strike
            x: parseFloat(o1.strikePrice),
            y: o1.daysToExpiration
          })
        })
      console.log(mmHedgedStocks);
      // return mmHedgedStocks;

      const expirationMap  = (data.reduce((a, s) => ({
        ...a,
        [s.daysToExpiration]: (a[s.daysToExpiration] || [])
        .concat({ ...s, delta: s.delta || 0, gamma: s.gamma || 0 })
      }), {}));
      console.log(expirationMap);

      // find shares needed to hedge existing open interest if the stock goes up/down next day
      const hedgesNeeded = mmHedgedStocks
        .map((obj) => {
          const originalShares = obj.value;
          const strikePrice = obj.x;
          const newShares = expirationMap[obj.y]
            .reduce((a, o) => a + (o.gamma * (strikePrice - o.strikePrice) + o.delta) * o.openInterest , 0);
          return ({
            x: obj.x,
            y: obj.y,
            value: Math.abs(newShares - originalShares)
          });
        })
      return hedgesNeeded;
    }
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
const type = urlParams.get('type')?.toUpperCase() || 'ALL';
const chart = options.findIndex(s => s.name === urlParams.get('chart')) || 0
document.querySelector(`li:nth-child(${chart + 1})`).click();


