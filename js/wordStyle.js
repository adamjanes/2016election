/**
 * Created by nhiho on 4/8/16.
 */
CandidateStyle = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    //console.log(this.data);
    this.initVis();
};



CandidateStyle.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 100, right: 140, bottom: 30, left: 30 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    // Scales and axes


    vis.x = d3.scale.linear()
        .range([0, vis.width]);
    //console.log(vis.x);
    vis.y = d3.scale.linear()
        .range([vis.height, 0])


    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");


    // AXIS
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg
        .append("text")
        .attr("class", "label")
        .attr("x", vis.width - 10)
        .attr("y", vis.height - 5)
        .style("font-size", "12px")
        .style("text-anchor", "end")
        .text("Subjectivity");

    vis.svg
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("font-size", "12px")
        .style("text-anchor", "end")
        .text("Polarity");

    // tool tip
    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html(function(d) {
            return d.candidate
        });

    vis.svg.call(vis.tip);


    // sort data based on debate date
    vis.data.sort(function(a, b) {return a.date - b.date});



    // prepare data!
    vis.allCandidates = _.chain(vis.data).map(function(d) {
        return d.candidate;
    }).uniq().value();
    vis.allDates = _.chain(vis.data).map(function(d) {
        return timeFormat(d.date);
    }).uniq().value();

    // draw legend
    vis.legend = vis.svg.selectAll(".legend")
        .data(vis.allCandidates)
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
        .data(vis.allCandidates)
        .attr("x", vis.width + 50)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d})


    // plot empty graph

    vis.scatter = vis.svg.selectAll(".dot")
        .data(vis.data);

    vis.scatter
        .enter().append("circle");

    vis.scatter
        .on("mouseover", vis.tip.show)
        .on("mouseout", vis.tip.hide)


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
    //vis.wrangleData();


};

CandidateStyle.prototype.wrangleData = function() {


    //console.log(word);
    var vis = this;
    displayData = vis.data.filter(function(d) {
        if (typeof vis.min === 'string') {
            return timeFormat(d.date) >= vis.min && timeFormat(d.date) <= vis.max;
        }
        else {
            return d.date >= vis.min && d.date <= vis.max;
        }

    })

    vis.minPolarity = d3.extent(vis.data.map(function(d) {
        return d.polarity;
    }))
    vis.minSubjectivity = d3.extent(vis.data.map(function(d) {
        return d.subjectivity;
    }))
    var candidate;
    var mean;
    vis.displayData = []
    vis.allCandidates.forEach(function(cand) {
        mean = {};
        candidate = displayData.filter(function(d) {
            return d.candidate == cand;
        })
        if (candidate.length > 0) {
            //console.log(subjectivity)
            mean.candidate = cand;
            mean.subjectivity = d3.mean(candidate.map(function(d) { return d.subjectivity}))
            mean.polarity = d3.mean(candidate.map(function(d) { return d.polarity}))
            mean.debate_name = candidate[0].debate_name;
            mean.short_sentence = d3.mean(candidate.map(function(d) { return d.short_sentence}))
        }
        else {
            mean.candidate = cand;
            mean.subjectivity = vis.minSubjectivity[0];
            mean.polarity = vis.minPolarity[0];
            mean.debate_name = ""
            mean.short_sentence = 0;
        }

        mean.candidate = cand;

        vis.displayData.push(mean);

    })

    vis.updateVis();
};

CandidateStyle.prototype.updateVis = function() {
    var vis = this;



    vis.x.domain([vis.minSubjectivity[0] - 0.01, vis.minSubjectivity[1] + 0.01]);
    vis.y.domain([vis.minPolarity[0] - 0.01, vis.minPolarity[1] + 0.01]);


    //console.log(displayData);
    vis.svg.selectAll("circle")
        .data(vis.displayData)
        .transition()
        .duration(1000)
        .delay(function(d, i) {
            return i/vis.displayData.length * 500;
        })
        .attr("cx", function(d) {
            return vis.x(d.subjectivity);
        })
        .attr("cy", function(d) {
            return vis.y(d.polarity);
        })
        .attr("r", function(d) {
            return d.short_sentence * 100;
        })
        .style("stroke", function(d) {
            if (d.debate_name[0] == "R") {
                return "red"
            }
            else {
                return "blue"
            }
        })
        .style("stroke-width", 2)
        .attr("fill", function(d) {
            return colorScale(d.candidate)
        })

    vis.svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(vis.xAxis)

    vis.svg.select(".y-axis")
        .transition()
        .duration(100)
        .call(vis.yAxis)
}


var index = 0;
d3.select("#next")
    .on("click", function() {
        //console.log(candidateStyle.allDates)
        //console.log(index);
        if (candidateStyle.allDates[index + 1] !== undefined) {
            index++;
            candidateStyle.min = candidateStyle.allDates[index];
            candidateStyle.max = candidateStyle.allDates[index];
            document.getElementById("current").innerHTML = candidateStyle.allDates[index]
            candidateStyle.wrangleData();
        }


    })

d3.select("#prev")
    .on("click", function() {

        if (candidateStyle.allDates[index - 1] !== undefined) {
            index--;
            candidateStyle.min = candidateStyle.allDates[index];
            candidateStyle.max = candidateStyle.allDates[index];

            document.getElementById("current").innerHTML = candidateStyle.allDates[index]
            candidateStyle.wrangleData();
        }

    })

