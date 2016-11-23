var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , divMeta = d3.select("#meta")
  , canvas = NotesCanvas()
      .svg(d3.select("body").append("svg").attr("id", "unrendered"))
  , notesNav = NotesNav()
  // , notesBook = NotesBook()
  //     .svg(d3.select("#book"))
  , notesUI = NotesUI()
      .div(divMeta.select("#notes-ui"))
  , ribbonsUI = RibbonsUI()
      .div(divMeta.select("#ribbons-ui"))
  , colorLegend = ColorLegend()
      .div(divMeta.select("#legend"))
  , colorScale = d3.scaleOrdinal(d3.schemeCategory10)
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
          , extent = d3.extent(part.notedata, function(d) { return d.pitch.b7; })
        ;
        part.notedata.forEach(function(note) {
            notes.push({
                  pitch: note.pitch.b7
                , note: note.pitch.name
                , time: note.starttime[0]
                , duration: note.duration[0]
                , extreme: note.pitch.b7 === extent[0] || note.pitch.b7 === extent[1]
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
            , "toggleRibbons"
            , "ribbonMode"
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
    d3.selectAll("#book").call(build_image);
    d3.select("#nav").call(build_image);



    // notesBook
    //     .svg(d3.select("#book svg"))
    //     .viewbox(viewbox)
    //     .connect(signal)
    // ;
    notesNav
        .svg(d3.select("#nav svg"))
        .viewbox(viewbox)
        .connect(signal)
    ;
    d3.select("#separate-ui")
        .datum([{key: "separate", icon: "format_line_spacing"}])
        .call(ToggleUI().connect(signal))
    ;
    notesUI.connect(signal);
    ribbonsUI.connect(signal);
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
    // notesBook();
    // combineSeparateUI();
    notesUI();
//    ribbonsUI();
    colorLegend();

    var transition = d3.transition();
    signal
        .on("zoom", function(extent) { // Only changes width and x coordinate
            var sel = d3.select("#book svg")
              , vb = sel.attr("viewBox").split(' ')
              , h = vb[3] - vb[1] // don't change the height
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
        // .on("showRibbons", notesBook.showRibbons)
        // .on("ribbonMode", notesBook.ribbonMode)
        .on("notes", function() { // toggles the notes on/off
            var score = d3.selectAll(".score")
              , vis = score.style("display")
            ;
            score.style("display", vis == "inline" ? "none" : "inline")
          })
    // Titles and other UI polishes
    var titles = divMeta.selectAll(".panel-title")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

    /*
    ** Helper functions for chartify's scope only
    */
    function build_image(selection) {
        var sheet = selection.selectAll("svg")
            .data([selection.attr("id")])
        ;
        sheet = sheet.enter()
          .append("svg")
            .call(sizeit)
            .attr("preserveAspectRatio", "none")
            .style("width", "100%")
            .style("height", "100%")
          .merge(sheet)
        ;
        sheet.each(function() {
            var page = d3.select(this).selectAll("svg")
                .data(data.partnames, function(d) { return d; })
            ;
            page.enter()
              .append("svg")
                .call(sizeit)
                .attr("preserveAspectRatio", "xMinYMid slice")
                .attr("class", function(d, i) { return "voice" + i; })
              .append("use")
                .attr("xlink:href", function(d, i) { return "#voice" + i; })
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height)
            ;
          })
        ;
    } // build_image()

    function sizeit(sheet) {
        sheet
            .attr("viewBox", viewbox.join(' '))
            .attr("width", width)
            .attr("height", height)
        ;
    } // sizeit()
} // chartify()

// Calculate the extent of a range
function difference(range) {
    return Math.abs(range[1] - range[0]);
} // difference()

// Capture URL query param
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
