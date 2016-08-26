function BrushView() {
    /*
    ** Private Variables
    **   - These are exclusively used in this object only.
    */
    var svg
      , x
      , brush = d3.brushX()
            .on("brush", brushed)
            .on("end", brushend)
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
    function brushend() { brushed(true); } // brushend()

    function brushed(stop) {
      if(!dispatch)
          return;
      var extent = x.domain();

      if(d3.event && d3.event.selection)
          extent = d3.event.selection
                .map(function(s) { return x.invert(s); })
          ;
      dispatch.call(
          "zoom"
        , this
        , {
              extent: extent
            , ended: stop === true || false
          }
      );
    } // brushed()

    function extent() {
        if(height && x)
            brush.extent([[x.range()[0], 0], [x.range()[1], height]])
    }

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
        extent();

        return my;
      } // my.height()
    ;
    my.x = function(value) {
        if(!arguments.length) return x;

        x = value;
        extent();

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
