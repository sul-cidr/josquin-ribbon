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
    function annotateMeasures(proll, mensurationsLUT){

        // Keeps track of the last seen mensuration value.
        var mensuration;

        // Create an index from the lookup table.
        var mensurationsToBeats = {};
        mensurationsLUT.forEach(function (d){
            mensurationsToBeats[d.sign] = d.num_quarter_notes;
        });

        return proll.barlines.map(function (d, i){

            // Fill in "undefined" mensuration values with last seen value.
            mensuration = (d.mensuration || mensuration);

            // Return an "annotated measure" object, that contains
            // useful information about each measure based on information
            // from the mensurationsLUT.
            return {
                mensuration: mensuration,
                numBeats: mensurationsToBeats[mensuration]
            };
        });
    }


    return function (proll, mensurationsLUT){
        var measuresToBeats = annotateMeasures(proll, mensurationsLUT),

            // Maps the beat (quarter note) to absolute time.
            beatsToTime = [],

            // Maps the beat (quarter note) to the "time signature", meaning
            // the number of beats per measure within the current mensuration.
            beatsToTimeSignature = [],

            // This variable is used to increment time as we move through the piece.
            time = 0;

        measuresToBeats.forEach(function (d){
            var numBeats = d.numBeats;
            
            //console.log(i + " (measure)");

            // Old school for loop to save on Array and closure allocations.
            for(var i = 0; i < numBeats; i++){
                beatsToTime.push(time);
                beatsToTimeSignature.push(numBeats);
                //console.log("  " + time + " (beat)");
                time += 1 / numBeats;
            }
        });

        function timeTransform(starttime){
            var startBeat = Math.floor(starttime)
              , offsetBeatFraction = starttime - startBeat
              , beatsInThisMeasure = beatsToTimeSignature[startBeat]
              , startTime = beatsToTime[startBeat] + beatsInThisMeasure * offsetBeatFraction
            ;
            return startTime * stretchFactor;
        }

        return {

            // Time transformation scale for use with non-notes, e.g. bar lines, mensuration symbols.
            timeTransform: timeTransform

            // Start time accessor for use with notes.
          , startTime: function (d){
                return timeTransform(d.starttime[0]);
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
