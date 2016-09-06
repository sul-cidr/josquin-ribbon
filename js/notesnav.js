function NotesNav() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , data
      , width
      , height
      , margin = { top: 20, right: 20, bottom: 20, left: 20 }
      , canvas = NotesCanvas()
      , brush = d3.brushX()
            .on("brush", brushed)
            .on("end", brushend)
      , dispatch
    ;

    /*
    ** Main function Object
    */
    function my(sel) {
        svg = sel
          .append("g")
            .attr("transform", "translate("+ margin.left +","+ margin.top +")")
        ;
        svg.selectAll("g")
            .data(["canvas", "brush"])
          .enter().append("g")
            .attr("class", function(d) { return d; })
        ;
        width  = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        canvas
            .width(width)
            .height(height)
        ;
        brush.extent([[0, 0], [width, height]]);

        data = sel.datum();

        svg.select(".canvas")
            .datum({ key: "full", value: d3.merge(data.notes.values()) })
            .call(canvas)
        ;
        svg.select(".brush")
            .call(brush)
          .selectAll("rect")
            .attr("y", 0)
            .attr("height", height)
        ;
    } // my() - Main Function Object

    /*
    ** Helper Functions
    */
    function brushend() { return brushed(true); }

    function brushed(stop) {
        if(!dispatch)
            return;

        var extent = d3.event && d3.event.selection
            ? d3.event.selection.map(Math.round).map(canvas.x().invert)
            : false
        ;

        dispatch.call(
            "zoom"
          , this
          , {
                x: extent
              , ended: stop === true || false
            }
        );
    } // brushed()

    function extent() {
    } // extent()

    function update() {
        console.log(arguments.length);
    } // update()

    function move() {
        svg.select(".brush")
            .call(brush.move(
                  [0, 0]
                , [height * canvas.ratio(), height]
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
        if(arguments.length === 0) return canvas.colorScale();

        canvas.colorScale(value);

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
        canvas.zoom(scale).snap();

        return my;
      } // my.full()
    ;

    // This is ALWAYS the last thing returned
    return my;
} // NotesNav()
