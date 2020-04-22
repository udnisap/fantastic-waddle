function init(){
  var cnt = 0;
  xGrid = [], scatter = [], yLine = [];
  for(var z = -j; z < j; z++){
    for(var x = -j; x < j; x++){
      xGrid.push([x, 1, z]);
      scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++});
    }
  }

  d3.range(-1, 11, 1).forEach(function(d){ yLine.push([-j, -d, -j]); });

  var data = [
    grid3d(xGrid),
    point3d(scatter),
    yScale3d([yLine])
  ];
  processData(data, 1000);
}

d3.selectAll('button').on('click', init);
const now = moment();
d3.csv("/SPY.csv",
  data => {
    const calls = data
      .filter(d => !!d.expiration_date)
      .filter(d => d.type === 'call')
      .map(i => ({
        id: i.id,
        expiration_date: moment(i.expiration_date, 'l').diff(now, 'days'),
        strike_price: i.strike_price,
        ask_price: i.ask_price,
        bid_price: i.bid_price
      }));
    console.log(calls)
  });

init();
