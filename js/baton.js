var width = 960
  , height = 150 // height of one strip of notes
  , margin = { top: 20, right: 20, bottom: 20, left: 20 }
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
        ;
        part.notedata.forEach(function(note) {
            notes.push({
                  pitch: note.pitch.b7
                , note: note.pitch.name
                , time: note.starttime[0]
                , duration: note.duration[0]
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
    // Hide the source svg
    canvas.svg().style("display", "none");
    canvas.data(data)(); // draw things in the shadow DOM.
    var vb = canvas.viewbox();
    vb[0] = vb[1] = 0;

    var w = Math.abs(vb[2] - vb[0])
      , h = Math.abs(vb[3] - vb[1])
      , book = d3.selectAll("#book").call(build_image)
      , nav = d3.select("#nav").call(build_image)
    ;


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
            page = page.enter()
              .append("svg")
                .call(sizeit)
                .attr("preserveAspectRatio", "xMinYMid slice")
                .attr("class", function(d, i) { return "voice" + i; })
              .merge(page)
            ;
            page
              .append("use")
                .attr("xlink:href", function(d, i) { return "#voice" + i; })
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", w)
                .attr("height", h)
            ;
          })
        ;
    } // build_image()

    function sizeit(sheet) {
        sheet
            .attr("viewBox", vb.join(' '))
            .attr("width", w)
            .attr("height", h)
        ;
    } // sizeit()

    var signal = d3.dispatch(
              "hilite"
            , "zoom"
            , "separate"
            , "selected"
            , "extremes"
            , "toggleRibbons"
            , "ribbonMode"
            , "toggleNotes"
          )
    ;
    notesNav
        .svg(d3.select("#nav svg"))
        .viewbox(vb)
        .connect(signal)
      ()
    ;
    notesUI.connect(signal);
    ribbonsUI.connect(signal);
    colorScale
        .domain(data.partnames)
    ;
    // notesNav
    //     .colorScale(colorScale)
    //     .margin(margin)
    //     .width(width)
    //     .height(height)
    //     .data(data)
    //     .connect(signal)
    // ;
    // notesBook
    //     .colorScale(colorScale)
    //     .margin(margin)
    //     .height(height * 3)
    //     .width(width)
    //     .extremes(true)
    //     .data(data)
    //     .connect(signal)
    // ;
    colorLegend
        .colorScale(colorScale)
        .noteHeight(10)
        .roundedCornerSize(5)
        .data(data.partnames)
        .connect(signal)
    ;

    // Render views.
    // notesNav();
    // notesBook();
    // combineSeparateUI();
    notesUI();
    ribbonsUI();
    colorLegend();

    signal
        .on("zoom", function(extent) {
            var w = extent[1] - extent[0];
            d3.select("#book svg")
                .attr("viewBox", [extent[0], vb[1], w, vb[3]].join(' '))
            ;
          })
        .on("separate", function(arg) { console.log(arg); })
        // .on("hilite",   notesBook.hilite)
        // .on("extremes", notesBook.extremes)
        // .on("showRibbons", notesBook.showRibbons)
        // .on("ribbonMode", notesBook.ribbonMode)
        // .on("notes", notesBook.showNotes)
    // Titles and other UI polishes
    var titles = divMeta.selectAll(".panel-title")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

} // chartify()

// Calculate the extent of a range
function difference(range) {
    return Math.abs(range[1] - range[0]);
} // extent()

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
