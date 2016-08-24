function BrushView() {
    /*
    ** Private Variables
    **   - These are exclusively used in this object only.
    */
    var svg
      , x
      , brush = d3.svg.brush()
            .on("brush", brushed)
            .on("brushend", brushed(true))
      , dispatch
      , height
    ;

    /*
    ** Main function Object
    */
    function my(sel) {
        svg = sel.selectAll(".brush")
            .data(["brush"])
          .enter().append("g")
            .attr("class", function(d) { return d; })
        ;
        svg
            .call(brush)
        ;
    } // my() - Main Function Object

    /*
    ** Helper Functions
    */
    function brushed(stop) {
        if(dispatch)
            dispatch
                .zoom({
                      extent: brush.empty() ? x.domain() : brush.extent()
                    , ended: stop || false
                  })
            ;
    } // brushed()

    /*
    ** API - Getters/Setters
    */
    my.height = function(value) {
        if(!arguments.length) return height;

        height = value;
        svg.selectAll("rect")
          .attr("y", 0)
          .attr("height", height - 1)
        ;
        return my;
      } // my.height()
    ;
    my.x = function(value) {
        if(!arguments.length) return x;

        x = value;
        brush.x(x);

        return my;
      } // my.x()
    ;
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
      } // my.connect()
    ;
    // This is ALWAYS the last thing returned
    return my;
} // brushableView()
