/*
 * LineGraph - Object constructor function,
 * borrows heavily from Lab 7 and Homework 5
 */

LineChart = function(_parentElement, _data, _selector){
    this.parentElement = _parentElement;
    this.data = _data;
    this.selector = _selector;

    // DEBUG RAW DATA
    //console.log(this.data);

    this.initVis();
};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

LineChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 90, right: 60, bottom: 60, left: 60 };

    vis.width = 700 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.data.timestamps));
    //console.log(vis.x);
    vis.y = d3.scale.linear()
        .range([vis.height, 0])
        .domain([0, 1]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(d3.time.months, 1)
        .tickFormat(d3.time.format('%b %y'))
        .tickSize(0)
        .tickPadding(8);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        .tickFormat(d3.format("%"));

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.marksR = [
        {"date" : new Date('2016.02.01'), "label" : "Iowa"},
        {"date" : new Date('2016.02.09'),"label" : "New Hampshire"},
        {"date" : new Date('2016.02.20'),"label" : "South Carolina (R)"},
        {"date" : new Date('2016.03.01'), "label" : "Super Tuesday I"},
        {"date" : new Date('2016.03.05'), "label" : "Super Saturday"},
        {"date" : new Date('2016.03.15'), "label" : "Super Tuesday II"},
        {"date" : new Date('2016.03.22'), "label" : "Super Tuesday III"},
        // Interesting! Trump shares nosedived after abortion comments
        {"date" : new Date('2016.03.29'), "label" : "Republican Town Hall"},
        {"date" : new Date('2016.04.19'), "label" : "Wisconsin"},
        {"date" : new Date('2016.04.05'), "label" : "New York"},
        {"date" : new Date('2016.04.26'), "label" : "Super Tuesday IV"}
    ];

    vis.marksD = [
        {"date" : new Date('2016.02.01'), "label" : "Iowa"},
        {"date" : new Date('2016.02.09'),"label" : "New Hampshire"},
        {"date" : new Date('2016.02.20'),"label" : "Nevada (D)"},
        {"date" : new Date('2016.02.27'),"label" : "South Carolina (D)"},
        {"date" : new Date('2016.03.01'), "label" : "Super Tuesday I"},
        {"date" : new Date('2016.03.05'), "label" : "Super Saturday"},
        {"date" : new Date('2016.03.15'), "label" : "Super Tuesday II"},
        {"date" : new Date('2016.03.22'), "label" : "Super Tuesday III"},
        {"date" : new Date('2016.04.19'), "label" : "Wisconsin"},
        {"date" : new Date('2016.04.05'), "label" : "New York"},
        {"date" : new Date('2016.04.26'), "label" : "Super Tuesday IV"}
    ];


    vis.markers = vis.svg.append("g");

    vis.markers.selectAll(".mark")
        .data(function(){
            if (vis.selector == "republican"){ return vis.marksR; }
            else { return vis.marksD; }
        })
        .enter().append("line")
        .attr("class", "mark marker")
        .attr("stroke", "grey")
        .attr("opacity", 0.5)
        .attr("x1", function(d) { return vis.x(d.date); })
        .attr("x2", function(d) { return vis.x(d.date); })
        .attr("y1", 0)
        .attr("y2", vis.height)
        .style("stroke-dasharray", ("3, 3"))
        .style("display", "none");

    vis.markers.selectAll(".label")
        .data(function(){
            if (vis.selector == "republican"){ return vis.marksR; }
            else { return vis.marksD; }
        })
        .enter().append("text")
        .attr("class", "label marker")
        .attr("transform", function(d){
            return "translate(" + (vis.x(d.date)) + ", -5)rotate(-45)";
        })
        .text(function(d){ return d.label; })
        .style("display", "none");

    // Tooltip Code *******************************************************

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

    vis.focus = vis.svg.append("g")
        .style("display", "none");

    // Append Tooltip Line
    vis.focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", vis.height);

    // append the rectangle to capture mouse
    vis.svg.append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() {
            vis.focus.style("display", null);
            vis.tooltip.show();
        })
        .on("mouseout", function() {
            vis.focus.style("display", "none");
            vis.tooltip.hide();
        })
        .on("mousemove", mousemove);

    vis.bisectDate = d3.bisector(function(d) { return d; }).left;

    function mousemove() {
        var data = vis.data.timestamps,
            x0 = vis.x.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        vis.focus.select(".x")
            .attr("transform", "translate(" + vis.x(d) + ", 0)")
            .attr("y2", vis.height);

        var parseDate = d3.time.format("%m/%d/%Y");

        var title = "Estimates for " + parseDate(x0) + ": <br><br>";

        //console.log(vis.data.candidates);

        var results = [];

        for (var candidate in vis.data.candidates) {
            // skip loop if the property is from prototype
            if (!vis.data.candidates.hasOwnProperty(candidate)) continue;

            var datapoint = vis.data.candidates[candidate][$("#line-select")[0].value][i];

            if (datapoint != ""){
                results.push({
                    "name" : candidate,
                    "num" : datapoint
                });
            }
        }

        var sorted = results.sort(function(fst, snd) {
            return snd.num - fst.num;
        });

        var output = "";

        sorted.forEach(function(d){
            output += d.name + ": " + (d.num * 100).toFixed(1) + "%<br>";
        });

        vis.tooltip.show(title + output);

    }



      /*  // Legend - Buggy
        vis.legend = vis.svg.append("g")
            .attr("class","legend")
            .attr("transform","translate(20,10)");
*/
    vis.wrangleData();
};


/*
 * Data wrangling
 */

LineChart.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();
};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

LineChart.prototype.updateVis = function(){
    var vis = this;
    //console.log("updating");

    vis.format = [];
    vis.names = [];

    for (var key in vis.data.candidates) {
        if (!vis.data.candidates.hasOwnProperty(key)) continue;

        vis.format.push(vis.data.candidates[key][$("#line-select")[0].value]);
        vis.names.push(key);
    }

    vis.line = d3.svg.line()
        .interpolate("cardinal")
        .x(function(d, i) {return vis.x(vis.data.timestamps[i]);})
        .y(vis.y);

    vis.lines = vis.svg.selectAll(".line")
        .data(vis.format);

    vis.lines
        .enter().append("path");

    vis.lines
        .exit().remove();

    vis.lines
        .transition().duration(800)
        .attr("class", "line")
        .style("stroke", function(d, i) {
            var cand = vis.names[i].split(" ");
            cand = cand[cand.length - 1];
            return colorScale(cand);
        })
        .attr("d", vis.line);
        //.attr("data-legend", function(d,i) { return vis.names[i].split(" ")});

    // Call axis functions with the new domain
    //vis.legend.call(d3.legend);
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};
