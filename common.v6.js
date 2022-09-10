
/* RESUABEL D3 */

var colorScale = d3.scaleLinear().domain([ 10, 18, 20, 22, 23, 25])
          .range(["violet", "blue", "lightgreen",  "yellow", "orange", "red"])

var colorScaleTemp = d3.scaleLinear().domain([ 8, 14, 18, 22, 26, 28])
          .range(["darkviolet", "blue", "lightgreen", "yellow", "orange", "red"])

var colorScaleBattery = d3.scaleLinear().domain([ 30, 50, 60,  80, 100])
          .range(["red", "orange", "yellow", "green", "green"])

var colorScaleLight = d3.scaleLinear().domain([ 0, 1, 50, 100])
          .range(["darkblue", "darkorange", "gold",  "yellow"])
