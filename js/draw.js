
var dataItem = {};

$(document).ready(function () {
    loadData();});
var country_dict = [];

// Loads the CSV file
function loadData() {
    // load the demographics.csv file
    d3.csv("./data/mapData.csv", function (d) {
  // assign it to the data variable, and call the visualize function by first filtering the data
           all_data = d;
           all_data.forEach(function (item) {
             //console.log(item);
              });
              var params = getDataVals();
              var dataItem = findDataItem(params);
              console.log(country_dict);
              visualizeAfricaChart(dataItem);
            });
    // call the visualization function by first findingDataItem
}

function getDataVals(){
  var startyr = parseInt(document.getElementById("startyr").value);
  var endyr = parseInt(document.getElementById("endyr").value);
  return {"start":startyr, "end":endyr}
}



function findDataItem(params) {
  country_dict = [];
  var dataItem = all_data.filter(function (d){
    var is_return = true;
    if (parseInt(d.Year) < params.start || parseInt(d.Year) > params.end) {
      is_return = false
    }
    // filter_attr.forEach(function (a){
    //   if (d[a] == "0")
    //   {is_return = false;}
    return is_return

  })
  // console.log("filtered data is ",filtered);

  dataItem.forEach(function(v) {
    console.log(v);
    countries_list = v.Country.split(",");
    countries_list.forEach(function(c){
      c = c.trim();
      if (c in country_dict) {country_dict[c] +=1 }
      else {country_dict[c] = 1}
    })
  });
  console.log(dataItem);
  return dataItem;
}

function visualizeAfricaChart(dataItem) {

///////Blocks code////////
      var width = 960,
          height = 1000;

      var svg = d3.select("#chart1").append("svg")
          .attr("width", width)
          .attr("height", height);

      // var div = d3.select("body").append("div")
      //     .attr("class", "tooltip")
      //     .style("opacity", 0);


      var tooltip = {
          element: null,
          init: function() {
              this.element = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
          },
          show: function(t) {
              this.element.html(t).transition().duration(200).style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", .9);
          },
          move: function() {
              this.element.transition().duration(30).ease("linear").style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", .9);
          },
          hide: function() {
              this.element.transition().duration(500).style("opacity", 0)
          }};

      tooltip.init();

      var numFormat = d3.format(",d");




      var toGreyExcept = function(t) {

        var color = d3.select(t).style("fill");
        console.log(color)
        d3.selectAll(".subunit").style("fill", function(d) {

          //var a = e.data.color;


          if (!t || this === t) {

            return; }
          return "#cccccc";

          // var n = d3.rgb(a).hsl().darker(2);
          // n.s *= .9;
          // return n.toString()

        });
      };



      d3.json("./data/africaTopoMap.json", function(error, data) {
        if (error) return console.error(error);

        //jenks for color binning
        var colorScale = d3.scale.threshold() // map this range, put it in bins
          .domain([0, 10, 25, 50, 75, 100, 200, 500])
          .range(colorbrewer.OrRd["8"]);

        formatValue = d3.format("s");

        // A position encoding for the key only.
        var x = d3.scale.linear()
            .domain([0, 600])
            .range([0, 600]);

/////this is to make the scale at the top
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(13)
            .tickValues(colorScale.domain())
            .tickFormat(function(d) { return formatValue(d)});

        // key
        var g = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(170,50)");

        //This makes the scale
        g.selectAll("rect")
            .data(colorScale.range().map(function(d, i) {
              return {
                x0: i ? x(colorScale.domain()[i - 1]) : x.range()[0],
                x1: i < colorScale.domain().length ? x(colorScale.domain()[i]) : x.range()[1],
                z: d
              };
            }))
          .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return d.x0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .style("fill", function(d) { return d.z; });

        g.call(xAxis).append("text")
            .attr("class", "caption")
            .attr("y", -6)
            .text("Population in Africa");
        // key end

        var formatNumber = d3.format(",.0f");

        var subunits = topojson.feature(data, data.objects.collection);

        var projection = d3.geo.mercator()
            .center([15, 5])
            .scale(600)
            .translate([width / 2, height / 2]);


        // var projection = d3.geo.albers()
        //     .center([0, 55.4])
        //     .rotate([4.4, 0])
        //     .parallels([50, 60])
        //     .scale(6000)
        //     .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        // function createStuff () {

        d3.selectAll(".subunit").remove();

        var map = svg.append("g")
                      .attr("class", "map");

        var countries = map.selectAll(".subunit")
            .data(topojson.feature(data, data.objects.collection).features)
            //.data(topojson.feature(uk, uk.objects.subunits).features)
            .enter().append("path")
            .attr("class", function(d) { return "subunit " + d.properties.subunit; })
            .attr("d", path)
            .style("fill", function(d, i) {
              var country = d.properties.admin;
              if (country in country_dict) {return colorScale(country_dict[country]);}
              else {return "#808080"}
               });

        // countries.append("title")
        //         .text(function(d, i) { return d.properties.subunit; });

        countries.on("mouseover", function (d, i) {
            //console.log(this)
            this_country = d.properties.subunit
            tooltip.show("<b>" + this_country  + "</b>" + "<br>" + "Current Population: " + numFormat(d.properties.pop_est) +"<br>" + "Number of times featured: " + country_dict[this_country]);
            //toGreyExcept(this);
        });


        countries.on("mousemove", function (d, i) {
            tooltip.move();
            })
            .on("mouseout", function (d, i) {
            //createStuff();
            tooltip.hide();
        });

        // }  // createStuff end
        // createStuff();

        map.append("path")
            .datum(topojson.mesh(data, data.objects.collection, function(a, b) { return a !== b; }))
            .attr("d", path)
            .attr("class", "subunit-boundary");



        // svg.append("path")
        //     .datum(subunits)
        //     .attr("d", path);

      });
}


function updateChart() {
  $("#chart1").empty();
  var params = getDataVals();
  var dataItem = findDataItem(params);
  // dataItem.forEach(function(v) {
  //   console.log(v);});
  visualizeAfricaChart(dataItem);
}
