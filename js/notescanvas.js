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
      , y =  d3.scaleBand().padding(0.2) // Used for the "separate" view
      , separate = false
      , generator = d3.entries({
              score: Score()
            , ribbon: Ribbon()
            //, reflines: function(){}//Reflines()
          })
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
              .data(data.notes, function(d) { return d.key; })
        ;
        symbol.exit().remove();
        symbol.enter()
          .append("symbol")
            .attr("id", function(d, i) { return "voice" + i; })
            .attr("viewBox", viewbox.join(' '))
            .each(function(voice, i) {
                var self = d3.select(this);
                // Create a `<g>` for each visualization generator
                self.selectAll("g")
                    .data(generator, function(g) { return g.key; })
                  .enter().append("g")
                    .attr("class", function(g) { return g.key; })
                    .each(function(g) {
                        g.value.x(x).y(y);
                        d3.select(this)
                            .datum(voice.value.notes)
                            // Call each visualization generator
                            .call(g.value)
                        ;
                      })
                ;
              })
        ;
    } // my()

    /*
    ** Helper Callback Functions
    */
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
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.showReflines = function (value) {
        if(arguments.length === 0) return showReflines;

        showReflines = value;
        return my;
      } // my.showReflines()
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
