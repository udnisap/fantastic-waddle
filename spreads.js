fetch( "https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=SPY&contractType=CALL&strategy=VERTICAL", {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(data => console.log('RAW', data) || data)
  .then(data => data.monthlyStrategyList
      .flatMap(c => c.optionStrategyList.map(d => ({
        ...d,
        daysToExp: c.daysToExp,
      })))
      .map(s => ({
        ...s,
        value: s.strategyBid,
        value: (s.strategyAsk - s.strategyBid),
        x: s.strategyStrike,
        y: s.daysToExp
      }))
  )
  .then(data => console.log(data) || data)
  .then(data => {
    const xGroup = Array.from(new Set(data.map(s => s.x))).sort((a, b) => {
      const aa = parseFloat(a.split('/')[1]);
      const bb = parseFloat(b.split('/')[1]);
      return aa -bb;
    })
    draw(data, xGroup)
  });

var margin = {top: 80, right: 25, bottom: 30, left: 40},
  width = 4*window.innerWidth - margin.left - margin.right,
  height =window.innerHeight - margin.top - margin.bottom;


