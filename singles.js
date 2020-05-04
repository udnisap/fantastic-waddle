fetch( "https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=SPY&contractType=CALL", {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(data => ({ ...data.callExpDateMap, ...data.putExpDateMap }))
  .then(data => Object.values(data)
      .flatMap(c => Object.values(c).map(d => d[0]))
      .map(s => ({
        ...s,
        value: s.bid,
        // value: s.openInterest,
        // value: s.totalVolume === 0 ? 0 : parseInt(s.openInterest)/parseFloat(s.totalVolume),
        x: parseFloat(s.strikePrice),
        y: s.daysToExpiration
      }))
  )
  .then(data => console.log(data) || data)
  .then(data => draw(data) );

var margin = {top: 80, right: 25, bottom: 30, left: 40},
  width = 4*window.innerWidth - margin.left - margin.right,
  height =window.innerHeight - margin.top - margin.bottom;


