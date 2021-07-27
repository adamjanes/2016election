/**
 * Borrows heavily from Choropleth work in the midterm project
 */


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Choropleth = function(_parentElement, _data, _results){
    this.parentElement = _parentElement;
    this.data = _data;
    this.results = _results;

    // DEBUG RAW DATA
    //console.log(this.data);

    this.initVis();
};

Choropleth.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 10, right: 60, bottom: 60, left: 30 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.colCutoffs = [2, 5, 10, 15, 20, 25, 30];

    // --> Choropleth implementation
    vis.projection = d3.geo.albersUsa()
        .scale(700)
        .translate([vis.width / 2, vis.height / 2]);


    vis.colorScale = d3.scale.linear()
        .domain(vis.colCutoffs);

    // Tooltip
    vis.tooltip = {
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
        }
    };

    vis.tooltip.init();


    vis.wrangleData();
};



Choropleth.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();
};


Choropleth.prototype.updateVis = function() {
    var vis = this;

    // Date parsers to convert strings to date objects
    vis.parseDate = d3.time.format("%Y-%m-%d");
    vis.parseDate2 = d3.time.format("%Y%m%d");

    // Get date value from slider
    vis.date = vis.parseDate((new Date($( "#slider-range" ).slider("values", 0)*1000)));


    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.state = vis.svg.selectAll(".state")
        .data(allData.usMap);

    vis.state
        .exit().remove();

    vis.state
        .enter().append("path")
        .attr("d", vis.path)
        .attr("class", "state");

    vis.state
        .attr("fill", function(d) {
            return getColor(d.state);
        })
        .attr("stroke", "black")
        .attr("stroke-opacity", function(d) {
            var opacity = 0.3;

            if (vis.results[d.state] != undefined){
                var finished = vis.results[d.state]["electiondate"];
                if ((finished != "") && ((vis.parseDate.parse(vis.date) - vis.parseDate2.parse(finished)) > 0)) {
                    opacity = 1;
                }
            }
            return opacity;
        });

    vis.state
        .on("mouseover", function (d) {
            var state = d.state;

            var title = "<b>" + d.state + "</b>";

            var output = "";

            if (vis.data.states[d.state] != undefined) {
                data = vis.data.states[state][(vis.data.timestamps[vis.date])];

                if (data[0] != undefined) {
                    if ((data[0]["price"]) != null) {
                        output = "<b> - Predicit Estimates: </b> <br>";

                        var total = 1;

                        data.forEach(function (d) {
                            total += (d["price"]);
                        });

                        if (total != 1) {
                            total--;
                        }

                        data.forEach(function (d) {
                            output += d["name"] + ": " + ((d["price"]/total)*100).toFixed(1) + "%<br>";
                        });
                    }
                }

                if (vis.results[state] != undefined){
                    var finished = vis.results[state]["electiondate"];
                    if ((finished != "") && ((vis.parseDate.parse(vis.date) - vis.parseDate2.parse(finished)) > 0)) {
                        output = " <b>- Election Results " + (finished) + ":</b> <br>";

                        vis.results[state]["candidates"].forEach(function(d) {
                            output += d["name"] + ": " + d["pctDecimal"] + "%<br>";
                        });
                    }

                }

            }

            else {
                title += "</b><br>";
                output = "No Data Available";
            }

            vis.tooltip.show(title + output);
        });



    vis.state
        .on("mousemove", function (d, i) {
            vis.tooltip.move();
        })
        .on("mouseout", function (d, i) {
            vis.tooltip.hide();
        });


    function getColor(state) {
        var shade = "grey";

            var data;

            if (vis.data.states[state] != undefined){
         //       console.log(vis.date);
                data = vis.data.states[state][(vis.data.timestamps[vis.date])];
           //     console.log(data);
                if (data[0] != undefined){
                    if((data[0]["price"]) != null) {
                        var difference = data[0]["price"] - data[1]["price"];
                        var winnerColor =  allData.candidateColors[data[0]["name"]];
                        shade = colorLuminance(winnerColor, (1 - difference)/3);
                    }
                }
            }

            if (vis.results[state] != undefined){
                var finished = vis.results[state]["electiondate"];
                if ((finished != "") && ((vis.parseDate.parse(vis.date) - vis.parseDate2.parse(finished)) > 0)) {
                    var winner = vis.results[state]["candidates"][0]["name"];
                    if (vis.results[state]["candidates"][1] == undefined) {
                        shade = colorLuminance(allData.candidateColors[winner], 0.2);
                    }
                    else {
                        var difference2 = vis.results[state]["candidates"][0]["pctDecimal"] -
                            vis.results[state]["candidates"][1]["pctDecimal"];
                        var winnerColor2 = allData.candidateColors[winner];
                        shade = colorLuminance(winnerColor2, (1 - (difference2/100))/4);
                    }
                }
            }
        return shade;

    }

    function colorLuminance(hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    }
};

