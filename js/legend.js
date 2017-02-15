function ColorLegend(){
    /*
    ** Private Variables
    */
    var div
      , data
      , hilite
      , noteHeight
      , roundedCornerSize
      , dispatch
    ;

    /*
    ** Main function object
    */
    function my() {
        var legend = div.selectAll("ul").data([1]);
        legend = legend.enter().append("ul")
            .attr("class", "list-unstyled")
          .merge(legend)
        ;
        var row = legend.selectAll("li")
                .data(data)
        ;
        row.enter()
          .append("li")
            .each(function(c, i) {
                var self = d3.select(this);
                self
                  .append("svg")
                    .attr("x", 0)
                    .attr("y", noteHeight)
                    .attr("width", 22)
                    .attr("height", noteHeight)
                    .attr("class", "voice" + i)
                  .append("use")
                    .attr("x", 1)
                    .attr("xlink:href", "#note-2")
                    .attr("class", "note")
                ;
                self
                  .append("text")
                    .text(c)
                ;
              })
          .on("click", function(c, i) {
              hilite = hilite === c ? false : c;

              legend.selectAll("li")
                  .classed("subdued", function(d) {
                      return hilite && d !== c;
                    })
              ;
              dispatch.call("hilite", this, [hilite, i]);
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
    my.div = function (value){
        if(arguments.length === 0) return div;
        div = value;
        return my;
      } // my.div()
    ;
    my.data = function (value){
        if(arguments.length === 0) return data;
        data = value;
        return my;
      } // my.data()
    ;

    return my;
}
