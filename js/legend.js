function ColorLegend(){
    /*
    ** Private Variables
    */
    var legend
      , hilite
      , colorScale = d3.scale.category10()
      , noteHeight
      , roundedCornerSize
      , dispatch
    ;

    /*
    ** Main function object
    */
    function my(sel) {
        colorScale.domain(sel.datum());
        legend = sel
              .append("ul")
                .attr("class", "list-unstyled")
        ;
        var row = legend.selectAll("li")
                .data(colorScale.domain())
        ;
        row.enter()
          .append("li")
            .each(function(c) {
                var self = d3.select(this);
                self
                  .append("svg")
                    .attr("x", 0)
                    .attr("y", noteHeight)
                    .attr("width", 22)
                    .attr("height", noteHeight)
                  .append("rect")
                    .attr("class", c.toLowerCase())
                    .classed("note", true)
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("fill", colorScale(c))
                    .attr("stroke", colorScale(c))
                    .attr("rx", roundedCornerSize)
                    .attr("ry", roundedCornerSize)
                ;
                self
                  .append("text")
                    .text(c)
                ;
              })
        ;
        row
          .on("click", function(c) {
              d3.event.stopPropagation();
              hilite = hilite === c ? false : c;
              dispatch.hilite({ emphasize: hilite });

              legend.selectAll("li")
                  .classed("subdued", function(d) {
                      return hilite && d !== c;
                    })
              ;
            })
        ;
        row.exit().remove();
    } // my() - Main function object

    /*
    ** API (Getter/Setter) Functions
    */
    my.height = function (value){
        if(arguments.length === 0) return height;
        height = value;
        return my;
    };

    my.noteHeight = function (value){
        if(arguments.length === 0) return noteHeight;
        noteHeight = value;
        return my;
    };

    my.roundedCornerSize = function (value){
        if(arguments.length === 0) return roundedCornerSize;
        roundedCornerSize = value;
        return my;
      }
    ;
    my.connect = function(value){
        if(!arguments.length) return dispatch;
        dispatch = value;
        return my;
      } // my.connect()
    ;

    return my;
}
