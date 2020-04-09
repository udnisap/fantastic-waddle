
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

init();
