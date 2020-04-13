var yaw=0.5,pitch=0.5, width=window.innerWidth, height=window.innerHeight, drag=false;
var ul=d3.select('body')
  .append('ul');
var svg=d3.select('body')
  .append('svg')
  .attr('height',height)
  .attr('width',width);


var group = svg.append("g");

function dataFromFormular(startX, endX, startY, endY, func){
  var output= [];
  for(var x=startX;x<=endX;x++){
    for(var y=startY;y<=endY;y++){
      output.push([x, y, func(x,y)]);
    }
  }
  console.log('output', output)
  return output;
}

const objsToMatrix = data => {
  const output = [];
  const [cMin, cMax] = d3.extent(data.map(s => s.expiration_date));
  const [rMin, rMax] = d3.extent(data.map(s => s.expiration_date));
  const s= dataFromFormular(cMin, cMax, rMin, rMax, (x, y) => 0);
  // console.log(s)
  return s;
}


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
    // console.log(calls)
    var surfaces=[
      {
        name: 'XY',
        data: dataFromFormular(-20, 20, -20, 20, (x,y) => {
          return x*y;
        })
      },
      // {
      //   name: 'Calls',
      //   data: objsToMatrix(calls)
      // },
    ];

    var md=group.data([surfaces[0].data])
      .surface3D(width,height)
      .surfaceHeight(function([x, y, z]){ 
        return z;
      }).surfaceColor(function(z){
        var c=d3.hsl((z+100), 0.6, 0.5).rgb();
        return "rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")";
      });

    ul.selectAll('li')
      .data(surfaces)
      .enter().append('li')
      .html(function(d){
        return d.name
      }).on('mousedown',function(){
        md.data([d3.select(this).datum().data]).surface3D()
          .transition().duration(500)
          .surfaceHeight(function(z){ 
            return z;
          }).surfaceColor(function(z){
            var c=d3.hsl((z+100), 0.6, 0.5).rgb();
            return "rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")";
          });
      });
    svg.on("mousedown",function(){
      drag=[d3.mouse(this),yaw,pitch];
    }).on("mouseup",function(){
      drag=false;
    }).on("mousemove",function(){
      if(drag){            
        var mouse=d3.mouse(this);
        yaw=drag[1]-(mouse[0]-drag[0][0])/50;
        pitch=drag[2]+(mouse[1]-drag[0][1])/50;
        pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch));
        md.turntable(yaw,pitch);
      }
    });

  });


