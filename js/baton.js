var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , divMeta = d3.select("#meta")
  , canvas = NotesCanvas()
      .svg(d3.select("body").append("svg").attr("id", "unrendered"))
  , notesNav = NotesNav()
  , notesBook = NotesBook()
  , notesUI = NotesUI()
      .div(divMeta.select("#notes-ui"))
  , colorLegend = ColorLegend()
      .div(divMeta.select("#legend"))
  , colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  , combineButton = [{
          callback: "separate"
        , icon: "format_line_spacing" // label
        , options: null // no dropdown
      }]
  , ribbonButtons = [{
          callback: "ribbons"
        , icon: null
        , options: {
                "standard_deviation": "Standard Deviation"
              , "attack_density": "Attack Density"
            } // dropdown
      }]
;
var defaultWork = "Jos2721-La_Bernardina"
  , hash = getQueryVariables()
  , work = hash.id || defaultWork
  , jsonURL = "http://josquin.stanford.edu/cgi-bin/jrp?a=proll-json&f=" + work
;
d3.queue()
    .defer(d3.json, jsonURL)
    .await(function(error, proll) {
        if(error) throw error;
        // Set the URL history to the current song
        history.pushState(null, null, '?id=' + work);
        chartify(parseJSON(proll));
      })
;

function parseJSON(proll) {
    var remix = d3.map(); // new container for notes data

    proll.partdata.forEach(function(part) {
        var voice = proll.partnames[part.partindex]
          , notes = []
          , extent = d3.extent(part.notedata, function(d){ return d.pitch.b7; })
        ;
        part.notedata.forEach(function(note) {
            var pitch = note.pitch.b7;
            notes.push({
                  pitch: pitch
                , note: note.pitch.name
                , time: note.starttime[0]
                , duration: note.duration[0]
                , extreme: pitch === extent[0] || pitch === extent[1]
            });
        });
        remix.set(voice, { index: part.partindex, notes: notes });
    });
    proll.notes = remix.entries()
        .sort(function(a, b) {
            return d3.ascending(a.value.index, b.value.index);
          })
    ;
    return proll;
} // parseJSON()

function chartify(data) {
    var signal = d3.dispatch(
              "hilite"
            , "zoom"
            , "separate"
            , "selected"
            , "extremes"
            , "ribbons"
            , "notes"
          )
    ;
    canvas.svg()
        .style("display", "none") // Hide the source svg
    ;
    canvas
        .data(data) // draw things in the shadow DOM.
      ()
    ;

    var viewbox = canvas.viewbox();
    viewbox[0] = viewbox[1] = 0;

    var width = Math.abs(viewbox[2] - viewbox[0])
      , height = Math.abs(viewbox[3] - viewbox[1])
      , fullheight = height * data.partnames.length
    ;

    notesBook
        .svg(d3.select("#book").call(canvas.render).select("svg").datum(data.partnames))
        .viewbox(viewbox)
        .connect(signal)
    ;
    notesNav
        .svg(d3.select("#nav").call(canvas.render).select("svg"))
        .viewbox(viewbox)
        .connect(signal)
    ;
    d3.select("#separate-ui")
        .datum(combineButton)
        .call(ToggleUI().connect(signal))
    ;
    d3.select("#ribbons-ui")
        .datum(ribbonButtons)
        .call(ToggleUI().connect(signal))
    ;
    notesUI.connect(signal);
    colorScale
        .domain(data.partnames)
    ;
    colorLegend
        .colorScale(colorScale)
        .noteHeight(10)
        .roundedCornerSize(5)
        .data(data.partnames)
        .connect(signal)
    ;

    // Render views.
    notesNav();
    notesBook();
    notesUI();
    colorLegend();

    // Hide ribbons initially
    d3.selectAll(".ribbon g").style("display", "none");

    var transition = d3.transition();
    signal
        .on("zoom", function(extent) { // Only changes width and x coordinate
            var sel = d3.select("#book svg")
              , vb = sel.attr("viewBox").split(' ')
              , h = Math.abs(vb[3] - vb[1]) // don't change the height
              , w = Math.abs(extent[1] - extent[0])
            ;
            sel
                .attr("viewBox", [extent[0], vb[1], w, vb[3]].join(' '))
            ;
          })
        .on("separate", function(arg) { // Only changes height and y coordinate
            var sel = d3.select("#book svg")
              , vb = sel.attr("viewBox").split(' ')
            ;
            vb[3] = arg ? fullheight : height;
            vb[2] = Math.abs(vb[2] - vb[0]);

            sel
              .transition(transition)
                .attr("viewBox", vb.join(' '))
              .selectAll("svg")
                .attr("y", function(d, i) {
                    return arg ? i * height : 0;
                  })
            ;
          })
        .on("hilite", function(arg) {
            if(!arg[0])
                d3.select("#book svg").selectAll("svg.subdued")
                    .classed("subdued", false)
            else
                d3.select("#book svg").selectAll("svg")
                    .classed("subdued", function(d, i) { return i !== arg[1]; })
                ;
          })
        .on("extremes", function() {
            var xtrms = d3.selectAll(".extreme");
            d3.selectAll(".extreme-plain")
                .classed("extreme", xtrms.empty())
            ;
          })
        .on("ribbons", function(arg) {
            d3.selectAll(".ribbon g")
                .style("display", function(d) {
                    return d.toLowerCase() === arg ? "inline" : "none";
                  })
            ;
          })
        .on("notes", function() { // toggles the notes on/off
            var score = d3.selectAll(".score")
              , vis = score.style("display")
            ;
            score.style("display", vis == "inline" ? "none" : "inline");
          })
    // Titles and other UI polishes
    var titles = divMeta.selectAll(".panel-title")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

    /*
    ** Helper functions for chartify's scope only
    */
} // chartify()

/// Capture URL query param
function getQueryVariables() {
    var inits = {}
      , query = window.location.search.substring(1).toLowerCase().split("&")
      , arg // loop variable

    ;
    query.forEach(function(q) {
        arg = q.split("=");
        if(arg[0].length && arg[1].length)
            inits[arg[0]] = decodeURIComponent(arg[1]);
      })
    ;
    return inits;
} // getQueryVariables()

// Convert a string into a form suitable for use as a css class name
// Hopefully the voice names don't contain Unicode strings
// From: https://gist.github.com/mathewbyrne/1280286#gistcomment-1716050
function slugify(str) {
    return str.toLowerCase()
        .trim() // remove trailing and leading whitepsace
        .replace(/[^\w\s-]/g, '') // remove non-{alphanum,whitespace,hyphen}s
        .replace(/[\s_-]+/g, '-') // {whitespace,underscore,hyphen}s -> hyphen
        .replace(/^-+|-+$/g, '') // remove leading, trailing hyphens
    ;
} // slugify()
