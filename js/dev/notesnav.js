function NotesNav() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , viewbox
      , width
      , height
      , x = d3.scaleLinear()
      , y = d3.scaleLinear()
      , brush = d3.brushX().on("brush end", brushed)
      , brushG
      , dispatch
    ;

    /*
    ** Main function Object
    */
    function my() {
        x.range([viewbox[0], viewbox[2]]);
        y.range([viewbox[3], viewbox[1]]);
        width  = Math.abs(viewbox[2]);
        height = Math.abs(viewbox[3]);

        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, viewbox[2], viewbox[3]].join(' '))
        ;
        brush
          .extent([[0, 0], [width, height]])
          .handleSize(width / 200);
        ;
        brushG
            .call(brush)
            .call(brush.move, x.range())
        ;
        brushG.selectAll("rect")
            .attr("y", 0)
            .attr("height", height)
        ;
    } // my() - Main Function Object


    /*
    ** Helper Functions
    */
    function initialize_SVG() {
        // Create the structure of the SVG to fill up the space with
        // an image of the main viz.
        svg
            .style("width", "100%")
            .style("height", "100%")
            .attr("preserveAspectRatio", "none")
          .append("svg")
          .append("use")
            .attr("xlink:href", "#voices")
        ;
        // Attach an element for the d3.brush()
        brushG = svg.append("g").attr("class", "brush");
    } // initSVG()

    /*
    ** Callback Functions
    */
    function brushed() {
        var extent = (!d3.event || !d3.event.selection)
              ? x.range()
              : d3.event.selection.map(Math.round)
        ;
        if(!d3.event.selection) {
            svg.select(".brush")
              .transition().duration(500)
                .call(brush.move, x.range())
            ;
        }
        if(dispatch) dispatch.call("zoom", this, extent);
    } // brushed()

    function move() {
        brush.selection.call(brush.move([0, 0], [width, height]));
    } // move()

    /*
    ** API - Getters/Setters
    */
    my.connect = function(_) {
        if(!arguments.length) return dispatch;

        dispatch = _;
        return my;
      } // my.connect()
    ;
    my.svg = function(_) {
        if(!arguments.length) return svg;
        svg = _;
        initialize_SVG();
        return my;
      } // my.svg()
    ;
    my.viewbox = function(_) {
        if(!arguments.length) return viewbox;

        viewbox = _;
        return my;
      } // my.extent()
    ;
    my.x = function(_) {
        if(!arguments.length) return x;
        x = _;
        return my;
      } // my.x()
    ;
    my.y = function(_) {
        if(!arguments.length) return y;
        y = _;
        return my;
      } // my.y()
    ;
    my.canvas = function(_) {
        if(!arguments.length) return canvas;
        canvas = _;
        return my;
      } // my.canvas()
    ;
    // This is ALWAYS the last thing returned
    return my;
} // NotesNav()
