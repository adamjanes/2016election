/**
 * Created by Adam on 4/17/2016.
 */

function initData(data) {
    var candidates = {};

    // Timestamp array for reference
    var timestamps = [];

    // Date parser to convert strings to date objects
    var parseDate = d3.time.format("%m-%d-%Y %I:%M%p").parse;

    // Create object for each candidate
    data["latest"].forEach(function(candidate, candidateIndex) {
        var exclude = ["Rick Santorum", "George Pataki", "Bobby Jindal", "Rick Santorum", "Lindsey Graham", "Scott Walker",
        "Mike Huckabee", "Carly Fiorina", "Al Gore", "Lincoln Chafee", "Elizabeth Warren", "Jim Webb", "Joe Biden"];

        if (exclude.indexOf(candidate[0]) < 0) {
            candidates[candidate[0]] = {};
        }

        // Add empty array for each prediction metric to each candidate
        data["header"].forEach(function(head, headerIndex) {
            if (exclude.indexOf(candidate[0]) < 0) {
                candidates[candidate[0]][head] = [];
            }

            data["history"].forEach(function (date, i) {
                // Only take every 3rd datapoint
                if (((i % 8) == 0) && (parseDate(date.timestamp).getTime() < new Date('2016.07.01').getTime())){
                    // fill timestamp array with dates (just once)
                    if ((candidateIndex == 0) && (headerIndex == 0)) {
                        timestamps.push(parseDate(date.timestamp));
                    }

                    // Fill each array with the right data
                    if (date.table[candidateIndex] != undefined) {
                        if ((date.table[candidateIndex][headerIndex]) == null) {
                            //console.log(date.table[candidateIndex][headerIndex]);
                            if (exclude.indexOf(candidate[0]) < 0) {
                                candidates[candidate[0]][head].push('');
                            }
                        }
                        else {
                            if (exclude.indexOf(candidate[0]) < 0) {
                                candidates[candidate[0]][head]
                                    .push((date.table[candidateIndex][headerIndex]).replace(/[^\d.]/g, ''));
                            }
                        }
                    }
                    else {
                        if (exclude.indexOf(candidate[0]) < 0) {
                            candidates[candidate[0]][head].push('');
                        }
                    }
                }

            });
        });
    });

    return {
        "candidates" : candidates,
        "timestamps" : timestamps
    };
}

function fixStates(map, fips) {
    map.forEach(function(state) {
        state["state"] = fips[state.id];
    });

    return(map);
}

function wrangleStates(data) {
    var states = {};

    // Timestamp array for reference
    var timestamps = {};

    var flag1 = 0;

    for (var state in data) {
        // skip loop if the property is from prototype
        if (!data.hasOwnProperty(state)) continue;

        // Instantiate new array for each state (contains data for each timestamp)
        states[state] = [];

        var contents = data[state].candidates;

        for(var i = 0; i <= 90; i++) {
            var currentDate = [];
            var flag2 = 0;

            for (var candidate in contents) {
                // skip loop if the property is from prototype
                if (!contents.hasOwnProperty(candidate)) continue;

                var datapoint = contents[candidate][i];

                if ((flag1 == 0) && (flag2 == 0)) {
                    timestamps[(datapoint["DateString"])] = i;
                }

                currentDate.push({name:datapoint["ContractName"], price:datapoint["CloseSharePrice"]});
                flag2++;
            }

            currentDate = currentDate.sort(function(fst, snd) {
                return snd.price - fst.price;
            });

            states[state].push(currentDate);

        }
        flag1++;
    }

    return {
        "states" : states,
        "timestamps" : timestamps
    };
}

function wrangleResults(data) {
    var results = {};

    data["states"].forEach(function(result) {
        results[result["state"]] = result;
        results[result["state"]]["candidates"].forEach(function(cand){
            data["candidates"].forEach(function(names) {
                if (names["id"] == cand["id"]){
                    cand["name"] =  names["lname"];
                }
            });
        });
    });

    //console.log(results);

    return results;
}