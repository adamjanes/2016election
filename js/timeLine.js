/**
 * Created by nhiho on 4/8/16.
 */
TimeLine = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    //console.log(this.data);
    this.initVis();
};

var styleBrush;

TimeLine.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 140, bottom: 30, left: 30 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 100 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    // Scales and axes


    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain([timeFormat.parse("12-1-2015"),timeFormat.parse("5-1-2016")]);
    //console.log(vis.x);
    vis.y = d3.scale.linear()
        .range([vis.height, 0]);


    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(d3.time.months, 1)
        .tickFormat(d3.time.format('%b %y'))
        .tickSize(0)
        .tickPadding(8);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");


    // x-axis
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    // y-axis
    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.brush = d3.svg.brush()
        .x(vis.x)
        .on("brush", brushmoveStyle);
    styleBrush = vis.brush;
    vis.svg.append("g")
        .attr("class", "brush")
        .call(vis.brush)
        .selectAll('rect')
        .attr('height', vis.height);
    vis.wrangleData();
};

function brushmoveStyle() {
    //$("input.amountCloud[data-index=0]").val(brush.extent()[0] * 1000).toDateString();
    //$("input.amountCloud[data-index=1]").val(brush.extent()[1] * 1000).toDateString();
    candidateStyle.min = styleBrush.extent()[0];
    candidateStyle.max = styleBrush.extent()[1];
    document.getElementById("current").innerHTML = timeFormat(candidateStyle.min) + " to " + timeFormat(candidateStyle.max)
    //console.log(candidateStyle.max);
    candidateStyle.wrangleData();
}





TimeLine.prototype.wrangleData = function(word) {


    //console.log(word);
    var vis = this;
    // first, get all the unique dates

    vis.updateVis();
};


TimeLine.prototype.updateVis = function() {
    var vis = this;



    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
};


