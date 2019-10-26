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
      , y = d3.scaleBand().padding(0.2)
      , generator = d3.entries({
              score: Score()
            , ribbon: Ribbon()
          })
      , lifeSize = 10 // default height and width of notes
      , dispatch
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
    function render(sel) {
        var sheet = sel.selectAll("svg")
            .data([sel.attr("id")], function(d) { return d; })
        ;
        sheet.exit().remove();

        sheet = sheet.enter()
          .append("svg")
            .call(sizeit)
            .attr("class", "lens")
             // Stretch contents to container
            .attr("preserveAspectRatio", "none")
          .merge(sheet)
        ;
        // Nest the voice SVGs
        sheet.each(function() {
            var voice = d3.select(this).selectAll("svg")
                .data(data.partnames, function(d) { return d; })
            ;
            voice.exit().remove();
            voice.enter()
              .append("svg")
                .call(sizeit)
                .attr("class", function(d, i) { return "voicebox voice" + i; })
                .attr("preserveAspectRatio", "xMinYMid slice")
              .append("use")
                .attr("xlink:href", function(d, i) { return "#voice" + i; })
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height)
            ;
          })
        ;

        // Local helper function
        function sizeit(box) {
            box
                .attr("viewBox", viewbox.join(' '))
                .attr("width", width)
                .attr("height", height)
            ;
        } // sizeit()
    } // render()

    /*
    ** API (Getter/Setter) Functions
    */
    my.svg = function(_) {
        if(!arguments.length) return svg;
        svg = _;
        return my;
      } // my.svg()
    ;
    my.viewbox = function(_) {
        if(!arguments.length) return viewbox;

        viewbox = _;
        return my;
      } // my.viewbox()
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
    my.connect = function(value) {
        if(!arguments.length) return dispatch;

        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.extremes = function() {
        var xtrms = svg.selectAll(".extreme").empty();
        svg.selectAll(".extreme-plain")
            .classed("extreme", xtrms)
        ;
      } // my.extremes()
    ;
    my.ribbons = function(arg) {
      console.log("notescanvas ribbons arg",arg);
        svg.selectAll(".ribbon g")
            .style("display", function(d) {
                return d.toLowerCase() === arg ? "inline" : "none";
              })
        ;
      } // my.ribbons()
    ;
    my.notes = function() { // toggles the notes on/off
        var score = svg.selectAll(".score")
          , vis = score.style("display")
        ;
        score.style("display", vis === "inline" ? "none" : "inline");
      } // my.notes()
    ;
    /*
    ** API (Getter ONLY) Functions
    */
    my.noteHeight = function () { return noteHeight; };
    my.roundedCornerSize = function () { return roundedCornerSize; };
    my.x = function() { return x; };
    my.y = function() { return y; };

    /*
    ** Special API Stamp Functions
    */
    my.render = render;
    // This is always the last thing returned
    return my;
} // NotesCanvas()
