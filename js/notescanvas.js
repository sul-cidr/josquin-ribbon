function NotesCanvas() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg, data
      , width = 900
      , height = 500
      , margin = { top: 10, bottom: 20, left: 10, right: 10 }
      , scale = { x: d3.scaleLinear(), y: d3.scaleLinear(), color: null }
      , domain = { x: [], y: [] } // store the dataset's domains
      , tooltip
      , noteHeight
      , roundedCornerSize
      , dispatch
      , state = true // on; false = off
      , showExtremeNotes = false
    ;
    /*
    ** Main Function Object
    */
    function my(selection) {
        data = selection.datum();

        domain.x = [
              d3.min(data.value, function(d) { return d.time; })
            , d3.max(data.value, function(d) { return d.time + d.duration; })
          ]
        ;
        domain.y = [
              d3.min(data.value, function(d) { return d.pitch; })
            , d3.max(data.value, function(d) { return d.pitch; })
          ]
        ;
        scale.x.domain(domain.x).range([0, width - 1]);
        scale.y.domain(domain.y).range([height, 0]);

        setHeights();

        svg = selection.attr("class", "notes-g " + data.key);
        var rects = svg.selectAll("rect").data(data.value);
        rects
          .enter().append("rect")
            .attr("class", "note")
        ;
        rects.exit().remove();
        computeExtremeNotes();
        update();

        if(tooltip) {
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
    function hilite() {
        svg.selectAll("rect.note")
            .classed("subdued", !state)
        ;
    } // hilite()

    function extent(value) {
        value = value || { x: null, y: null }
        scale.x.domain(value.x || domain.x);
        scale.y.domain(value.y || domain.y);
    } // extent()

    function update(selection) {
        selection = selection || svg;
        setHeights();

        selection.selectAll("rect.note")
            .attr("x", function(d) { return scale.x(d.time); })
            .attr("width", function(d) {
                return scale.x(d.time + d.duration) - scale.x(d.time);
              })
            .attr("y", function(d) { return scale.y(d.pitch); })
            .attr("height", noteHeight)
            .attr("rx", roundedCornerSize)
            .attr("ry", roundedCornerSize)
            .style("color", function(d) {
                return scale.color(d.voice);
              })
        ;
        hilite();
    } // update()

    function setHeights() {
        noteHeight = height / (scale.y.domain()[1] - scale.y.domain()[0]);
        roundedCornerSize = noteHeight / 2;
    } // setHeights()

    function computeExtremeNotes() {
        svg.selectAll("rect.note").each(function(d) {
            d3.select(this)
                .classed("extreme", function(d) {
                    return showExtremeNotes
                        && domain.y.some(function(e) { return d.pitch === e; })
                    ;
                  })
            ;
          })
        ;
    } // computeExtremeNotes()

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
    my.colorScale = function (value) {
        if(arguments.length === 0) return scale.color;

        scale.color = value;
        return my;
      } // my.colorScale()
    ;
    my.width = function (value) {
        if(arguments.length === 0) return width;

        width = value;
        scale.x.range([0, width - 1]);

        return my;
      } // my.width()
    ;
    my.height = function (value) {
        if(arguments.length === 0) return height;

        height = value;
        scale.y.range([height, 0]);

        setHeights();

        return my;
      } // my.height()
    ;
    my.state = function(value) {
        if(!arguments.length) return state;

        state = value;
        return my;
      } // my.state()
    ;
    my.tooltip = function(value) {
        if(!arguments.length === 0) return tooltip;

        tooltip = value.html(function(d) { return d.pitchName; });
        return my;
      } // my.tooltip()
    ;
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.showExtremeNotes = function(value) {
        if(!arguments.length)
            return showExtremeNotes;
        else
            showExtremeNotes = value;

        return my;
      } // my.showExtremeNotes()
    ;

    /*
    ** API (Getter ONLY) Functions
    */
    my.noteHeight = function () { return noteHeight; };
    my.roundedCornerSize = function () { return roundedCornerSize; };
    my.x = function() { return scale.x; };

    /*
    ** API (Setter ONLY) Functions
    */
    my.zoom = function(value) {
        // Set the domain of notes in the zoomed in region
        //  -- if value is empty, the zoom is reset to the dataset's domain
        extent(value);

        return my;
      } // my.zoom()
    ;
    my.update = function() {
        // Call update, with a transition
        update(svg.transition());

        return my;
      } // my.update()
    ;
    my.snap = function() {
        // Call update with immediate effect (no transition)
        update();

        return my;
      } // my.snap()
    ;

    // This is always the last thing returned
    return my;
} // NotesCanvas()
