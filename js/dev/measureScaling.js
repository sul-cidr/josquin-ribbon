var measureScaling = (function (){

    // Each entry in the returned array corresponts to a single measure,
    // and the value is the number of beats in that measure (typically 3 or 4).
    function computeMeasuresToBeats(proll){

        // Keeps track of the last seen mensuration value.
        var mensuration;
        return proll.barlines.map(function (d, i){

            // Fill in "undefined" mensuration values with last seen value.
            mensuration = (d.mensuration || mensuration);

            return beatsPerMeasure(mensuration);
        });
    }

    // Converts from mensuration symbols to their numeric time signature equivalents.
    function beatsPerMeasure(mensuration){
        if(mensuration === "C|"){
            return 4;
        } else {
            return +mensuration;
        }
    }

    return function (proll){
        var measuresToBeats = computeMeasuresToBeats(proll),
            beatsToTime = [],
            beatsToTimeSignature = [],
            time = 0;

        measuresToBeats.forEach(function (numBeats, i){
            //console.log(i + " (measure)");

            // Old school for loop to save on Array and closure allocations.
            for(var i = 0; i < numBeats; i++){
                beatsToTime.push(time);
                beatsToTimeSignature.push(numBeats);
                //console.log("  " + time + " (beat)");
                time += 1 / numBeats;
            }
        });

        // Replace the starttime values (in beats) with our computed absolute time values.
        proll.partdata.forEach(function (part){
            part.notedata.forEach(function (d){
                d.starttime[0] = beatsToTime[d.starttime[0]];
                //d.duration[0] = d.duration[0] / beatsToTimeSignature;
            })
        });

        return proll;
    } // measureScaling()
}());
