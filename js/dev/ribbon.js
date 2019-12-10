function Ribbon() {
    /* Private Variables */
    var datum
      , x, y
      , interval = .25 // Interval size for the sliding window, in units of beats
      , step = .25 // How much to slide the window for each iteration.
      , minMelodicHeight = .5
      , verticalStretch = 1 // Scaling factor * std.dev. before +ing/-ing from mean.
      , area = function(data) {
            return d3.area()
                .x(function (d){ return x(d.x); })
                .y0(function (d){ return y(d.y0); })
                .y1(function (d){ return y(d.y1); })
                .curve(d3.curveBasis)
              (data)
            ;
          }
      , modes = {}
    ;

    /*
    ** Main Function Object
    */
    function my(sel){
        datum = sel.datum();
        var svg = sel.select(".ribbons");
        if(!svg.size()) svg = sel.append("g").attr("class", "ribbons");

        var ribbon = svg.selectAll("g")
              .data(d3.keys(modes), function(m) { return m; })
        ;
        ribbon.exit().remove();
        ribbon
          .enter().append("g")
            .attr("class", function(d) { return "ribbon " + d.toLowerCase(); })
          .merge(ribbon)
          .each(function(m) {
              var path = d3.select(this).selectAll("path")
                  .data([modes[m](datum.notedata, datum.voice)]) // call the mode function
              ;
              path.exit().remove();
              path.enter()
                .append("path")
                .merge(path)
                  .attr("d", area)
              ;
            })
        ;
        boxify();
    } // Main Function Object

    /*
    ** Main Calculation Functions
    */
    modes.STANDARD_DEVIATION = function(data) {
        // For steps in which there are no notes in the interval,
        // An empty interval at the previous average is used.
        var previousMean = data[0].pitch.b7;

        return d3.range(x.domain()[0], x.domain()[1] + step, step)
          .map(function (x){

            // This is a "windowed" computation, so we need to look
            // at the notes in the window of width `interval`, centered on `x`.
            var notesInWindow = data
              .filter(function(d){

                // Consider the interval to be centered on the x value.
                var windowStart = x - interval / 2
                  , windowEnd   = x + interval / 2
                  , noteStart = getTime.start(d)
                  , noteEnd   = getTime.start(d) + getTime.duration(d);
                ;

                // Consider a note to be "inside the window"
                // if any part of it falls inside the window.
                return (noteStart < windowEnd) && (noteEnd > windowStart);
              })
              .map(function (d){ return d.pitch.b7; })
            ;

            // At each iteration of this function,
            // we'll compute the mean and standard deviation.
            var mean, deviation, highestNote, lowestNote;

            // The mean and standard deviation values will be computed
            // differently depending on how many notes are in our window.
            switch(notesInWindow.length){

              // If the set of notes in our current window is empty,
              // then use the previous mean and a deviation of 0.
              case 0:
                mean = previousMean;
                highestNote = mean;
                lowestNote = mean;
                deviation = 0;
                break;

              // If there's only a single note in our window,
              // then use its pitch as the mean, and a deviation of 0.
              case 1:
                mean = notesInWindow[0];
                highestNote = mean;
                lowestNote = mean;
                deviation = minMelodicHeight;
                break;

              // If there's more than 1 note in our window,
              // then compute the mean and standard deviation in earnest.
              default:
                highestNote = d3.max(notesInWindow) + 1;
                lowestNote = d3.min(notesInWindow) - 1;
                deviation = Math.max(minMelodicHeight, d3.deviation(notesInWindow) * verticalStretch);
                mean = d3.mean(notesInWindow);
            }

            // Stash the previous average for next time around,
            // whatever it may be, for use in the case that
            // the set of notes in the window is empty.
            previousMean = mean;

            // Return an objects that represents this slice of the ribbon.
            return {
                x: x
              , y1: Math.min(d3.max(y.domain()) - 1, Math.max(mean + deviation, highestNote))
              , y0: Math.max(d3.min(y.domain()) + 1, Math.min(mean - deviation, lowestNote))
            };
           });
    } // modes.STANDARD_DEVIATION()

    var densityGenerator = function(data, voiceName, centered) {

      // Use the following fixed values for the attack density computation,
      // as these specific values were prescribed by Josquin project leads.
      var interval = 2 // Compute the density for a window of 2 seconds.
        , step = 1 // Compute values for each second.
        , scaleFactor = (voiceName == "Aggregate") ? 0.4 : 1 // Make the shape a bit thinner.
      ;

      // Compute the mean pitch across all notes for this voice.
      var overallMean = 28;
      if (!centered) {
        var overallMean = d3.mean(data.map(function (d) {
          return d.pitch.b7;
        }));
      }

      return d3.range(x.domain()[0], x.domain()[1] + step, step)
        .map(function (x){

          // This is a "windowed" computation, so we need to look
          // at the notes in the window of width `interval`, centered on `x`.
          var notesInWindow = data
            .filter(function(d){

              // Consider the interval to start on the x value,
              // so it aligns with measures.
              // Shift window .5 intervals to the left for better fit
              var windowStart = Math.max(0, x - (interval / 2))
                , windowEnd = x + (interval / 2)
                , noteStart = getTime.start(d)
              ;

              // Consider a note to be "inside the window"
              // only if its attack time falls inside the window.
              return (noteStart < windowEnd) && (noteStart >= windowStart);
            })
            .map(function (d){ return d.pitch.b7; })
          ;

          var mean = overallMean
            , density;

          // The mean and standard density values will be computed
          // differently depending on how many notes are in our window.
          switch(notesInWindow.length){

            // If the set of notes in our current window is empty,
            // then use the previous mean and a density of 0.
            case 0:
              //mean = previousMean;
              density = 0;
              break;

            // If there's only a single note in our window,
            // then use its pitch as the mean, and a density of 1.
            case 1:
              //mean = notesInWindow[0];
              density = 1;
              break;

            // If there's more than 1 note in our window,
            // then compute the mean and use the note count as density.
            default:
              density = notesInWindow.length;
              //mean = d3.mean(notesInWindow);
          }

          density *= scaleFactor;

          // Return an objects that represents this slice of the ribbon.
          return {
              x: x
            , y1: mean + density
            , y0: mean - density
          };
        });
    } // densityGenerator()

    modes.ATTACK_DENSITY = function(data, voiceName) { return densityGenerator(data, voiceName, false); };
    modes.ATTACK_DENSITY_CENTERED = function(data, voiceName) { return densityGenerator(data, voiceName, true); };

    /*
    ** Internal Helper Functions
    */
    // Calculate bounding box
    function boxify() {
    } // boxify()

    /*
    **  API - Getters/Setters
    */
    my.interval = function(value) {
        if(!arguments.length)
            return interval;
        interval = value;
        return my;
      } // my.interval()
    ;
    my.step = function(value) {
        if(!arguments.length)
            return step;
        step = value;
        return my;
      } // my.step()
    ;
    my.verticalStretch = function(value) {
        if(!arguments.length)
            return verticalStretch;
        verticalStrecth = value;
        return my;
      } // my.verticalStretch()
    ;
    my.modes = function() {
        return d3.keys(modes)
            .map(function(m) { return m.split('_').join(' '); })
        ;
      } // my.modes()
    ;
    my.x = function(_) {
        if(!arguments.length)
            return x;
        x = _;
        return my;
      } // my.x()
    ;
    my.y = function(_) {
        if(!arguments.length)
            return y;
        // The passed in scale is Ordinal, and we need Linear here
        y = d3.scaleLinear()
          .domain([
            d3.min(_.domain()) - 1,
            d3.max(_.domain()) + 1,
          ])
          .range([
            _.range()[0] + _.paddingOuter() + _.bandwidth() / 2,
            _.range()[1] - _.paddingOuter() - _.bandwidth() / 2
          ]);
        return my;
      } // my.y()
    ;
    my.bbox = function() {
        return [];
      } // my.bbox()
    ;

    // This is ALWAYS the last thing returned
    return my;
} // Ribbon()
