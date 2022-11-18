
/* RESUABEL D3 */

var colorScale = d3.scaleLinear().domain([ 10, 18, 20, 22, 23, 25])
          .range(["violet", "blue", "lightgreen",  "yellow", "orange", "red"])

var colorScaleTemp = d3.scaleLinear().domain([ 0, 8, 16, 18, 19, 22, 28, 32])
          .range(["darkturqoise", "darkviolet", "blue", "darkgreen", "green", "yellow", "orange", "red"])

var colorScaleState = d3.scaleLinear().domain([ 0, 100])
          .range(["darkblue", "darkgreen"])

var colorScaleBattery = d3.scaleLinear().domain([ 30, 50, 60,  80, 100])
          .range(["red", "orange", "yellow", "green", "green"])

var colorScaleLight = d3.scaleLinear().domain([ 0, 5, 50, 100])
          .range(["darkblue", "darkorange", "gold",  "yellow"])
