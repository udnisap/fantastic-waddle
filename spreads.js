const symbol = urlParams.get('symbol');
const type = urlParams.get('type');
fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}&strategy=VERTICAL&range=ALL`, {
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
    const hightlightX =[ '285.0/290.0'];
    draw(data, {xGroup, hightlightX})
  });

