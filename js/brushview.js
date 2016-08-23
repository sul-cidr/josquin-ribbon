function BrushView() {
    /*
    ** Private Variables
    **   - These are exclusively used in this object only.
    */
    var svg
      , x
      , brush = d3.svg.brush()
      , dispatch = d3.dispatch()
    ;

    /*
    ** Main function Object
    */
    function my(sel) {
        var height = sel.attr("height");

        svg = sel.selectAll(".brush")
            .data(["brush"])
          .enter().append("g")
            .attr("class", function(d) { return d; })
        ;
        svg
            .call(brush.on("brush", brushed))
          .selectAll("rect")
            .attr("y", 0)
            .attr("height", height - 1);
        ;
    } // my() - Main Function Object

    /*
    ** Helper Functions
    */
    function brushed() {
        dispatch
            .zoom({
                extent: brush.empty() ? x.domain() : brush.extent()
              })
        ;
    } // brushed()

    /*
    ** API - Getters/Setters
    */
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
