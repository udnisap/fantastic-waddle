// const speadUp = 10;
const ticker = 'SPY';
const type = 'C';

(async () => {
  const initial = await fetch( `https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=${ticker}`, {
      headers: { 'Authorization': ''}
    })
    .then(data => data.json())
    .then( resp => Object.values(resp.callExpDateMap)
      .concat(Object.values(resp.putExpDateMap))
    )
    .then(resp => {
      return resp
        .flatMap(c => Object.values(c).map(d => d[0]))
        .map(s => ({
          ...s,
          value: 0,
          x: parseFloat(s.strikePrice),
          y: s.daysToExpiration
        }))
    });

  const ticks = await d3.csv('sales.csv', i => ({
    ...i,
    date: moment(i.date, 'HH:mm:ss')
  })).then(s => s.reverse());
  console.log(ticks)

  const renderUpto = time => {
    console.log(time.format());
    let current = JSON.parse(JSON.stringify(initial));
    const subTime = ticks
      .filter(s => s.date.diff(time) < 0);

    subTime
      .forEach(tick => {
        const optionId= getSymbol(ticker, tick.option);
        const s = current.find(s => s.symbol === optionId);
        if (!s) {
          debugger;
        } else {
          s.value += parseInt(tick.qty);
        }
      });
    draw(current);
    const last = subTime[subTime.length - 1];
    if (last)
    svg.select('text.sub').text(`Stock: $${last.underlying} at ${time.format()}`);
  }

  const min = ticks[0].date.unix();
  const max = ticks[ticks.length - 1].date.unix();
  slider
    .attr('min', min)
    .attr('max', max)
    .on("input", function() {
      const currentTime = moment.unix(this.value);
      renderUpto(currentTime);
    })

  const speed = (max - min) / 100;
  play.on('click', () => {
    const value = document.querySelector('input').value ;
    if (timeout) {
      clearInterval(timeout)
    } else {
      let current = min;
      renderUpto(moment.unix(current));
      timeout = setInterval(() => {
        if (current > max)
          clearInterval(timeout)
        current+= speed;
        document.querySelector('input').value = current;
        renderUpto(moment.unix(current));
      }, 1000);
    }
  })
})
();

let timeout = null;
const play = d3.select("#my_dataviz")
  .append('button')
  .text('PLAY')
const slider = d3.select("#my_dataviz").append('input')
  .attr('type', 'range')
  .style('width', '100%');


const monthMap = {
  JAN: '01',
  FEB: '02',
  MAR: '03',
  APR: '04',
  MAY: '05',
  JUN: '06',
  JUL: '07',
  AUG: '08',
  SEP: '09',
  OCT: '10',
  NOV: '11',
  DEC: '12',
}
// 1 JUN 20 315 P => SPY_050420C130
const getSymbol = (ticker, option )=> {
  let [day, month, year, strikePrice, type] = option.split(' ');
  strikePrice = strikePrice[0] === '0' ? strikePrice.substr(1): strikePrice;
  day = ("0" + day).substr(-2);
  month = monthMap[month];
  return `${ticker}_${month}${day}${year}${type}${strikePrice}`;
}

