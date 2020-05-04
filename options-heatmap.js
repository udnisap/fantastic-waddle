
const draw = function(data, xGroup, yGroup) {
// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");
  //Read the data
  xGroup = xGroup || Array.from(new Set(data.map(s => s.x))).sort((a,b) => a -b)
  yGroup = yGroup || Array.from(new Set(data.map(s => s.y))).sort((a,b) => a -b)

  // Build X scales and axis:
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(xGroup)
    .padding(0.05);

  svg.append("g")
    .style("font-size", 15)
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove()

  // Build Y scales and axis:
  var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(yGroup)
    .padding(0.05);

  svg.append("g")
    .style("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolatePuBuGn)
    .domain(d3.extent(data.map(d => d.value)))

  // create a tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("position", "absolute")
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
      .html(`Value: ${d.value} <br/> Y : ${d.y} days <br/> X: ${d.x} <br/><pre>${JSON.stringify(d, null, 2)}</pre>`)
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
    .data(data, function(d) {return d.x+':'+d.y;})
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.x) })
    .attr("y", function(d) { return y(d.y) })
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
}

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
