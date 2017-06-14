// This module is all about scaling the notes
// such that a single measure has a fixed width in "absolute time".
var measureScaling = (function (){

    // Each measure is stretched out to be this many time units.
    // This is required so that the measure-based scaling doesn't
    // squish notes vertically into circles.
    // The reason for this factor in the scaling is purely aesthetic.
    var stretchFactor = 4;

    // This function parses a value from the relative_measure_duration
    // column of the lookup table into a number.
    function parseRelativeDuration(str){

        // If no value is defined, assume 1.
        if(!str){
            return 1;
        }

        // If it is a fraction, parse it and do the division.
        var slashIndex = str.indexOf("/");
        if(slashIndex !== -1){
            var numerator = +str.substr(0, slashIndex);
            var denominator = +str.substr(slashIndex + 1);
            return numerator / denominator;
        }

        // Otherwise it's a single number, probably 1.
        return +str;
    }

    // Each entry in the returned array corresponds to a single measure,
    // and the value is the number of beats in that measure.
    function annotateMeasures(proll, mensurationsLUT){

        // Keeps track of the last seen mensuration value.
        var mensuration;

        // Create indices from the lookup table.
        var mensurationsToBeats = {};
        var mensurationsToRelativeDuration = {};
        mensurationsLUT.forEach(function (d){
            mensurationsToBeats[d.sign] = d.num_quarter_notes;
            mensurationsToRelativeDuration[d.sign] = parseRelativeDuration(d.relative_measure_duration);
        });

        return proll.barlines.map(function (d, i){

            // Fill in "undefined" mensuration values with last seen value.
            mensuration = (d.mensuration || mensuration);

            // Return an "annotated measure" object, that contains
            // useful information about each measure based on information
            // from the mensurationsLUT.
            var annotatedMeasure = {
                mensuration: mensuration,
                numBeats: mensurationsToBeats[mensuration],
                relativeDuration: mensurationsToRelativeDuration[mensuration]
            };
            //console.log(JSON.stringify(annotatedMeasure));
            return annotatedMeasure;
        });
    }


    return function (proll, mensurationsLUT){
        var annotatedMeasures = annotateMeasures(proll, mensurationsLUT),

            // Maps the beat (quarter note) to absolute time.
            beatsToTime = [],

            // Maps the beat (quarter note) to the "time signature", meaning
            // the number of beats per measure within the current mensuration.
            beatsToTimeSignature = [],

            // Maps the beat (quarter note) to the "relative duration"
            // of the measure that it is in.
            beatsToRelativeDuration = [],

            // This variable is used to increment time as we move through the piece.
            time = 0;

        annotatedMeasures.forEach(function (d){
            var numBeats = d.numBeats;
            var relativeDuration = d.relativeDuration;
            for(var i = 0; i < numBeats; i++){
                beatsToTime.push(time);
                beatsToTimeSignature.push(numBeats);
                beatsToRelativeDuration.push(relativeDuration);
                time += 1 / numBeats / relativeDuration;
            }
        });

        function timeTransform(starttime){
            var startBeat = Math.floor(starttime)
              , beatOffset = starttime - startBeat
              , beatsInThisMeasure = beatsToTimeSignature[startBeat]
              , relativeDuration = beatsToRelativeDuration[startBeat]
              , startTime = beatsToTime[startBeat] + beatOffset / beatsInThisMeasure / relativeDuration
            ;
            return startTime * stretchFactor;
        }

        function durationTransform(starttime, duration){
            var startBeat = Math.floor(starttime)
              , beatOffset = starttime - startBeat
              , beatsInThisMeasure = beatsToTimeSignature[startBeat]
              , relativeDuration = beatsToRelativeDuration[startBeat]
              , duration = duration / beatsInThisMeasure / relativeDuration
            ;
            return duration * stretchFactor;
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
                return durationTransform(d.starttime[0], d.duration[0]);
            }
        };

    } // measureScaling()
}());
