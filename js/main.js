// Will be used to the save the loaded JSON data
var allData = [];

// Make UI Slider
$(function () {
  $("#slider-range").slider({
    min: new Date("2016.01.04").getTime() / 1000,
    max: new Date("2016.04.03").getTime() / 1000,
    step: 86400,
    values: [new Date("2016.03.03").getTime() / 1000],
    slide: function (event, ui) {
      $("#amount").val(new Date(ui.values[0] * 1000).toDateString());
      republicanMap.wrangleData();
    //   democratMap.wrangleData();
    },
  });
  $("#amount").val(
    new Date($("#slider-range").slider("values", 0) * 1000).toDateString()
  );
});

// Set ordinal color scale
var colorScale = d3.scale.category20();

// Variables for the visualization instances
var republicanLines,
  democratLines,
  republicanMap,
  democratMap,
  republicanLegend,
  democratLegend,
  candidateLine;

var timeFormat = d3.time.format("%m-%d-%Y");

// Start application by loading the data
loadData();

function loadData() {
  var repURL = "data/table_1505.json";
  var repLocal = "data/repNational.json";

  var demURL = "http://table-cache1.predictwise.com/history/table_1507.json";
  var demLocal = "data/demNational.json";

  // Use the Queue.js library to read data files
  queue()
    .defer(d3.json, repURL)
    // .defer(d3.json, demURL)
    .defer(d3.json, "data/us-10m.json")
    .defer(d3.json, "data/repStates.json")
    .defer(d3.json, "data/demStates.json")
    .defer(d3.json, "data/fipsToState.json")
    .defer(d3.json, "data/codeToFips.json")
    .defer(d3.json, "data/repResults.json")
    .defer(d3.json, "data/demResults.json")
    .await(function (
      error,
      republicanData,
    //   democratData,
      mapTopJson,
      repStates,
      demStates,
      fips,
      ctof,
      repResults,
      demResults
    ) {
      if (error) return console.warn(error);

      //console.log(repResults);

      allData = {
        republicans: initData(republicanData),
        // democrats: initData(democratData),
        usMap: fixStates(
          topojson.feature(mapTopJson, mapTopJson.objects.states).features,
          fips
        ),
        repResults: wrangleResults(repResults),
        // demResults: wrangleResults(demResults),
        repStates: wrangleStates(repStates),
        // demStates: wrangleStates(demStates),
      };

      // console.log(allData.republicans);

      allData["candidateColors"] = {};

      for (var candidateR in allData.republicans.candidates) {
        if (!allData.republicans.candidates.hasOwnProperty(candidateR))
          continue;

        var arrayR = candidateR.split(" ");
        var nameR = arrayR[arrayR.length - 1];

        allData.candidateColors[nameR] = colorScale(nameR);
      }

    //   for (var candidateD in allData.democrats.candidates) {
    //     if (!allData.democrats.candidates.hasOwnProperty(candidateD)) continue;

    //     var arrayD = candidateD.split(" ");
    //     var nameD = arrayD[arrayD.length - 1];

    //     allData.candidateColors[nameD] = colorScale(nameD);
    //   }

      //console.log(allData.demResults);

      createVis();
    });
}

function createVis() {
  republicanLines = new LineChart(
    "republican-line",
    allData.republicans,
    "republican"
  );
//   democratLines = new LineChart("democrat-line", allData.democrats, "democrat");

  republicanMap = new Choropleth(
    "repChoropleth",
    allData.repStates,
    allData.repResults
  );

//   democratMap = new Choropleth(
//     "demChoropleth",
//     allData.demStates,
//     allData.demResults
//   );

  republicanLegend = new Legend("legendR", allData.republicans, "republican");

//   democratLegend = new Legend("legendD", allData.democrats, "democrat");

  candidateLine = new CandidateLineChart("predictor-line", allData);
}

function toggleEvents() {
  $("#btn-events").toggleClass("button-clicked");
  $(".marker").toggle("display");
}

$("#line-select").on("change", function () {
  republicanLines.wrangleData();
//   democratLines.wrangleData();
});

/*
function brushed() {
    // Set new domain if brush (user selection) is not empty
    timeline.xFocus.domain(
        timeline.brush.empty() ? timeline.xContext.domain() : timeline.brush.extent()
    );

    // Update focus chart (detailed information)
    areachart.wrangleData();
}
*/
