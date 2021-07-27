/**
 * Created by nhiho on 4/8/16.
 */

WordTime = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    //console.log(this.data);
    this.initVis();
};
var wordTime = new Plottable.Dataset([{"date": timeFormat.parse("1-1-2016"),"wordsCount":0}, {"date": timeFormat.parse("1-1-2016"),"wordsCount":0}]);
WordTime.prototype.initVis = function() {
    var vis = this;

    vis.displayData = vis.data;
    vis.xScale = new Plottable.Scales.Category()
        .domain(d3.map(vis.displayData, function(d) {
            return d3.time.format("%b %e")(d.date);}).keys());
    vis.yScale = new Plottable.Scales.Linear()
        .domain([0,d3.max(function(d) { return d.wordsCount})]);
    var yScaleTickGenerator = Plottable.Scales.TickGenerators.integerTickGenerator();
    vis.yScale.tickGenerator(yScaleTickGenerator);

    vis.xAxis = new Plottable.Axes.Category(vis.xScale, "bottom")
        .yAlignment("center");

    vis.yAxis = new Plottable.Axes.Numeric(vis.yScale, "left");
    vis.plot = new Plottable.Plots.Bar();
    vis.plot.addDataset(wordTime)
        .x(function(d) {
            return d3.time.format("%b %e")(d.date); }, vis.xScale)
        .y(function(d) { return d.wordsCount; }, vis.yScale)
        .attr("stroke","#a6cee3")
        .animated(true);

    vis.chart = new Plottable.Components.Table([
        [vis.yAxis, vis.plot],
        [null, vis.xAxis]
    ]);
};

WordTime.prototype.wrangleData = function(word) {

    //console.log(word);
    var vis = this;
    vis.chosenWord = word;
    var candidateSelected = d3.select("#candidate").property("value");
    //console.log(vis);
    var scratch = vis.data.filter(function (d) {
        return d.candidate == candidateSelected;
    });
    var displayData = [];

    scratch.forEach(function(d) {
        var wordsPresent = [];
        var element = {};
        element.wordsCount = 0;
        element.date = d.date;
        d.words.forEach(function(dWords){
            if (dWords[0] == word) {
                wordsPresent.push(dWords);
                element.wordsCount = dWords[1];
            }
        });
        displayData.push(element);
    });
    vis.displayData = displayData;
    console.log(displayData);
    vis.updateVis();
};


WordTime.prototype.updateVis = function() {
    var vis = this;
    //console.log(vis.chosenWord);
    vis.xScale.domain(d3.map(vis.displayData, function(d) {
        return d3.time.format("%b %e")(d.date);}).keys());
    document.getElementById("word-time-h2").innerHTML = vis.chosenWord;
    wordTime.data(vis.displayData);
    vis.chart.renderTo("svg#word-time");

};