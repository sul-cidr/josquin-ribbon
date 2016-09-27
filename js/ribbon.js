function Ribbon() {
    var g
      , data
      , interval = 6 // The interval size for the sliding window, in units of beats.
      , step = 1 // How much to slide the window for each iteration.
      , bandwidth = 1 // The scaling factor multiplied by the standard deviation before adding/subtracting from the mean.
      , area = d3.area()
    ;

    function my(){
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
    return my;
}
