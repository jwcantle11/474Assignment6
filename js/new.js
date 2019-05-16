"use strict";
/*
Questions:
plotting lines bad (cant reference values for x2)
tool tip (showing 3?)
*/

(function() {
  let data = "no data";
  let svgLinePlot = ""; // keep SVG reference in global scope
  let countryInput = "";
  let allCountryData = "";
  let svgScatterPlot = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    countryInput = d3
      .select("body")
      .append("select")
      .on("change", onChange)
      .style("background-color", "#4286f4")
      .style("color", "white")
      .style("padding", "8px 16px")
      .style("position", "absolute")
      .style("left", "30px")
      .style("top", "30px")
      .style("width", "70px")
      .style("height", "30px")
      .style("font-size", "12px")
      .style("outline", "none");

    svgLinePlot = d3
      .select("body")
      .append("svg")
      .attr("width", 800)
      .attr("height", 800);

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/dataEveryYear.csv").then(csvData => {
      data = csvData;
      allCountryData = csvData;
      console.log(data);
      setCountriesForInput();
      filterByCountry("AUS");
      makeLinePlot("AUS");
    });
  };

  function makeLinePlot(country) {
    let year = data.map(row => parseFloat(row["time"]));
    let population = data.map(row => parseFloat(row["pop_mlns"]));

    let axesLimits = findMinMax(year, population);

    let mapFunctions = drawAxes(
      axesLimits,
      "time",
      "pop_mlns",
      svgLinePlot,
      { min: 80, max: 720 },
      { min: 80, max: 720 }
    );

    plotData(mapFunctions);
    makeLabels();
  }

  function makeLabels() {
    svgLinePlot
      .append("text")
      .attr("x", 150)
      .attr("y", 30)
      .style("font-size", "24pt")
      .text("Population of " + data[0]["location"] + " over time");

    svgLinePlot
      .append("text")
      .attr("x", 350)
      .attr("y", 790)
      .style("font-size", "18pt")
      .text("Year");

    svgLinePlot
      .append("text")
      .attr("transform", "translate(30, 500)rotate(-90)")
      .style("font-size", "18pt")
      .text("Population (millions)");
  }

  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;
    console.log(data);
    let dataToLine = [];
    for (let i = 0; i < data.length - 1; i++) {
      let line = {
        x1: data[i].time,
        x2: data[i + 1].time,
        y1: data[i].pop_mlns,
        y2: data[i + 1].pop_mlns
      };
      dataToLine.push(line);
    }

    // remove div
    d3.select("div").remove();

    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    makeToolTip();

    // Make points
    svgLinePlot
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xMap(d.time))
      .attr("cy", d => yMap(d.pop_mlns))
      .attr("r", 3.5)
      .attr("fill", "#4286f4")
      .on("mouseover", d => {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.99);
        div
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 100 + "px")
          .style("background", "rgba(255, 255, 255, 0.85)")
          .style("height", "600px")
          .style("width", "600px")
          .style("box-shadow", " 0 0 5pt 3pt rgba(41, 121, 255, 0.5)");
      })
      .on("mouseout", d => {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Make line
    svgLinePlot
      .selectAll(".dot")
      .data(dataToLine)
      .enter()
      .append("line")
      .style("stroke", "red") // colour the line

      .attr("x1", d => xMap(d.x1)) // x position of the first end of the line
      .attr("y1", d => yMap(d.y1)) // y position of the first end of the line
      .attr("x2", d => xMap(d.x2)) // x position of the first end of the line
      .attr("y2", d => yMap(d.y2)); // y position of the first end of the line
    //   .attr(
    //     "x2",
    //     d => xMap(d) + 12 //* (parseInt(data[data.indexOf(d) + 1]).time - parseInt(d.time))
    //   ) // x position of the second end of the line
    //   .attr("y2", d => yMap(data[data.indexOf(d) + 1]));
    //   .attr("x1", 50) // x position of the first end of the line
    //   .attr("y1", 450) // y position of the first end of the line
    //   .attr("x2", 88) // x position of the second end of the line
    //   .attr("y2", 450); // y position of the second end of the line
  }

  function makeToolTip() {
    console.log(allCountryData);
    let fert = allCountryData.map(row => parseFloat(row["fertility_rate"]));
    let life = allCountryData.map(row => parseFloat(row["life_expectancy"]));
    let axesLimits = findMinMax(fert, life);

    svgScatterPlot = d3.select("div").append("svg");

    let mapFunctions = drawAxes(
      axesLimits,
      "fertility_rate",
      "life_expectancy",
      svgScatterPlot,
      { min: 50, max: 450 },
      { min: 50, max: 450 }
    );
    let xMap2 = mapFunctions.x;
    let yMap2 = mapFunctions.y;

    svgScatterPlot
      .attr("width", 500)
      .attr("height", 500)
      .selectAll(".dot")
      .data(allCountryData)
      .enter()
      .append("circle")
      .attr("cx", d => xMap2(d.fertility_rate))
      .attr("cy", d => yMap2(d.life_expectancy))
      .attr("r", 1)
      .attr("fill", "#4286f4");
    makeToolTipLabels();
  }

  function makeToolTipLabels() {
    svgScatterPlot
      .append("text")
      .attr("x", 100)
      .attr("y", 30)
      .style("font-size", "16pt")
      .text("Fertility Rate vs Life Expectancy");
    svgScatterPlot
      .append("text")
      .attr("x", 200)
      .attr("y", 490)
      .style("font-size", "14pt")
      .text("Fertility Rate");
    svgScatterPlot
      .append("text")
      .attr("transform", "translate(15, 300)rotate(-90)")
      .style("font-size", "14pt")
      .text("Life Expectancy");
  }

  // When user selects new year
  function onChange() {
    let country = d3.select("select").property("value");
    //resetting svg
    d3.selectAll("svg > *").remove();
    let svgScatterPlot = d3
      .select("body")
      .append("svg")
      .attr("width", 500)
      .attr("height", 500);
    filterByCountry(country);
    makeLinePlot(country);
  }

  function filterByCountry(country) {
    data = allCountryData.filter(row => row["location"] == country);
  }

  function setCountriesForInput() {
    var flags = [],
      output = [],
      l = data.length,
      i;
    for (i = 0; i < l; i++) {
      if (flags[data[i].location]) continue;
      flags[data[i].location] = true;
      countryInput
        .append("option")
        .attr("value", data[i].location)
        .text(data[i].location);
      output.push(data[i].location);
    }
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) {
      return +d;
    };

    // function to scale x value
    let xScale = d3
      .scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) {
      return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svg
      .append("g")
      .attr("transform", "translate(0, " + rangeY.max + ")")
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) {
      return +d;
    };

    // function to scale y
    let yScale = d3
      .scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function(d) {
      return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg
      .append("g")
      .attr("transform", "translate(" + rangeX.min + ", 0)")
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {
    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    };
  }
})();
