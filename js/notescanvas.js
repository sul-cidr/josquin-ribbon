function NotesCanvas(){
    /*
    ** Private Variables - only used inside this object
    */
    var svg, data, name
      , width = 900
      , height = 500
      , margin = { top: 10, bottom: 20, left: 10, right: 10 }
      , x = d3.scale.linear()
      , xorig = d3.scale.linear()
      , y = d3.scale.linear()
      , tooltip
      , colorScale
      , noteHeight
      , roundedCornerSize
      , dispatch
      , emphasize
      , separate
    ;
    /*
    ** Main Function Object
    */
    function my(selection){
        data = selection.datum();
        name = data.key;
        svg = selection.selectAll("." + name + ".notes-g")
              .data([name])
            .enter()
              .append("g")
              .attr("class", "notes-g " + name)
        ;
        xorig
            .domain([
                  d3.min(data.values, function(d) { return d.time; })
                , d3.max(data.values, function(d) { return d.time + d.duration; })
              ])
            .range([0, width - 1]);
        ;
        x
            .domain(xorig.domain())
            .range(xorig.range())
        ;
        y
            .domain([
                  d3.min(data.values, function(d) { return d.pitch - 1; })
                , d3.max(data.values, function(d) { return d.pitch; })
              ])
            .range([height, 0])
        ;
        noteHeight = height / (y.domain()[1] - y.domain()[0]);
        roundedCornerSize = noteHeight / 2;

        var rects = svg.selectAll("rect").data(data.values)
        ;
        rects
          .enter().append("rect")
            .attr("class", "note")
        ;
        rects.exit().remove();
        rects
            .classed("subdued", function(d) {
                return emphasize && d.voice !== emphasize;
              })
            .attr("x", function(d) { return x(d.time); })
            .attr("y", function(d) { return y(d.pitch); })
            .attr("width", function(d) { return x(d.time + d.duration) - x(d.time); })
            .attr("height", noteHeight)
            .attr("fill", function(d) { return colorScale(d.voice); })
            .attr("stroke", function(d) { return colorScale(d.voice); })
            .attr("rx", roundedCornerSize)
            .attr("ry", roundedCornerSize)
        ;
        if(tooltip){
            svg.call(tooltip);
            rects
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
            ;
        }
    } // my()

    /*
    ** Helper Functions
    */
    function hilite(arg) {
        emphasize = arg && arg.emphasize;

        svg.selectAll("rect.note")
            .classed("subdued", function(d) {
                return emphasize && d.voice !== emphasize;
              })
        ;
    } // hilite()

    function update() {
        svg.selectAll("rect.note")
            .attr("x", function(d) { return x(d.time); })
            .attr("y", function(d) { return y(d.pitch); })
            .attr("width", function(d) { return x(d.time + d.duration) - x(d.time); })
            .attr("height", noteHeight)
            .attr("fill", function(d) { return colorScale(d.voice); })
            .attr("stroke", function(d) { return colorScale(d.voice); })
            .attr("rx", roundedCornerSize)
            .attr("ry", roundedCornerSize)
        ;
    } // update()

    function describe() {
        /*
        // Filter the notes based on the selected time interval.
        var filteredData = data.notes
            .filter(function (d){
                return d.time > extent[0] && d.time < extent[1];
              })
        ;
        // Update the pitch names text.
        var pitchNames = filteredData
            .map(function (d){ return d.pitchName; })
        ;
        d3.select("#note-names-string")
            .text(pitchNames.join(", "))
        ;
        // Update the note durations text.
        pitchNames = filteredData
            .map(function (d){ return d.duration; })
        ;
        d3.select("#note-durations-string")
            .text(pitchNames.join(", "))
        ;
        */
    } // describe()

    /*
    ** API (Getter/Setter) Functions
    */
    my.colorScale = function (value){
        if(arguments.length === 0) return colorScale;
        colorScale = value;
        return my;
      } // my.colorScale()
    ;
    my.width = function (value){
        if(arguments.length === 0) return width;
        width = value;
        return my;
      } // my.width()
    ;
    my.height = function (value){
        if(arguments.length === 0) return height;
        height = value;
        return my;
      } // my.height()
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

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.hilite = function(value) {
        if(!arguments.length)
            hilite(); // un-highlight
        else
            hilite(value);

        return my;
      } // my.hilite()
    ;
    /*
    ** API (Getter ONLY) Functions
    */
    my.noteHeight = function (){ return noteHeight; };
    my.roundedCornerSize = function (){ return roundedCornerSize; };
    my.x = function() { return x; };

    /*
    ** API (Setter ONLY) Functions
    */
    my.separate = function (value){
        if(arguments.length === 0) return separate;
        separate = value;
        return my;
      } // my.separate()
    ;
    my.zoom = function(value, ended) {
        // Set the xdomain of notes in the zoomed in region and update
        //  -- if value is epty, the zoom is reset to the entire domain (xorig)
        x.domain(arguments.length ? value : xorig.domain());
        update();

        if(ended)
            describe();
        return my;
      } // my.zoom()
    ;

    // This is always the last thing returned
    return my;
} // NotesCanvas()
