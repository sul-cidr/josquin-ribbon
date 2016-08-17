function NotesView(){
    var svg
      , width = 900
      , height = 500
      , margin = { top: 10, bottom: 20, left: 10, right: 10 }
      , x = d3.scaleLinear()
      , y = d3.scaleLinear()
      , tipEnabled = false
      , colorScale
      , noteHeight
      , roundedCornerSize
      , rects
      , dispatch
      , emphasize
      // This is a fixed x domain set from outside,
      // it overrides the domain computed from the data.
      // This is set on the focus view based on the brush of the context view.
      , xDomain
      , x2 // x-axis reference for zoom
      , tip = d3.tip()
          .attr("class", "d3-tip")
          .html(function(d) { return d.pitchName; })
    ;

    function my(selection){
        svg = selection
            .attr("height", height)
            .attr("width", width)
        ;
        svg.each(function(data) {
            svg
              .append("g")
                .attr("class", "notes-g")
            ;
            update(data);
            if(tipEnabled){
                if(tipEnabled)
                    svg.call(tip)
                ;
            }
        });
    } // my()

    /*
    ** Helper Functions
    */
    function update(notes) {
      x.domain([
            d3.min(notes, function(d) { return d.time; })
          , d3.max(notes, function(d) { return d.time + d.duration; })
        ])
      ;
      y.domain([
            d3.min(notes, function(d) { return d.pitch - 1; })
          , d3.max(notes, function(d) { return d.pitch; })
        ])
      ;
      x.range([0, width - 1]);
      y.range([height, 0]);

      noteHeight = height / (y.domain()[1] - y.domain()[0])
      roundedCornerSize = noteHeight / 2

      var rects = svg.select(".notes-g").selectAll("rect")
          .data(notes)
      ;
      rects.exit()
        .remove()
      ;
      rects.enter()
        .append("rect")
          .attr("class", "note")
          .attr("x", function(d) { return x(d.time); })
          .attr("rx", roundedCornerSize)
          .attr("y", function(d) { return y(d.pitch); })
          .attr("ry", roundedCornerSize)
          .attr("width", function(d) { return x(d.time + d.duration) - x(d.time); })
          .attr("height", noteHeight)
          .attr("fill", function(d) { return colorScale(d.voice); })
          .attr("stroke", function(d) { return colorScale(d.voice); })
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .classed("subdued", function(d) {
              return emphasize && d.voice !== emphasize;
            })
      ;
    } // update()

    function hilite(arg) {
        emphasize = arg.emphasize;

        svg.selectAll("rect.note")
            .classed("subdued", function(d) {
                return emphasize && d.voice !== emphasize;
              })
        ;
    } // hilite()

    /*
    ** API (Getter) Functions
    */
    my.x = function() {
        return x;
      } // my.x()
    ;
    my.y = function() {
        return y;
      } // my.y()
    ;
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

    my.brushEnabled = function (value){
        if(arguments.length === 0) return brushEnabled;
        brushEnabled = value;
        return my;
    };

    my.tipEnabled = function (value){
        if(arguments.length === 0) return tipEnabled;
        tipEnabled = value;
        return my;
      } // my.tipEnabled()
    ;
    my.connect = function(value){
        if(!arguments.length) return dispatch;

        var name = svg.attr("id");
        dispatch = value
            .on("hilite.notesview" + name, hilite) // listen for appropriate events
        ;

        return my;
      } // my.connect()
    ;
    my.update = function(dataset) {
        if(!arguments.length) return my;
        update(dataset);
      } // my.update()
    ;
    return my;
} // NotesView()
