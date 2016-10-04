function Ribbon() {
    var g
      , data // The original notes data
      , ribbonData // The computed data for the ribbon
      , interval = 12 // The interval size for the sliding window, in units of beats.
      , step = 1 // How much to slide the window for each iteration.
      , bandwidth = 1 // The scaling factor multiplied by the standard deviation before adding/subtracting from the mean.
      , area = d3.area()
          .x(function (d){ return scale.x(d.x); })
          .y0(function (d){ return scale.y(d.y0); })
          .y1(function (d){ return scale.y(d.y1); })
      , scale // Scale data passed down from notescanvas
      , domain // Domain data passed down from notescanvas
    ;

    function my(){
      if(data && domain && scale){
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
                , y0: 26
                , y1: 27
              };
            }
            //return {
            //    x: x
            //  , y0: d3.max(notesInWindow, function (d){ return d.pitch; })
            //  , y1: d3.min(notesInWindow, function (d){ return d.pitch; })
            //};

            // This is a simple temporary proxy for the avg +- standard deviation.
            var maxPitch = d3.max(notesInWindow, function (d){ return d.pitch; })
            var minPitch = d3.min(notesInWindow, function (d){ return d.pitch; })

            return {
                x: x
              , y0: minPitch
              , y1: maxPitch
            };
          })

        var path = g.selectAll("path").data([ribbonData])
        path.enter().append("path").merge(path)
            .attr("class", "ribbon")
            .style("color", function(d) {
                console.log( scale.color(data.key));
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
