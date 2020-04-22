var yaw=0.5,pitch=0.5, width=window.innerWidth, height=window.innerHeight, drag=false;
var ul=d3.select('body')
  .append('ul');
var svg=d3.select('body')
  .append('svg')
  .attr('height',height)
  .attr('width',width)
  .attr('xmlns','http://www.w3.org/2000/svg')
  .attr('xmlns:xlink','http://www.w3.org/1999/xlink')


var group = svg.append("g");

function dataFromFormular(startX, endX, startY, endY, func){
  var output= [];
  for(var x=startX;x<=endX;x++){
    for(var y=startY;y<=endY;y++){
      output.push([x, y, func(x,y)]);
    }
  }
  return output;
}

const objsToMatrix = data => {
  const [matE, matS] = data.reduce(([mapE, mapS], d) =>{
    const s = d.x;
    const e = d.y;
    mapE[e] = mapE[e] || {};
    mapE[e][s] = d;
    mapS[s] = mapS[s] || {};
    mapS[s][e] = d;
    return [mapE, mapS];
  }, [{}, {}]);
  const sVals = new Set(data.map(s => s.x))
  const eVals = new Set(data.map(s => s.y));
  const output = [];
  for(let sVal of sVals){
    for(let eVal of eVals){
      if (matE[eVal][sVal]) {
        output.push([eVal, sVal, matE[eVal][sVal].z]);
      } else {
        const estimate1 = calculateEstimate(
          matE[eVal],
          Object.values(matE[eVal]).map(d => d.x),
          sVal
        );
        const estimate2 = calculateEstimate(
          matS[sVal],
          Object.values(matS[sVal]).map(d => d.y),
          eVal
        );
        output.push([eVal, sVal, Math.max(estimate1, estimate2)]);
      }
    }
  }
  return output;
}

// find price of strike s in chain at expiration
const calculateEstimate = (mat, values, s) => {
  const [lowestS, highestS] = values.reduce(([l, h], d) => {
    return [
      Math.max(l, d < s ? d : -Infinity),
      Math.min(h, d > s ? d : Infinity)
    ]
  }, [-Infinity, Infinity])
  if (highestS !== Infinity && lowestS !== -Infinity) {
    return Math.abs(mat[lowestS].z + (mat[highestS].z - mat[lowestS].z) / (highestS - lowestS) * (s -lowestS));
  } else if (lowestS === -Infinity && highestS !== Infinity) {
    return mat[highestS].z;
  } else if (highestS === Infinity ** lowestS !== -Infinity) {
    return mat[lowestS].z;
  } else {
    return 0;
  }
}


const now = moment();
// d3.csv("/SPY.csv",
//   data => {
//     const calls = data
//       .filter(d => !!d.expiration_date)
//       .filter(d => d.type === 'call')
//       .map(i => ({
//         id: i.id,
//         expiration_date: moment(i.expiration_date, 'l').diff(now, 'days'),
//         strike_price: parseInt(i.strike_price),
//         ask_price: parseFloat(i.ask_price),
//         bid_price: parseFloat(i.bid_price),
//         y: moment(i.expiration_date, 'l').diff(now, 'days'),
//         x: parseInt(i.strike_price),
//         z: parseFloat(i.ask_price),
//       }))
// console.log(calls)
var surfaces=[
  {
    name: 'Flower',
    data: dataFromFormular(-20, 20, -20, 20, (x,y) => {
      return Math.sin(Math.sqrt(x*x+y*y)/5*Math.PI)*50;
    })
  },
  {
    name: 'Steps',
    data: dataFromFormular(-20, 20, -20, 20, (x,y) => {
      if (x > 0 && y > 0) {
        return 5;
      } 
      if (x < 0 && y > 0) {
        return 10;
      } 
      if (x > 0 && y < 0) {
        return -5;
      } 
      if (x < 0 && y < 0) {
        return -10;
      } 
      return 0;
    })
  },
  {
    name: 'XY',
    data: dataFromFormular(-20, 20, -20, 20, (x,y) => {
      return x*y;
    })
  },
  {
    name: '5',
    data: dataFromFormular(-20, 20, -20, 20, (x,y) => {
      return 5;
    })
  },
  // {
  //   name: 'Calls',
  //   data: objsToMatrix(calls)
  // },
];

var md=group.data([surfaces[0].data])
  .surface3D(width,height)
  .surfaceHeight(function(z){ 
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
    update([d3.select(this).datum().data]);
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

// });

const update = data => {
  md.data(data).surface3D()
    .transition().duration(500)
    .surfaceHeight(function(z){ 
      return z;
    }).surfaceColor(function(z){
      var c=d3.hsl((z+100), 0.6, 0.5).rgb();
      return "rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")";
    });

}

fetch( "https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=SPY&contractType=CALL", {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(data => {
console.log(data)
})
