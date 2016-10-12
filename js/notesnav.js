function NotesNav() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , data
      , width
      , height
      , margin = { top: 20, right: 20, bottom: 20, left: 20 }
      , canvas = {
              selection: null
            , widget: NotesCanvas()
          }
      , brush =  {
              selection: null
            , widget: d3.brushX()
                    .handleSize(10)
                    .on("brush", brushed)
                    .on("end", brushed)
            , width: 0
          }
      , dispatch
    ;

    /*
    ** Main function Object
    */
    function my() {
        svg
          .attr("width", width)
          .attr("height", height)
        ;

        var g = svg.selectAll("g").data([1]);
        g = g.enter().append("g").merge(g);
        g.attr("transform", "translate("+ margin.left +","+ margin.top +")")

        g.selectAll("g")
            .data(["canvas", "brush"])
          .enter().append("g")
            .attr("class", function(d) { return d; })
        ;
        width  = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        canvas.widget
            .width(width)
            .height(height)
        ;
        brush.widget.extent([[0, 0], [width, height]]);

        canvas.selection = g.select(".canvas")
            .datum({ key: "full", value: d3.merge(data.notes.values()) })
            .call(canvas.widget)
        ;
        brush.selection = g.select(".brush")
            .call(brush.widget)
            .call(brush.widget.move, canvas.widget.x().range())
        ;
        brush.selection.selectAll("rect")
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
          var extent = brush.widget.extent()()
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
    my.height = function(value) {
        if(!arguments.length) return height;

        height = value;

        return my;
      } // my.height()
    ;
    my.width = function (value) {
        if(arguments.length === 0) return width;

        width = value;

        return my;
      } // my.width()
    ;
    my.margin = function (value) {
        if(!arguments.length) return margin;

        margin = value;

        return my;
      } // my.margin()
    ;
    my.colorScale = function (value) {
        if(arguments.length === 0) return canvas.widget.colorScale();

        canvas.widget.colorScale(value);

        return my;
      } // my.colorScale()
    ;
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.full = function(value) {
        if(!arguments.length) return scale;

        scale = value;
        canvas.widget.zoom(scale).snap();

        return my;
      } // my.full()
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
    my.svg = function (value){
        if(arguments.length === 0) return svg;
        svg = value;
        return my;
      } // my.svg()
    ;
    my.data = function (value){
        if(arguments.length === 0) return data;
        data = value;
        return my;
      } // my.data()
    ;

    // This is ALWAYS the last thing returned
    return my;
} // NotesNav()
