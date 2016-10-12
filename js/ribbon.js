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

        // For steps in which there are no notes in the interval,
        // An empty interval at the previous average is used.
        var previousMean = data.value[0].pitch;

        var ribbonData = d3.range(domain.x[0], domain.x[1], step)
          .map(function (x){
            var notesInWindow = data.value.filter(function(d){
              return (
                d.time > (x - interval)
                &&
                (d.time + d.duration) < (x + interval)
              );
            });

            // If the set of notes in our current window is empty,
            // then use the previous mean and a deviation of 0.
            if(notesInWindow.length === 0){
              return {
                  x: x
                , y0: previousMean
                , y1: previousMean
              };
            }

            var mean = d3.mean(notesInWindow, function (d){ return d.pitch; });

            // Stash the previous average for next time around,
            // for use when the set of notes in the window is empty.
            previousMean = mean;
            
            // If there's only a single note in our window,
            // then use its pitch as the mean, and a deviation of 0.
            if(notesInWindow.length === 1){
              return {
                  x: x
                , y0: mean
                , y1: mean
              };
            }

            var deviation = d3.deviation(notesInWindow, function (d){ return d.pitch; });

            return {
                x: x
              , y1: mean + deviation
              , y0: mean - deviation
            };
          })

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
