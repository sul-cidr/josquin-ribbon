function NotesCanvas() {
    /*
    ** Private Variables - only used inside this object
    */
    var svg
      , data
      , width
      , height
      , margin = { top: 10, bottom: 10, left: 0, right: 0 }
      , x = d3.scaleLinear()
      , y =  d3.scaleBand() // Used for the "separate" view
      , separate = false
      , generator = {
              score: Score()
            , ribbon: Ribbon()
            //, reflines: function(){}//Reflines()
          }
      , lifeSize = 10 // default height and width of notes
      , tooltip
      , dispatch
      , clipPath
      , viewbox
    ;
    /*
    ** Main Function Object
    */
    function my() {
        var symbol = svg.selectAll("symbol")
            .data(d3.entries(generator), function(d) { return d.key; })
        ;
        symbol.exit().remove();
        symbol.enter()
          .append("symbol")
            .attr("id", function(d) { return d.key; })
            .attr("viewBox", viewbox.join(' '))
            .attr("preserveAspectRatio", "none")
          .each(generate)
        ;
    } // my()

    /*
    ** Helper Callback Functions
    */
    function generate(g) {
        var self = d3.select(this);
        self.selectAll("." + g.key)
            .data(data.partnames, function(d) { return d; })
          .enter().append("g")
            .attr("class", function(d, i) {
                return [g.key, slugify(d), ("voice" + i)].join(' ');
              })
          .each(function(d) {
              var self = d3.select(this);
              g.value
                  .x(x)
                  .y(y)
                  .data(data.notes.get(d))
                  .svg(self)
                ()
              ;
            })
        ;
    } // generate()

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

    function reflinesRender(selection) {
        selection.style("visibility", showReflines ? "visible" : "hidden");
        if(!showReflines) return;

        selection
           .call(reflinesAxis)
         .selectAll(".tick")
           .filter(function (d){ return reflinesValues[d].style === "dashed" })
           .attr("stroke-dasharray", "4 4")
       ;
    } // reflinesRender()



    function computeExtremeNotes() {
        if(!svg) return;
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

        return my;
      } // my.colorScale()
    ;
    my.width = function (value) {
        if(arguments.length === 0) return width;

        return my;
      } // my.width()
    ;
    my.height = function (value) {
        if(arguments.length === 0) return height;

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
    my.x = function() { return x; };
    my.y = function() { return y; };

    /*
    ** API (Setter ONLY) Functions
    */
    my.svg = function(_) {
        if(!arguments.length) return svg;
        svg = _;
        return my;
      } // my.svg()
    ;
    my.data = function(_) {
        if(!arguments.length) return data;
        data = _;
        x.domain([0, data.scorelength[0]]);
        y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1));

        var scaleup = function(d) { return d * lifeSize; };
        x.range(x.domain().map(scaleup));
        y.range(d3.extent(y.domain()).reverse().map(scaleup));

        width   = Math.abs(x.range()[1] - x.range()[0]);
        height  = Math.abs(y.range()[1] - y.range()[0]);
        viewbox = [x.range()[0], y.range()[1], width, height];
        return my;
      } // my.data()
    ;
    my.zoom = function(value) {
        // Set the domain of notes in the zoomed in region
        //  -- if value is empty, the zoom is reset to the dataset's domain
        extent(value);

        return my;
      } // my.zoom()
    ;
    my.update = function(trnstn) {
        // Call update, with a transition
        update(trnstn ? svg.transition(): svg);

        return my;
      } // my.update()
    ;
    my.viewbox = function(_) {
        if(!arguments.length) return viewbox;

        viewbox = _;
        return my;
      } // my.viewbox()
    ;

    // This is always the last thing returned
    return my;
} // NotesCanvas()
