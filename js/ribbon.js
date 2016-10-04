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
          .y0(function (d){ return scale.y(d.y0); })
          .y1(function (d){ return scale.y(d.y1); })
    ;

    function my(){
      if(data && domain && scale){


        // For steps in which there are no notes in the interval,
        // An empty interval at the previous average is used.
        var previousAverage = data.value[0].pitch;

        var ribbonData = d3.range(domain.x[0], domain.x[1], step)
          .map(function (x){
            var notesInWindow = data.value.filter(function(d){
              return (
                d.time > (x - interval)
                &&
                (d.time + d.duration) < (x + interval)
              );
            });

            if(notesInWindow.length === 0){
              return {
                  x: x
                , y0: previousAverage
                , y1: previousAverage
              };
            }

            // This is a simple temporary proxy for the avg +- standard deviation.
            var extent = d3.extent(notesInWindow, function (d){ return d.pitch; })

            if(!extent[0]){
              console.log(x);
              console.log(notesInWindow);
            }

            previousAverage = (extent[0] + extent[1]) / 2;

            return {
                x: x
              , y1: extent[0]
              , y0: extent[1] 
            };
          })

        //ribbonData.forEach(function (d, i){
        //  if( !(d.x && d.y1 && d.y0)){
        //    console.log(JSON.stringify(d), i);
        //  }
        //});

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
