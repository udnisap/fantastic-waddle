const fetch = require('node-fetch');
const cTable = require('console.table');

const getUnusualFor = symbol => fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${symbol}`, {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(resp => {
    const data = Object.values(resp.callExpDateMap)
      .concat(Object.values(resp.putExpDateMap))
      .flatMap(c => Object.values(c).map(d => d[0]))
    const unusual = data
      .map(s => ({
        ...s,
        bet: s.totalVolume * 100 * resp.underlyingPrice,
        unusual: s.openInterest === 0 ? 0: (1.0 * s.totalVolume) / s.openInterest
      }))
      .filter(s => s.totalVolume > 100 )
      .sort((a, b) => b.unusual - a.unusual)
      .slice(0, 5)
      .map(s => ({
        ...s,
        expectedMove: `${((s.strikePrice - resp.underlyingPrice) / resp.underlyingPrice * 100 ).toFixed(2)}%`,
        underlyingPrice: resp.underlyingPrice
      }))
    return unusual;
  })


const stocks = [
"HOKCF",
  "GAB",
  "AEG",
  "BBVA",
  "ITUB",
  "RBS",
  "LFC",
  "FMO",
  "BCS",
  "CCX",
  "CS",
  "MTG",
  "SRG",
  "AMSYF",
  "RYCEY",
  "UBS",
  "GE",
  "CARR",
  "ABB",
  "CYDY",
  "NBLX",
  "PGRE",
  "IBN",
  "OZK",
  "COLD",
  "KEY",
  "PBI",
  "PACW",
  "CNXM",
  "WES",
  "GLW",
  "JBLU",
  "EQH",
  "ON",
  "CFX",
  "HSBC",
  "SAVE",
  "MDP",
  "PDCO",
  "CTSH",
  "DISH",
  "SPR",
  "AER",
  "DD",
  "BK",
  "MET",
  "UN",
  "INFO",
  "EQR",
  "CMA",
  "UL",
  "HIG",
  "UBSI",
  "STT",
  "GWB",
  "OXLC",
  "HTHT",
  "STOR",
  "SCHW",
  "AAL",
  "AMTD",
  "REG",
  "MCD",
  "MEOH",
  "TAP",
  "DENN",
  "ALC",
  "SBGI",
  "UBER",
  "DOW",
  "HXL",
  "IBM",
  "AME",
  "LYB",
  "SLG",
  "UAL",
  "HDB",
  "ALK",
  "VNO",
  "PLAY",
  "DAL",
  "SBUX",
  "LUV",
  "RTX",
  "SWP",
  "OMC",
  "PNC",
  "BUD",
  "RESI",
  "GS",
  "CI",
  "LYFT",
  "DIS",
  "URI",
  "CAT",
  "MTB",
  "TSN",
  "BA",
  "BRK",
  "DE",
]


// const stocks = ['AAPL', 'NFLX', 'GRPN', 'HOG', 'TSLA'];
Promise.all(stocks.map(s => getUnusualFor(s)))
  .then(arr => arr
    .flat()
    .map(({expectedMove, underlyingPrice, symbol,strikePrice, mark,putCall, openInterest, totalVolume, bet, unusual, expirationDate, description, last }) => ({ symbol,strikePrice, putCall, bet: formatMoney(bet), unusual, mark, openInterest, expectedMove, totalVolume, expirationDate, description, last, underlyingPrice }))
    .sort((a, b) => b.unusual - a.unusual)
  )
  .then(s => console.table(s));


// {
//  ask: 152.73
//  askSize: 1
//  bid: 152.25
//  bidAskSize: "1X1"
//  bidSize: 1
//  closePrice: 152.49
//  daysToExpiration: 1
//  deliverableNote: ""
//  delta: 1
//  description: "SPY May 4 2020 130 Call (Weekly)"
//  exchangeName: "OPR"
//  expirationDate: 1
//  expirationType: "S"
//  gamma: 0
//  highPrice: 0
//  inTheMoney: true
//  isIndexOption: null
//  last: 0
//  lastSize: 0
//  lastTradingDay: 1588636800000
//  lowPrice: 0
//  mark: 152.49
//  markChange: 0
//  markPercentChange: 0
//  mini: false
//  multiplier: 100
//  netChange: 0
//  nonStandard: false
//  openInterest: 0
//  openPrice: 0
//  optionDeliverablesList: null
//  percentChange: 0
//  putCall: "CALL"
//  quoteTimeInLong: 1588364099900
//  rho: 0
//  settlementType: " "
//  strikePrice: 130
//  symbol: "SPY_050420C130"
//  theoreticalOptionValue: 152.92
//  theoreticalVolatility: 29
//  theta: 0
//  timeValue: -0.3
//  totalVolume: 0
//  tradeDate: null
//  tradeTimeInLong: 0
//  value: 0
//  vega: 0.151
//  volatility: 5
// }

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e)
  }
};
