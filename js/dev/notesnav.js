 function NotesNav() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , data
      , viewbox
      , width
      , height
      , x = d3.scaleLinear()
      , y = d3.scaleLinear()
      , brush = d3.brushX()
          .on("brush", brushed)
          .on("end"  , brushed)
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
            .style("width", "100%")
            .style("height", "100%")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, viewbox[2], viewbox[3]].join(' '))
            .attr("preserveAspectRatio", "none")
        ;
        svg
          .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, viewbox[2], viewbox[3]].join(' '))
            .attr("preserveAspectRatio", "xMinYMid slice")
          .append("use")
            .attr("xlink:href", "#backplane")
            .attr("width", width)
            .attr("height", height)
        ;

        brush
          .extent([[0, 0], [width, height]])
          .handleSize(width / 200);

        var g = svg.selectAll("g").data(["brush"]);
        g = g
          .enter().append("g")
            .attr("class", function(d) { return d; })
          .merge(g)
            .call(brush)
        ;
        g
            .call(brush.move, x.range())
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
    my.data = function (_){
        if(!arguments.length) return data;
        data = _;
        return my;
      } // my.data()
    ;
    my.svg = function(_) {
        if(!arguments.length) return svg;
        svg = _;
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
