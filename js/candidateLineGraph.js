/*
 * LineGraph - Object constructor function,
 * borrows heavily from Lab 7 and Homework 5
 */

CandidateLineChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};


var brush;
/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

var RepublicanKey = {
    TRUMP: "Donald Trump",
    KASICH: "John Kasich",
    BUSH: "Jeb Bush",
    CRUZ: "Ted Cruz",
    CARSON: "Ben Carson",
    CHRISTIE: "Chris Christie",
    RUBIO: "Marco Rubio",
    ROMNEY: "Mitt Romney",
    RYAN: "Paul Ryan",
    PAUL: "Rand Paul"
};
var DemocratKey = {
    SANDERS: "Bernie Sanders",
    CLINTON: "Hillary Clinton",
    OMALLEY: "Martin OMalley"

};


CandidateLineChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 130, bottom: 20, left: 30 };

    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 200 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width]);
    vis.y = d3.scale.linear()
        .range([vis.height, 0])
        .domain([0, 1]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(d3.time.months, 1)
        .tickFormat(d3.time.format('%b %y'))
        .tickSize(0)
        .tickPadding(8);;

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .ticks(2)
        .orient("left");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");


    // brush
    vis.brush = d3.svg.brush()
        .x(vis.x)
        .on("brush", brushmove)
    brush = vis.brush;

    vis.svg.append("g")
        .attr("class", "brush")
        .call(vis.brush)
        .selectAll('rect')
        .attr('height', vis.height);

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html(function(d) {
            return $(this).attr("d");
        });


    vis.svg.call(vis.tip);


    // draw legend
    vis.legend = vis.svg.selectAll(".legend")
        .data(["Betfair", "PredictIt", "Bookie"])
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    vis.legend.append("rect")
        .attr("x", vis.width + 30)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    // draw legend text
    vis.legendText = vis.legend.append("text")
        .data(["Betfair", "PredictIt", "Bookie"])
        .attr("x", vis.width + 50)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d})

    vis.wrangleData();
};

function brushmove() {
    //$("input.amountCloud[data-index=0]").val(brush.extent()[0] * 1000).toDateString();
    //$("input.amountCloud[data-index=1]").val(brush.extent()[1] * 1000).toDateString();
    wordcloud.min = brush.extent()[0];
    wordcloud.max = brush.extent()[1];
    $( "#slider-range2" ).slider( "option", "values", [ wordcloud.min / 1000, wordcloud.max / 1000 ] );
    //console.log(new Date(wordcloud.min).toDateString());
    $("input.amountCloud[data-index=0]").val(new Date(wordcloud.min).toDateString());
    $("input.amountCloud[data-index=1]").val(new Date(wordcloud.max).toDateString());


    wordcloud.wrangleData();
}

/*
 * Data wrangling
 */

CandidateLineChart.prototype.wrangleData = function(){
    var vis = this;
    var candidateSelected = d3.select("#candidate").property("value");
    var name;
    if (RepublicanKey[candidateSelected] == undefined) {
        vis.displayData = vis.data.democrats;
        name = DemocratKey[candidateSelected.replace("'","")]
    }
    else {
        vis.displayData = vis.data.republicans;
        name = RepublicanKey[candidateSelected]
    }

    vis.format = [];
    vis.names = [];

    // went through and got unique markets based on unique first words
    var marketNames = ["Betfair", "Bookie","PredictIt"];
    //console.log(vis.data.candidates);

    for (var key in vis.displayData.candidates[name]) {
        if ($.inArray(key,marketNames) == -1) continue;
        vis.format.push(vis.displayData.candidates[name][key]);
        vis.names.push(key);
    }
    vis.updateVis();
};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

CandidateLineChart.prototype.updateVis = function(){
    var vis = this;

    // Update x scale after wrangle

    vis.x.domain([timeFormat.parse("12-1-2015"),d3.max(vis.displayData.timestamps)]);

    vis.line = d3.svg.line()
        .interpolate("basis")
        .x(function(d, i) { return vis.x(vis.displayData.timestamps[i]); })
        .y(vis.y);


    vis.lines = vis.svg.selectAll(".line")
        .data(vis.format);

    vis.lines
        .enter().append("path");

    vis.lines
        .exit().transition().duration(800).remove();

    vis.lines
        .transition().duration(800)
        .attr("class", "line")
        .style("stroke", function(d, i) {
            var market = vis.names[i].split(" ");
            market = market[market.length - 1];
            return colorScale(market);
        })
        .attr("d", vis.line)
        .attr("data-legend", function(d,i) { return vis.names[i]})


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};

/* function to show debate dates
 */
var showDebateToggle = 0;
CandidateLineChart.prototype.showDebateDates = function() {
    var vis = this;

    $(".toggle-button").toggleClass('toggle-button-selected');
    if (!showDebateToggle % 2) {
        // show debate dates
        var dates = _.chain(cloudData).map(function(item) { return timeFormat(item.date) }).uniq().value();
        //var RepublicanCandidates =
        dates.forEach( function(d) {
            vis.dateLines = vis.svg.append("line")
                .attr("y1", vis.y(0))
                .attr("y2", vis.y(1))
                .attr("x1", vis.x(timeFormat.parse(d)))
                .attr("x2", vis.x(timeFormat.parse(d)))
                .attr("class", "debateDates")
                .attr("stroke-width", 2)
                .attr("stroke", "black")
                .attr("d", timeFormat.parse(d))
                .style("stroke-dasharray", ("3, 3"))
                .on("mouseover", vis.tip.show)
                .on("mouseout", vis.tip.hide);


        })
        showDebateToggle++;
    }
    else {
        d3.selectAll(".debateDates").remove();
        showDebateToggle--;
    }

};



