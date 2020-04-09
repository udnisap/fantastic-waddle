var yaw=0.5,pitch=0.5, width=window.innerWidth, height=window.innerHeight, drag=false;
var ul=d3.select('body')
  .append('ul');
var svg=d3.select('body')
  .append('svg')
  .attr('height',height)
  .attr('width',width);


var group = svg.append("g");

function dataFromFormular(startX, endX, startY, endY, func){
  var output=[];
  for(var x=startX;x<=endX;x++){
    var f0=[];            
    output.push(f0);
    for(var y=startY;y<=endY;y++){
      f0.push(func(x,y));
    }
  }
  return output;
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
    console.log(calls)
    var surfaces=[
      {
        name: 'Calls',
        data: dataFromFormular(-20, 20, -20, 20, (x,y) => {
          return Math.random() > .5 ? x * y : 0;
        })
      },
    ];

    var md=group.data([surfaces[0].data])
      .surface3D(width,height)
      .surfaceHeight(function(d){ 
        return d;
      }).surfaceColor(function(d){
        var c=d3.hsl((d+100), 0.6, 0.5).rgb();
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
          .surfaceHeight(function(d){
            return d;
          }).surfaceColor(function(d){
            var c=d3.hsl((d+100), 0.6, 0.5).rgb();
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


