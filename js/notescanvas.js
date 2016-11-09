function NotesCanvas() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , data
      , width
      , height
      , margin = { top: 10, bottom: 10, left: 0, right: 0 }
      , scale = {
          x: d3.scaleLinear(),
          y: d3.scaleBand(), // Used for the ref lines and notes.
          yLinear: d3.scaleLinear(), // Used for the ribbons.
          color: null
        }
      , domain = { x: [], y: [] } // store the dataset's domains
      , tooltip
      , roundedCornerSize
      , dispatch
      , state = true // on; false = off
      , extremes = false
      , showRibbon = false
      , showReflines = false
      , reflinesValues = {
              32: { label: "G", style: "solid" },
              28: { label: "C4", style: "dashed" },
              24: { label: "F", style: "solid" }
          }
      , reflinesPitches = Object.keys(reflinesValues)
            .map(function (d){ return +d; })
      , reflinesAxis = d3.axisLeft()
            .tickValues(reflinesPitches)
            .tickFormat(function (d){ return reflinesValues[d].label; })
      , clipPath
      , ribbon = Ribbon()
      , showNotes = true
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

        var pitches = data.value
                .map(function(d) { return d.pitch; })
                .concat(reflinesPitches)
          , pitchExtent = d3.extent(pitches)
        ;
        domain.y = d3.range.apply(null, pitchExtent);
        scale.y.domain(domain.y).range([height, 0]);
        syncYLinear();

        svg = selection
              .attr("class", "notes-g " + data.key)
        ;

        reflinesAxis
            .scale(scale.y)
            .tickSize(-width)
        ;
        svg
          .append("g")
            .attr("class", "reflines")
            .call(reflinesRender)
        ;

        var notesG = svg
          .append("g")
            .attr("class", "notes")
        ;

        if(clipPath){
            notesG.attr("clip-path", "url(#" + clipPath + ")");
        }

        if(showRibbon){
          ribbon
            .g(notesG.append("g"))
            .scale(scale)
            .domain(domain)
            .data(data)
          ;
        }

        var rects = notesG.selectAll("rect").data(data.value);

        rects
          .enter().append("rect")
            .attr("class", "note")
        ;
        rects.exit().remove();

        computeExtremeNotes();
        enableTooltips();

        update();
    } // my()

    // Synchronizes the Y Linear scale to values
    // from the Y band scale.
    function syncYLinear(){
        var extent = d3.extent(scale.y.domain());

        // Adjust the linear scale to match the band scale,
        // such that the note values map to the center points
        // of the note rectangles.
        extent[0] -= 0.5;
        extent[1] += 0.5;

        scale.yLinear
          .domain(extent)
          .range(scale.y.range())
        ;
    }

    /*
    ** Helper Functions
    */
    function hilite() {
        svg.selectAll("rect.note")
            .classed("subdued", !state)

            // Show extreme notes only if showNotes is false,
            // but extremes is true.
            .attr("display", null)
        ;
    } // hilite()

    function extent(value) {
        value = value || { x: null, y: null }
        scale.x.domain(value.x || domain.x);
        scale.y.domain(value.y || domain.y);
        syncYLinear();
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
            .attr("display", showNotes ? null : "none")
        ;
        hilite();
        selection.select(".reflines")
            .call(reflinesRender);

        ribbon();

    } // update()

    function reflinesRender(selection){
       if(showReflines){
           selection
               .style("visibility", "visible")
               .call(reflinesAxis)
             .selectAll(".tick")
               .filter(function (d){ return reflinesValues[d].style === "dashed" })
               .attr("stroke-dasharray", "4 4")
           ;
       } else {
           selection.style("visibility", "hidden");
       }
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
        syncYLinear();

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
    my.extremes = function() {
        extremes = !extremes;
        computeExtremeNotes();
        return my;
      } // my.extremes()
    ;
    my.showRibbon = function(value) {
        if(!arguments.length)
            return showRibbon;
        showRibbon = value;
        ribbon.show(showRibbon);
        return my;
      } // my.showRibbon()
    ;
    my.ribbonMode = function(value) {
        if(!arguments.length)
            return ribbonMode;
        ribbon.mode(value);
        return my;
      } // my.ribbonMode()
    ;
    my.showReflines = function (value) {
        if(arguments.length === 0) return showReflines;

        showReflines = value;
        return my;
      } // my.showReflines()
    ;

    my.clipPath = function (value) {
        if(arguments.length === 0) return clipPath;

        clipPath = value;
        return my;
      } // my.clipPath()
    ;

    my.showNotes = function (value) {
        if(arguments.length === 0) return showNotes;

        showNotes = value;
        return my;
      } // my.showNotes()
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
