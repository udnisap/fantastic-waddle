const symbol = urlParams.get('symbol');
const type = urlParams.get('type');
fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}&contractType=${type}`, {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(data => ({ ...data.callExpDateMap, ...data.putExpDateMap }))
  .then(data => Object.values(data)
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
  )
  .then(data => console.log(data) || data)
  .then(data => {
		const hightlightX =[300]
		draw(data, { hightlightX }) 
});

