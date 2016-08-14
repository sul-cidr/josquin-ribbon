function NotesView(){
    var width = 500
      , height = 500
      , x = d3.scale.linear()
      , y = d3.scale.linear()
      , brush = d3.svg.brush()
          .x(x)
          .on("brush", brushed)
      , brushEnabled = false
      , tipEnabled = false
      , onBrush
      , colorScale
      , noteHeight
      , roundedCornerSize

      // This is a fixed x domain set from outside,
      // it overrides the domain computed from the data.
      // This is set on the focus view based on the brush of the context view.
      , xDomain
      , tip = d3.tip()
          .attr("class", "d3-tip")
          .html(function(d) { return d.pitchName; });
    ;

    function brushed(){
        if(onBrush){
            onBrush(brush.empty() ? x.domain() : brush.extent());
        }
    }

    function my(selection){
        selection.each(function (data){

            var svg = d3.select(this)
                .attr("height", height)
                .attr("width", width)
            ;

            svg.selectAll("g")
                .data(["notes-g", "brush"])
                .enter()
                  .append("g")
                  .attr("class", function (d){ return d; });

            var notesG = svg.select(".notes-g")
              , brushG = svg.select(".brush")
            ;

            if(xDomain){
                x.domain(xDomain);
            } else {
                x.domain([
                      d3.min(data, function(d) { return d.time; })
                    , d3.max(data, function(d) { return d.time + d.duration; })
                  ])
                ;
            }
            y.domain([
                  d3.min(data, function(d) { return d.pitch - 1; })
                , d3.max(data, function(d) { return d.pitch; })
              ])
            ;
            x.range([0, width - 1]);
            y.range([height, 0]);

            noteHeight = height / (y.domain()[1] - y.domain()[0])
            roundedCornerSize = noteHeight / 2

            var rects = notesG.selectAll("rect").data(data);
            rects.enter().append("rect");
            rects.exit().remove();
            rects
                .attr("x", function(d) { return x(d.time); })
                .attr("y", function(d) { return y(d.pitch); })
                .attr("width", function(d) { return x(d.time + d.duration) - x(d.time); })
                .attr("height", noteHeight)
                .attr("fill", function(d) { return colorScale(d.voice); })
                .attr("stroke", function(d) { return colorScale(d.voice); })
                .attr("rx", roundedCornerSize)
                .attr("ry", roundedCornerSize)
                .classed("note", true)
            ;

            if(brushEnabled){
                brushG
                    .call(brush)
                  .selectAll("rect")
                    .attr("y", 0)
                    .attr("height", height - 1);
            }

            if(tipEnabled){
                svg.call(tip);
                rects
                    .on("mouseover", tip.show)
                    .on("mouseout", tip.hide)
                ;
            }
        });
    } // my()

    my.colorScale = function (value){
        if(arguments.length === 0) return colorScale;
        colorScale = value;
        return my;
    };

    my.width = function (value){
        if(arguments.length === 0) return width;
        width = value;
        return my;
    };

    my.height = function (value){
        if(arguments.length === 0) return height;
        height = value;
        return my;
    };

    my.noteHeight = function (){ return noteHeight; };
    my.roundedCornerSize = function (){ return roundedCornerSize; };

    my.brushEnabled = function (value){
        if(arguments.length === 0) return brushEnabled;
        brushEnabled = value;
        return my;
    };

    my.onBrush = function (callback){
        onBrush = callback;
    };

    my.xDomain = function (value){
        xDomain = value;
    };

    my.tipEnabled = function (value){
        if(arguments.length === 0) return tipEnabled;
        tipEnabled = value;
        return my;
    };

    return my;
}
