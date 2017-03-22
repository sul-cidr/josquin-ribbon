// This module is all about scaling the notes
// such that a single measure has a fixed width in "absolute time".
var measureScaling = (function (){

    // Each entry in the returned array corresponts to a single measure,
    // and the value is the number of beats in that measure.
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
            return 8;
        } else if(mensuration === "3"){
            return 12;
        } else {

            // Flag unknown mensuration values, for developers to
            // cover all cases over time.
            console.warn("Unknown mensuration value: " + mensuration);

            return 8;
        }
    }

    return function (proll){
        var measuresToBeats = computeMeasuresToBeats(proll),
            beatsToTime = [],
            beatsToTimeSignature = [],
            time = 0;

        measuresToBeats.forEach(function (numBeats){
            //console.log(i + " (measure)");

            // Old school for loop to save on Array and closure allocations.
            for(var i = 0; i < numBeats; i++){
                beatsToTime.push(time);
                beatsToTimeSignature.push(numBeats);
                //console.log("  " + time + " (beat)");
                time += 1 / numBeats;
            }
        });

        // Compute absolute starttime and duration values.
        proll.partdata.forEach(function (part){
            part.notedata.forEach(function (d){
                var startBeat = Math.floor(d.starttime[0]),
                    offsetBeatFraction = d.starttime[0] - startBeat,
                    beatsInThisMeasure = beatsToTimeSignature[startBeat];

                d.starttimeAbsolute = beatsToTime[startBeat] + beatsInThisMeasure * offsetBeatFraction;
                d.durationAbsolute = d.duration[0] / beatsInThisMeasure;
            })
        });

        return proll;
    } // measureScaling()
}());
