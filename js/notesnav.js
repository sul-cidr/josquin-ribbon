function NotesNav() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , data
      , width
      , height
      , margin = { top: 20, right: 20, bottom: 20, left: 20 }
      , brush = d3.brushX()
          .handleSize(10)
          .on("brush", brushed)
          .on("end", brushed)
      , dispatch
    ;

    /*
    ** Main function Object
    */
    function my() {
        var g = svg.selectAll("g").data(["brush"]);
        g = g
          .enter().append("g")
            .attr("class", function(d) { return d; })
            .call(brush)
          .merge(g)
        ;
        width  = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        brush.extent([[0, 0], [width, height]]);

        g
            .call(brush.move, canvas.widget.x().range())
        ;
        g.selectAll("rect")
            .attr("y", 0)
            .attr("height", height)
        ;
    } // my() - Main Function Object

    /*
    ** Helper Functions
    */
    function brushed() {
        if(!d3.event) return;
        var extent = (d3.event.selection || recenter(d3.event.sourceEvent.layerX))
              .map(Math.round)
        ;
        if(!d3.event.selection) {
            brush.selection
              .transition().duration(500)
                .call(brush.widget.move, extent)
            ;
        }
        if(dispatch)
            dispatch.call("zoom", this, extent.map(canvas.widget.x().invert));
    } // brushed()

    function recenter(clickX) {
          var extent = brush.extent()()
                .map(function(b) { return b[0]; })
            , center = [clickX - brush.width / 2, clickX + brush.width / 2]
          ;
          if(center[0] < extent[0])
              center = [extent[0], brush.width];
          if(center[1] > extent[1])
              center  = [extent[1] - brush.width, extent[1]];

          return center;
    } // recenter()

    function update() {
        console.log(arguments.length);
    } // update()

    function move() {
        brush.selection
            .call(brush.widget.move(
                  [0, 0]
                , [height * canvas.widget.ratio(), height]
              ))
        ;
    } // resize()

    /*
    ** API - Getters/Setters
    */
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.extent = function(value) {
        if(!value) return;
        var extent = value.map(canvas.widget.x());

        brush.width = Math.abs(extent[1] - extent[0]);
        brush.selection
          .transition(d3.transition())
            .call(brush.widget.move, extent)
        ;
        return my;
      } // my.extent()
    ;
    my.svg = function (_){
        if(!arguments.length) return svg;
        svg = _;
        return my;
      } // my.svg()
    ;
    my.data = function (_){
        if(!arguments.length) return data;
        data = _;
        return my;
      } // my.data()
    ;

    // This is ALWAYS the last thing returned
    return my;
} // NotesNav()
