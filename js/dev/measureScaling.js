// This module is all about scaling the notes
// such that a single measure has a fixed width in "absolute time".
var measureScaling = (function (){

    // Each measure is stretched out to be this many time units.
    // This is required so that the measure-based scaling doesn't
    // squish notes vertically into circles.
    // The reason for this factor in the scaling is purely aesthetic.
    var stretchFactor = 8;

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

        function timeScale(starttime){
            var startBeat = Math.floor(starttime)
              , offsetBeatFraction = starttime - startBeat
              , beatsInThisMeasure = beatsToTimeSignature[startBeat]
              , startTime = beatsToTime[startBeat] + beatsInThisMeasure * offsetBeatFraction
            ;
            return startTime * stretchFactor;
        }

        return {

            // Time transformation scale for use with non-notes, e.g. bar lines, mensuration symbols.
            timeScale: timeScale

            // Start time accessor for use with notes.
          , startTime: function (d){
                return timeScale(d.starttime[0]);
            }

            // Duration accessor for use with notes.
          , duration: function (d){
                var startBeat = Math.floor(d.starttime[0])
                  , offsetBeatFraction = d.starttime[0] - startBeat
                  , beatsInThisMeasure = beatsToTimeSignature[startBeat]
                  , duration = d.duration[0] / beatsInThisMeasure
                ;
                return duration * stretchFactor;
            }
        };

    } // measureScaling()
}());
