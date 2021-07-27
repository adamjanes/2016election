/**
 * Created by Adam on 4/25/2016.
 */

Legend = function(_parentElement, _data, _selector){
    this.parentElement = _parentElement;
    this.data = _data;
    this.selector = _selector;

    // DEBUG RAW DATA

    //console.log(allData.candidateColors);

    for (var candidate in this.data.candidates) {
        // skip loop if the property is from prototype
        if (!this.data.candidates.hasOwnProperty(candidate)) continue;

        var name = candidate.split(" ")[1];

        var pic = "img/" + name.toUpperCase() + ".jpg";

        $("#"+this.parentElement)[0].innerHTML += "<img style='border-color: " + allData.candidateColors[name] +
            "' class='picture pic-top' src='" + pic + "'></img>";

        //console.log("<img style='border-color: " + allData.candidateColors[name] + "' class='picture' src='" + pic + "'></img>");


    }

};