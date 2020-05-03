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


// set the dimensions and margins of the graph
var margin = {top: 80, right: 25, bottom: 30, left: 40},
  width = 450 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

fetch( "https://api.tdameritrade.com/v1/marketdata/chains?apikey=DUK17TRKRULCUWO0DLQZ0KI2OUYBHY6H&symbol=SPY&contractType=CALL", {
  headers: { 'Authorization': ''}
})
  .then(data => data.json())
  .then(data => [data.callExpDateMap || [], data.putExpDateMap || []])
  .then(([calls, puts]) => {
// const data =[
// {group: "A", variable: "v1", value: "30"},
// {group: "B", variable: "v2", value: "95"}
// ]
const data = Object.values(calls)
      .flatMap(c => Object.values(c).map(d => d[0]))
      .map(s => ({
        ...s,
        value: s.bid_price,
        strikePrice: moment(s.strikePrice).format("MMM Do YY")
      }))
    .slice(0, 10)
    console.log(data)
//Read the data
  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const expirations = Array.from(new Set(data.map(s => s.description)));
    const strikes = Array.from(new Set(data.map(s => s.strikePrice)));
  // var myGroups = d3.map(callExpDateMap, function(d){return d.group;}).keys()
  // var myVars = d3.map(data, function(d){return d.variable;}).keys()

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(expirations)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(strikes)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([1,100])

  // create a tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.value)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.expirations+':'+d.strikePrice;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.expirations) })
      .attr("y", function(d) { return y(d.strikePrice) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.value)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})

// Add title to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("A d3.js heatmap");

// Add subtitle to graph
svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("A short description of the take-away message of this chart.");

