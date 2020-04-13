(function(){
  var Surface=function(node){
    var heightFunction,colorFunction,timer,timer,transformPrecalc=[];
    var displayWidth=300, displayHeight=300, zoom=1;
    var trans;


    this.setZoom=function(zoomLevel){
      zoom=zoomLevel;
      if(timer) clearTimeout(timer);
      timer=setTimeout(renderSurface);
    };

    const drawAxis = (xValues, yValues, zValues) => {
      const xMax = 2;
      const yMax = 1;
      const zMax = 2;
      const [xData]=getTransformedData([[0, 0, 0], [xMax, 0, 0]], 2, 2);
      const [yData]=getTransformedData([[0, yMax, 0]], 1, 1);
      const [zData]=getTransformedData([[0, 0, zMax]], 1, 1);
      let d0 = []
      //x
      d0.push({
        label: 'X-Axis',
        path:
        'M'+(xData[0][0][0]+displayWidth/2).toFixed(10)+','+(xData[0][0][1]+displayHeight/2).toFixed(10)+
        'L'+(xData[xMax][0][0]+displayWidth/2).toFixed(10)+','+(xData[xMax][0][1]+displayHeight/2).toFixed(10)
      });
      //y
      d0.push({
        label: 'Y-Axis',
        path:
        'M'+(xData[0][0][0]+displayWidth/2).toFixed(10)+','+(xData[0][0][1]+displayHeight/2).toFixed(10)+
        'L'+(yData[0][yMax][0]+displayWidth/2).toFixed(10)+','+(yData[0][yMax][1]+displayHeight/2).toFixed(10)
      });
      //z
      d0.push({
        label: 'Z-Axis',
        path:
        'M'+(xData[0][0][0]+displayWidth/2).toFixed(10)+','+(xData[0][0][1]+displayHeight/2).toFixed(10)+
        'L'+(zData[0][0][0]+displayWidth/2).toFixed(10)+','+(zData[0][0][1]+displayHeight/2).toFixed(10)
      });
      var dr=node.selectAll('path.axis').data(d0);
      dr.enter()
        .append("path").attr('class', 'axis').attr('id', ({ label }) => label)

      dr.enter()
        .append('text').attr('font-family',"Verdana").attr('font-size',"42.5").attr('fill',"blue")
        .append('textPath').attr('xlink:href', ({ label })=> "#" + label).text(({ label }) => label )
      if(trans){
        dr=dr.transition().delay(trans.delay()).duration(trans.duration());
      }
      dr.attr("d",function(d){return d.path;});

    }

    const drawGraph = (originalData, xValues, yValues) => {
      let d0 = []
      var [data, original]=getTransformedData(originalData, xValues.length, yValues.length);
      for(var xx=0;xx<xValues.length-1;xx++){
        for(var yy=0;yy<yValues.length-1;yy++){
          const x = (xValues[xx]);
          const y = (yValues[yy]);
          var depth=data[x][y][2]+data[x+1][y][2]+data[x+1][y+1][2]+data[x][y+1][2];
          d0.push({
            path:
            'M'+(data[x][y][0]+displayWidth/2).toFixed(10)+','+(data[x][y][1]+displayHeight/2).toFixed(10)+
            'L'+(data[x+1][y][0]+displayWidth/2).toFixed(10)+','+(data[x+1][y][1]+displayHeight/2).toFixed(10)+
            'L'+(data[x+1][y+1][0]+displayWidth/2).toFixed(10)+','+(data[x+1][y+1][1]+displayHeight/2).toFixed(10)+
            'L'+(data[x][y+1][0]+displayWidth/2).toFixed(10)+','+(data[x][y+1][1]+displayHeight/2).toFixed(10)+'Z',
            depth: depth, data: original[x][y]
          });
        }
      }
      d0.sort(function(a, b){return b.depth-a.depth});
      var dr=node.selectAll('path.graph').data(d0);
      dr.enter().append("path").attr('class', 'graph')
      if(trans){
        dr=dr.transition().delay(trans.delay()).duration(trans.duration());
      }
      dr.attr("d",function(d){return d.path;});
      if(colorFunction){
        dr.attr("fill",function(d){return colorFunction(d.data)});
      }
    }
    var getHeights=function(){
      var data=node.datum();
      var output=[];
      var xlength=data.length;
      var ylength=data[0].length;
      for(var r of data){
        output.push(t=[]);
        for(var c of r){
          var value=heightFunction(c);
          t.push(value);
        }
      }
      return output;
    };
    var transformPoint=function(point){
      var x=transformPrecalc[0]*point[0]+transformPrecalc[1]*point[1]+transformPrecalc[2]*point[2];
      var y=transformPrecalc[3]*point[0]+transformPrecalc[4]*point[1]+transformPrecalc[5]*point[2];
      var z=transformPrecalc[6]*point[0]+transformPrecalc[7]*point[1]+transformPrecalc[8]*point[2];
      return [x,y,z];
    };
    var getTransformedData=function(data, xlength, ylength){
      if(!heightFunction) return [[]];
      var t, output={};
      const originaOutput = {}
      // var heights=getHeights();


      const someConts = 5;

      data.forEach(([x, y, z]) => {
        output[x] = output[x] || {};
        originaOutput[x] = originaOutput[x] || {};
        originaOutput[x][y] = z;
        output[x][y] = (transformPoint([
          (x-xlength/2)/(xlength*someConts)*displayWidth*zoom,
          -z*zoom,
          (y-ylength/2)/(ylength*someConts)*displayWidth*zoom
        ]));
      })
      return [output, originaOutput];
    };
    var renderSurface=function(){
      var originalData=node.datum();
      const xValues = Array.from(new Set(originalData.map(([x]) => x)))
        .sort((a, b) => a- b);

      const yValues = Array.from(new Set(originalData.map(([,x]) => x)))
        .sort((a, b) => a- b);


      // drawAxis(yValues.map(y => ([0, y, 0])), xValues, yValues);
      drawGraph(originalData, xValues, yValues)
      drawAxis(xValues, yValues, [0, 10]);
      trans=false;
    };

    this.renderSurface=renderSurface;
    this.setTurtable=function(yaw, pitch){
      var cosA=Math.cos(pitch);
      var sinA=Math.sin(pitch);
      var cosB=Math.cos(yaw);
      var sinB=Math.sin(yaw);
      transformPrecalc[0]=cosB;
      transformPrecalc[1]=0;
      transformPrecalc[2]=sinB;
      transformPrecalc[3]=sinA*sinB;
      transformPrecalc[4]=cosA;
      transformPrecalc[5]=-sinA*cosB;
      transformPrecalc[6]=-sinB*cosA;
      transformPrecalc[7]=sinA;
      transformPrecalc[8]=cosA*cosB;
      if(timer) clearTimeout(timer);
      timer=setTimeout(renderSurface);
      return this;
    };
    this.setTurtable(0.5,0.5);
    this.surfaceColor=function(callback){
      colorFunction=callback;
      if(timer) clearTimeout(timer);
      timer=setTimeout(renderSurface);
      return this;
    };
    this.surfaceHeight=function(callback){
      heightFunction=callback;
      if(timer) clearTimeout(timer);
      timer=setTimeout(renderSurface);
      return this;
    };
    this.transition=function(){ 
      var transition=d3.selection.prototype.transition.bind(node)();
      colourFunction=null;
      heightFunction=null;
      transition.surfaceHeight=this.surfaceHeight;
      transition.surfaceColor=this.surfaceColor;
      trans=transition;
      return transition;
    };
    this.setHeight=function(height){
      if(height) displayHeight=height;
    };
    this.setWidth=function(width){
      if(width) displayWidth=width;
    };
  };
  d3.selection.prototype.surface3D=function(width,height){
    if(!this.node().__surface__) this.node().__surface__=new Surface(this);
    var surface=this.node().__surface__;
    this.turntable=surface.setTurtable;
    this.surfaceColor=surface.surfaceColor;
    this.surfaceHeight=surface.surfaceHeight;
    this.zoom=surface.setZoom;
    surface.setHeight(height);
    surface.setWidth(width);
    this.transition=surface.transition.bind(surface);
    return this;
  };            
})();
