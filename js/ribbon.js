function Ribbon() {
    var g
      , data // The original notes data
      , ribbonData // The computed data for the ribbon
      , interval = 12 // The interval size for the sliding window, in units of beats.
      , step = 1 // How much to slide the window for each iteration.
      , bandwidth = 1 // The scaling factor multiplied by the standard deviation before adding/subtracting from the mean.
      , scale // Scale data passed down from notescanvas
      , domain // Domain data passed down from notescanvas
      , area = d3.area()
          .x(function (d){ return scale.x(d.x); })
          .y0(function (d){ return scale.yLinear(d.y0); })
          .y1(function (d){ return scale.yLinear(d.y1); })
          .curve(d3.curveBasis)
    ;

    function my(){
      if(data && domain && scale){
        var ribbonData = computeRibbon();

        var path = g.selectAll("path").data([ribbonData])
        path.enter().append("path").merge(path)
            .attr("class", "ribbon")
            .style("color", function(d) {
                return scale.color(data.key);
              })
            .attr("d", area)
        ;
      }
    }

    function computeRibbon(){

      // For steps in which there are no notes in the interval,
      // An empty interval at the previous average is used.
      var previousMean = data.value[0].pitch;

      return d3.range(domain.x[0], domain.x[1], step)
        .map(function (x){

          // At each iteration of this function,
          // we'll compute the mean and standard deviation.
          var mean, deviation;

          // This is a "windowed" computation, so we need to look
          // at the notes in the window of width `interval`, centered on `x`.
          var notesInWindow = data.value
            .filter(function(d){
              var windowStart = x - interval / 2
                , windowEnd   = x + interval / 2
                , noteStart = d.time
                , noteEnd   = d.time + d.duration
              ;
              return (noteStart < windowEnd) && (noteEnd > windowStart);
            })
            .map(function (d){ return d.pitch; })
          ;

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
    }

    my.g = function(value) {
        if(!arguments.length)
            return g;
        g = value;
        return my;
      } // my.g()
    ;
    my.data = function(value) {
        if(!arguments.length)
            return data;
        data = value;
        return my;
      } // my.data()
    ;
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
    my.scale = function(value) {
        if(!arguments.length)
            return scale;
        scale = value;
        return my;
      } // my.scale()
    ;
    my.domain = function(value) {
        if(!arguments.length)
            return domain;
        domain = value;
        return my;
      } // my.domain()
    ;
    return my;
}
