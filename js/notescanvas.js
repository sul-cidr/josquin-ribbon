function NotesCanvas() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg, data
      , width
      , height
      , margin = { top: 10, bottom: 10, left: 0, right: 0 }
      , scale = { x: d3.scaleLinear(), y: d3.scaleBand(), color: null }
      , domain = { x: [], y: [] } // store the dataset's domains
      , tooltip
      , roundedCornerSize
      , dispatch
      , state = true // on; false = off
      , extremes = false
      , reflinesValues = {
              32: { label: "G", style: "solid" },
              28: { label: "C4", style: "dashed" },
              24: { label: "F", style: "solid" }
          }
      , reflinesAxis = d3.axisLeft()
            .tickValues(Object.keys(reflinesValues))
            .tickFormat(function (d){ return reflinesValues[d].label; })
      , reflines
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
        scale.x.domain(domain.x).range([0, width ]);
        domain.y = d3.range(
              d3.min(data.value, function(d) { return d.pitch; })
            , d3.max(data.value, function(d) { return d.pitch; })
          )
        ;
        scale.y.domain(domain.y).range([height, 0]);

        svg = selection
              .attr("class", "notes-g " + data.key)
        ;
        var rects = svg.selectAll("rect").data(data.value);
        rects
          .enter().append("rect")
            .attr("class", "note")
        ;
        rects.exit().remove();
        computeExtremeNotes();
        enableTooltips();

        reflinesAxis
            .scale(scale.y)
            .tickSize(-width)
        ;
        reflines = svg
          .append("g")
            .attr("class", "reflines")
            .call(reflinesRender)
        ;

        update();
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

        selection.selectAll("rect.note")
            .attr("x", function(d) { return scale.x(d.time); })
            .attr("width", function(d) {
                return scale.x(d.time + d.duration) - scale.x(d.time);
              })
            .attr("y", function(d) { return scale.y(d.pitch); })
            .attr("height", scale.y.bandwidth())
            .attr("rx", scale.y.bandwidth() / 2)
            .attr("ry", scale.y.bandwidth() / 2)
            .style("color", function(d) {
                return scale.color(d.voice);
              })
        ;
        hilite();
        reflines.call(reflinesRender);
    } // update()

    function reflinesRender(selection){
       selection
           .call(reflinesAxis)
         .selectAll(".tick")
           .filter(function (d){ return reflinesValues[d].style === "dashed" })
           .attr("stroke-dasharray", "4 4")
       ;
    } // reflinesRender()



    function computeExtremeNotes() {
        if(svg){
            var extent = d3.extent(data.value, function (d){ return d.pitch; });
            svg.selectAll("rect.note").each(function(d) {
                d3.select(this)
                    .classed("extreme", function(d) {
                        return extremes
                            && extent.some(function(e) { return d.pitch === e; })
                        ;
                      })
                ;
              })
        }
        ;
    } // computeExtremeNotes()

    function enableTooltips() {
        if(tooltip && svg) {
            svg.selectAll("rect.note")
                .on("mouseover", tooltip.show)
                .on("mouseout", tooltip.hide)
            ;
        }
    } // enableTooltips()

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
        scale.x.range([0, width]);

        return my;
      } // my.width()
    ;
    my.height = function (value) {
        if(arguments.length === 0) return height;

        height = value;
        scale.y.range([height, 0]);

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
        if(!arguments.length) return tooltip;

        tooltip = value;
        enableTooltips();
        return my;
      } // my.tooltip()
    ;
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.extremes = function(value) {
        if(!arguments.length)
            return extremes;
        else {
            extremes = value;
            computeExtremeNotes();
        }

        return my;
      } // my.extremes()
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
