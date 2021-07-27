/**
 * Created by nhiho on 4/27/16.
 */
var cloudData;
var wordcloud, wordtime;
var candidateStyle;
var timeLine;



// wordcloud code taken from http://jsfiddle.net/adiioo7/rutpj/light/
$( "#slider-range2" ).slider({
    min: new Date('2015-12-01').getTime() / 1000,
    max: new Date('2016-05-01').getTime() / 1000,
    step: 86400,
    values: [20, 30],
    slide: function( event, ui ) {
        $("input.amountCloud[data-index=0]").val(new Date(ui.values[0] * 1000).toDateString());
        $("input.amountCloud[data-index=1]").val(new Date(ui.values[1] * 1000).toDateString());
        wordcloud.wrangleData();
    }
});
$( "#amount2" ).val( (new Date($( "#slider-range2" ).slider("values", 0)*1000).toDateString()) );

var colorScale = d3.scale.category20();

var predictorLine;
// Initialize data
loadDataWord();
var grayScale = d3.scale.linear()
    .domain([0,1,2,3,4,5,6,10,15,20,100])
    .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

// Load CSV file
function loadDataWord() {
    d3.json("data/DebateTranscripts.json", function(error, data) {
        if (error) {
            return console.log("data load errored");
        }
        data.forEach(function(d) {
            d.date = timeFormat.parse(d.date);
        });
        cloudData = data;
        // make the dropbox
        var allCandidates = _.chain(cloudData).map(function(d) {
            return d.candidate;
        }).uniq().value();

        // removes Fiorina because we don't have predictit data for her
        allCandidates.splice(allCandidates.indexOf('FIORINA'),1);
        allCandidates.forEach(function(cand) {
            document.getElementById("candidate").innerHTML += '<option value="' + cand+'">'+cand+'</option>'
        })

        $( "#slider-range2" ).slider( "option", "values", [ new Date('2015-12-01').getTime() / 1000, new Date('2016-05-01').getTime() / 1000 ] );
        createWordVis();

    });
}

function createWordVis() {

    // currently passing in an array of all nouns that trump said
    wordcloud = new WordCloud("word-cloud", cloudData);
    wordtime = new WordTime("word-time", cloudData);
    candidateStyle = new CandidateStyle("speech-style", cloudData);
    timeLine = new TimeLine("time-line",cloudData);
    document.getElementById("next").click();


}

function update() {
    wordcloud.wrangleData();
    candidateLine.wrangleData();
    //sentiment.wrangleData()
}