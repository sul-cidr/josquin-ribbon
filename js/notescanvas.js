function NotesCanvas(){
    /*
    ** Private Variables - only used inside this object
    */
    var svg, data, name
      , width = 900
      , height = 500
      , margin = { top: 10, bottom: 20, left: 10, right: 10 }
      , scale = {
            data: { x: d3.scaleLinear(), y: d3.scaleLinear() }
          , zoom: { x: d3.scaleLinear(), y: d3.scaleLinear() }
        }
      , perspectives = d3.keys(scale)
      , tooltip
      , colorScale
      , noteHeight
      , roundedCornerSize
      , dispatch
      , emphasize
    ;
    /*
    ** Main Function Object
    */
    function my(selection){
        data = selection.datum();
        name = data.key;
        svg = selection.attr("class", "notes-g " + name);

        perspectives.forEach(function(p) {
            scale[p].x.range([0, width]);
            scale[p].y.range([height,0]);
          })
        ;
        scale.data.x
            .domain([
                  d3.min(data.value, function(d) { return d.time; })
                , d3.max(data.value, function(d) { return d.time + d.duration; })
              ])
            .range([0, width - 1]);
        ;
        scale.data.y
            .domain([
                  d3.min(data.value, function(d) { return d.pitch - 1; })
                , d3.max(data.value, function(d) { return d.pitch; })
              ])
            .range([height, 0])
        ;
        scale.zoom.x
            .domain(scale.data.x.domain())
            .range(scale.data.x.range())
        ;
        scale.zoom.y
            .domain(scale.data.y.domain())
            .range(scale.data.y.range())
        ;
        setHeights();
        var rects = svg.selectAll("rect").data(data.value);
        rects
          .enter().append("rect")
            .attr("class", "note")
        ;
        rects.exit().remove();
        update();

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

    function update(selection) {
        selection = selection || svg;
        setHeights();

        selection.selectAll("rect.note")
            .attr("x", function(d) { return scale.zoom.x(d.time); })
            .attr("y", function(d) { return scale.zoom.y(d.pitch); })
            .attr("width", function(d) {
                return scale.zoom.x(d.time + d.duration) - scale.zoom.x(d.time);
              })
            .attr("height", noteHeight)
            .attr("fill", function(d) { return colorScale(d.voice); })
            .attr("stroke", function(d) { return colorScale(d.voice); })
            .attr("rx", roundedCornerSize)
            .attr("ry", roundedCornerSize)
        ;
    } // update()

    function setHeights() {
        noteHeight = height / (scale.zoom.y.domain()[1] - scale.zoom.y.domain()[0]);
        roundedCornerSize = noteHeight / 2;
    } // setHeights()

    function describe() {
      /*
        // Filter the notes based on the selected time interval.
        var filteredData = data.value
            .filter(function (d){
                return d.time > scale.zoom.x.domain()[0]
                  && d.time < scale.zoom.x.domain()[1];
              })
        ;
        // Update the pitch names text.
        var pitchNames = filteredData
            .map(function (d){ return d.pitchName; })
        ;
        // Update the note durations text.
        var pitchTimes = filteredData
            .map(function (d){ return d.duration; })
        ;
        if(dispatch)
            dispatch.selected({
                  names: pitchNames
                , times: pitchTimes
              })
            ;
        console.log(dispatch);
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
        perspectives.forEach(function(p) { scale[p].x.range([0, width - 1]); })

        return my;
      } // my.width()
    ;
    my.height = function (value){
        if(arguments.length === 0) return height;

        height = value;
        perspectives.forEach(function(p) { scale[p].y.range([height, 0]); });

        setHeights();

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
    my.x = function() { return scale.zoom.x; };

    /*
    ** API (Setter ONLY) Functions
    */
    my.zoom = function(value, stop) {
        // Set the domain of notes in the zoomed in region
        //  -- if value is empty, the zoom is reset to the dataset's domain
        if(!arguments.length) {
            scale.zoom.x.domain(scale.x.data.domain());
            scale.zoom.y.domain(scale.y.data.domain());
        } else {
            if(value[1][1]) {
                scale.zoom.x.domain(value[0]);
                scale.zoom.y.domain(value[1]);
            } else {
                scale.zoom.x.domain(value)
            }
        }
        update();

        if(stop)
            describe();
        return my;
      } // my.zoom()
    ;
    my.update = function() {
        // Call update, with a transition
        update(svg.transition());
      } // my.update()
    ;
    // This is always the last thing returned
    return my;
} // NotesCanvas()
