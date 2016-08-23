function NotesView(){
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , width = 900
      , height = 500
      , margin = { top: 10, bottom: 20, left: 10, right: 10 }
      , x = d3.scale.linear()
      , yPitch = d3.scale.linear()
      , tooltip
      , colorScale
      , noteHeight
      , roundedCornerSize
      , dispatch
      , emphasize
      , separate
      // This is a fixed x domain set from outside,
      // it overrides the domain computed from the data.
      // This is set on the focus view based on the brush of the context view.
      , xDomain
    ;
    /*
    ** Main Function Object
    */
    function my(selection){
        svg = selection
            .attr("height", height)
            .attr("width", width)
        ;
        if(tooltip)
            svg.call(tooltip)
        ;
        svg.selectAll("g")
            .data(["notes-g"])
            .enter()
              .append("g")
              .attr("class", function (d){ return d; })
        ;
        svg.each(function(data) {
            if(xDomain){
                x.domain(xDomain);
            } else {
                x.domain([
                      d3.min(data, function(d) { return d.time; })
                    , d3.max(data, function(d) { return d.time + d.duration; })
                  ])
                ;
            }
            x.range([0, width - 1]);

            yPitch
                .domain([
                      d3.min(data, function(d) { return d.pitch - 1; })
                    , d3.max(data, function(d) { return d.pitch; })
                  ])
                .range([height, 0])
            ;
            noteHeight = height / (yPitch.domain()[1] - yPitch.domain()[0])
            roundedCornerSize = noteHeight / 2

            var notesG = svg.select(".notes-g")
              , rects = notesG.selectAll("rect").data(data)
            ;
            rects
              .enter().append("rect")
                .attr("class", "note")
                .classed("subdued", function(d) {
                    return emphasize && d.voice !== emphasize;
                  })
            ;
            rects.exit().remove();
            rects
                .classed("subdued", function(d) {
                    return emphasize && d.voice !== emphasize;
                  })
              .transition()
                .attr("x", function(d) { return x(d.time); })
                .attr("y", function(d) { return yPitch(d.pitch); })
                .attr("width", function(d) { return x(d.time + d.duration) - x(d.time); })
                .attr("height", noteHeight)
                .attr("fill", function(d) { return colorScale(d.voice); })
                .attr("stroke", function(d) { return colorScale(d.voice); })
                .attr("rx", roundedCornerSize)
                .attr("ry", roundedCornerSize)
            ;
            if(tooltip){
                rects
                    .on("mouseover", tip.show)
                    .on("mouseout", tip.hide)
                ;
            }
        }); // svg.each()
    } // my()

    /*
    ** Helper Functions
    */
    function hilite(arg) {
        emphasize = arg.emphasize;

        svg.selectAll("rect.note")
            .classed("subdued", function(d) {
                return emphasize && d.voice !== emphasize;
              })
        ;
    } // hilite()

    /*
    ** API (Getter/Setter) Functions
    */
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

    my.xDomain = function(value) {
        if(!arguments.length) return xDomain;

        xDomain = value;
        return my;
      } // my.xDomain()
    ;
    my.x = function() {
        return x; // GETTER ONLY
      } // my.x()
    ;
    my.tooltip = function(value) {
        if(!arguments.length === 0) return tooltip;
        tooltip = value
            .html(function(d) { return d.pitchName; })
        ;
        return my;
      } // my.tooltip()
    ;
    my.connect = function(value){
        if(!arguments.length) return dispatch;

        dispatch = value
            .on("hilite.notesview" + name, hilite) // listen for appropriate events
        ;

        return my;
      } // my.connect()
    ;
    my.separate = function (value){
        if(arguments.length === 0) return separate;
        separate = value;
        return my;
      } // my.tipEnabled()
    ;
    return my;
} // NotesView()
