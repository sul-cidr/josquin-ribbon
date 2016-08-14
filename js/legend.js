function ColorLegend(){
    var legend = d3.select("body #legend")
          .append("ul")
            .attr("class", "list-unstyled")
      , hilite
      , colorScale
      , noteHeight
      , roundedCornerSize
    ;

    function my(options) {
        var svg = d3.select("#notes").selectAll("svg")
          , row = legend.selectAll("li")
                .data(colorScale.domain())
        ;
        legend
            .on("click", function() {
                hilite = false;
                svg.selectAll("rect")
                    .classed("subdued", false)
                ;
              })
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
              svg.selectAll("rect.note")
                  .classed("subdued", function(d) {
                      return hilite && d.voice !== c;
                    })
              ;
              legend.selectAll("li")
                  .classed("subdued", function(d) {
                      return hilite && d !== c;
                    })
              ;
            })
        ;
        row.exit().remove();
    } // my()

    my.colorScale = function (value){
        if(arguments.length === 0){
            return colorScale;
        }
        colorScale = value;
    };

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
    };

    return my;
}
