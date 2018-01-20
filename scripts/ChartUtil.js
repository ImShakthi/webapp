var ChartUtil = {
  barChart: null,

  init: function() {

  },
  selectCharts: function() {
    var chartTypeId = parseInt(document.querySelector('input[name = "chartType"]:checked').value);
    document.getElementById("canvas").innerHTML = "";
    switch (chartTypeId) {
      case ChartTypeEnum.BAR:
        ChartUtil.generateBarChart();
        break;

      case ChartTypeEnum.CIRCLE_ZOOM_PACK:
        ChartUtil.generateZoomableCircle();
        break;
      default:
        console.log("default block... ");
        break;
    }
  },
  generateBarChart: function() {
    try {
      // #d3-chart

      // set the dimensions and margins of the graph
      var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 40
        },
        width = 500 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

      // set the ranges
      var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
      var y = d3.scaleLinear()
        .range([height, 0]);

      // append the svg object to the body of the page
      // append a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      ChartUtil.barChart = d3.select("#canvas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // get the data
      d3.csv("data/bar-data.csv", function(error, data) {
        console.log(data, error);
        if (error) throw error;


        // format the data
        data.forEach(function(d) {
          d.sales = +d.sales;
        });

        // Scale the range of the data in the domains
        x.domain(data.map(function(d) {
          return d.salesperson;
        }));
        y.domain([0, d3.max(data, function(d) {
          return d.sales;
        })]);

        // append the rectangles for the bar chart
        ChartUtil.barChart.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) {
            return x(d.salesperson);
          })
          .attr("width", x.bandwidth())
          .attr("y", function(d) {
            return y(d.sales);
          })
          .attr("height", function(d) {
            return height - y(d.sales);
          });

        // add the x Axis
        ChartUtil.barChart.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // add the y Axis
        ChartUtil.barChart.append("g")
          .call(d3.axisLeft(y));

      });

    } catch (e) {
      console.log(e);
      alert(e);
    }
  },
  generateZoomableCircle: function() {
    try {

      var svg = d3.select("#canvas")
        .append("svg:svg")
        .attr("width", 500)
        .attr("height", 500);

      var margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

      var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

      var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

      d3.json("data/flare.json", function(error, root) {
        if (error) throw error;

        root = d3.hierarchy(root)
          .sum(function(d) {
            return d.size;
          })
          .sort(function(a, b) {
            return b.value - a.value;
          });

        var focus = root,
          nodes = pack(root).descendants(),
          view;

        var circle = g.selectAll("circle")
          .data(nodes)
          .enter().append("circle")
          .attr("class", function(d) {
            return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
          })
          .style("fill", function(d) {
            return d.children ? color(d.depth) : null;
          })
          .on("click", function(d) {
            if (focus !== d) zoom(d), d3.event.stopPropagation();
          });

        var text = g.selectAll("text")
          .data(nodes)
          .enter().append("text")
          .attr("class", "label")
          .style("fill-opacity", function(d) {
            return d.parent === root ? 1 : 0;
          })
          .style("display", function(d) {
            return d.parent === root ? "inline" : "none";
          })
          .text(function(d) {
            return d.data.name;
          });

        var node = g.selectAll("circle,text");

        svg
          .style("background", color(-1))
          .on("click", function() {
            zoom(root);
          });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
          var focus0 = focus;
          focus = d;

          var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
              return function(t) {
                zoomTo(i(t));
              };
            });

          transition.selectAll("text")
            .filter(function(d) {
              return d.parent === focus || this.style.display === "inline";
            })
            .style("fill-opacity", function(d) {
              return d.parent === focus ? 1 : 0;
            })
            .on("start", function(d) {
              if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function(d) {
              if (d.parent !== focus) this.style.display = "none";
            });
        }

        function zoomTo(v) {
          var k = diameter / v[2];
          view = v;
          node.attr("transform", function(d) {
            return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
          });
          circle.attr("r", function(d) {
            return d.r * k;
          });
        }
      });
    } catch (e) {
      alert(e);
      console.log(e);
    }
  }

};
ChartUtil.init();
