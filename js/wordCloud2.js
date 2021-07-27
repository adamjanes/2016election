/**
 * Created by nhiho on 4/7/16.
 */


WordCloud = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    //console.log(this.data);
    this.initVis();
};


WordCloud.prototype.initVis = function() {
    var vis = this;


    vis.height = screen.height / 1.5;
    vis.width = 550;


    vis.svg = d3.select("#word-cloud").append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .append("g")
        .attr("transform", "translate(" + vis.width/2 +"," + vis.height/2 + ")");

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html(function(d) {
            return d.size/25
        });

    vis.svg.call(vis.tip);


    vis.wrangleData();





};
WordCloud.prototype.wrangleData = function() {
    var vis = this;
    var candidateSelected = d3.select("#candidate").property("value");
    // local date parser due to different format
    vis.parseDate = d3.time.format("%Y-%m-%d");
    // Get date value from slider
    var startDate = vis.parseDate.parse(vis.parseDate((new Date($( "#slider-range2" ).slider("values", 0)*1000))));
    var endDate = vis.parseDate.parse(vis.parseDate((new Date($( "#slider-range2" ).slider("values", 1)*1000))));

    vis.displayData = vis.data.filter(function (d) {
        return d.candidate == candidateSelected && d.date >= startDate && d.date <= endDate ;
    });

    // combines word frequency from different debate dates
    var allWords = [];
    vis.displayData.forEach(function(d,i) {
        d.words.forEach(function (d2, i2){
            allWords[i*i2+i2] = {
                "text": d2[0],
                "frequency": d2[1]
            }
        })
    });
    var wordSet = [];
    var combined = [];
    var inArray;
    allWords.forEach(function(item,i) {
        inArray = $.inArray(item.text, wordSet);
        if (inArray == -1) {
            wordSet.push(item.text);
            combined.push(item);
        }
        else {
            combined[inArray].frequency = combined[inArray].frequency + item.frequency;
        }
    });

    // sort based on descending frequency
    combined.sort( function(a, b) {
        return b.frequency - a.frequency;
    });

    vis.displayData = combined;

    vis.updateVis();

};



WordCloud.prototype.updateVis = function() {
    var vis = this;

    d3.layout.cloud().size([vis.width, vis.height])
        .words(vis.displayData)
        .rotate(0)
        .fontSize(function(d) {
            return d.frequency*25; })
        .on("end", draw)
        .start();

    function draw(words) {
        var wordcloud = vis.svg
            .selectAll("text")
            .data(words);

        wordcloud
            .enter().append("text");
        wordcloud
            .transition()
            .duration(800)
            .style("font-size", function(d) {
                return d.size/2 + "px";})
            .style("fill", function(d, i) { return grayScale(i); })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) {
                return d.text;});

        wordcloud
            .on("mouseover", vis.tip.show)
            .on("mouseout", vis.tip.hide)
            .on("click", function(d) {
                //console.log(d);
                wordtime.wrangleData(d.text);
            });
        wordcloud.exit().transition()
            .duration(800).remove()
            .style("font-size", "0px")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text;})
            .transition().duration(800).style("font-size", function(d) { return d.size/2 + "px";});
    }
};
