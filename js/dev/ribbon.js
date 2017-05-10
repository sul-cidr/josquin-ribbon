function Ribbon() {
    /* Private Variables */
    var datum
      , x, y
      , interval = 12 // Interval size for the sliding window, in units of beats
      , step = 1 // How much to slide the window for each iteration.
      , bandwidth = 1 // Scaling factor * std.dev. before +ing/-ing from mean.
      , timeTransform
      , area = function(data) {
            return d3.area()
                .x(function (d){ return x(timeTransform(d.x)); })
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
                  .data([modes[m](datum.notedata)]) // call the mode function
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

        return d3.range(x.domain()[0], x.domain()[1], step)
          .map(function (x){

            // This is a "windowed" computation, so we need to look
            // at the notes in the window of width `interval`, centered on `x`.
            var notesInWindow = data
              .filter(function(d){

                // Consider the interval to be centered on the x value.
                var windowStart = x - interval / 2
                  , windowEnd   = x + interval / 2
                  , noteStart = d.starttime[0]
                  , noteEnd   = d.starttime[0] + d.duration[0]
                ;

                // Consider a note to be "inside the window"
                // if any part of it falls inside the window.
                return (noteStart < windowEnd) && (noteEnd > windowStart);
              })
              .map(function (d){ return d.pitch.b7; })
            ;

            // At each iteration of this function,
            // we'll compute the mean and standard deviation.
            var mean, deviation;

            // The mean and standard deviation values will be computed
            // differently depending on how many notes are in our window.
            switch(notesInWindow.length){

              // If the set of notes in our current window is empty,
              // then use the previous mean and a deviation of 0.
              case 0:
                mean = previousMean;
                deviation = 0;
                break;

              // If there's only a single note in our window,
              // then use its pitch as the mean, and a deviation of 0.
              case 1:
                mean = notesInWindow[0];
                deviation = 0;
                break;

              // If there's more than 1 note in our window,
              // then compute the mean and standard deviation in earnest.
              default:
                deviation = d3.deviation(notesInWindow);
                mean = d3.mean(notesInWindow);
            }

            // Stash the previous average for next time around,
            // whatever it may be, for use in the case that
            // the set of notes in the window is empty.
            previousMean = mean;

            // Return an objects that represents this slice of the ribbon.
            return {
                x: x
              , y1: mean + deviation
              , y0: mean - deviation
            };
           });
    } // modes.STANDARD_DEVIATION()

    modes.ATTACK_DENSITY = function(data) {

      // Use the following fixed values for the attack density computation,
      // as these specific values were prescribed by Josquin project leads.
      var interval = 4 // Compute the density for each measure.
        , step = 4
        , scaleFactor = 1
      ;

      // For steps in which there are no notes in the interval,
      // An empty interval at the previous average is used.
      var previousMean = data[0].pitch.b7;
      return d3.range(x.domain()[0], x.domain()[1], step)
        .map(function (x){

          // This is a "windowed" computation, so we need to look
          // at the notes in the window of width `interval`, centered on `x`.
          var notesInWindow = data
            .filter(function(d){

              // Consider the interval to start on the x value,
              // so it aligns with measures.
              var windowStart = x
                , windowEnd   = x + interval
                , noteStart = d.starttime[0]
              ;

              // Consider a note to be "inside the window"
              // only if its attack time falls inside the window.
              return (noteStart < windowEnd) && (noteStart >= windowStart);
            })
            .map(function (d){ return d.pitch.b7; })
          ;

          // At each iteration of this function,
          // we'll compute the mean and standard deviation.
          var mean, density;

          // The mean and standard density values will be computed
          // differently depending on how many notes are in our window.
          switch(notesInWindow.length){

            // If the set of notes in our current window is empty,
            // then use the previous mean and a density of 0.
            case 0:
              mean = previousMean;
              density = 0;
              break;

            // If there's only a single note in our window,
            // then use its pitch as the mean, and a density of 1.
            case 1:
              mean = notesInWindow[0];
              density = 1;
              break;

            // If there's more than 1 note in our window,
            // then compute the mean and use the note count as density.
            default:
              density = notesInWindow.length;
              mean = d3.mean(notesInWindow);
          }

          density *= scaleFactor;


          // Stash the previous average for next time around,
          // whatever it may be, for use in the case that
          // the set of notes in the window is empty.
          previousMean = mean;

          // Return an objects that represents this slice of the ribbon.
          return {
              x: x
            , y1: mean + density
            , y0: mean - density
          };
        });
    } // modes.ATTACK_DENSITY()

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
    my.bandwidth = function(value) {
        if(!arguments.length)
            return bandwidth;
        bandwidth = value;
        return my;
      } // my.bandwidth()
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

    // Setter only.
    my.timeTransform = function(_){
        timeTransform = _;
        return my;
    };

    // This is ALWAYS the last thing returned
    return my;
} // Ribbon()
