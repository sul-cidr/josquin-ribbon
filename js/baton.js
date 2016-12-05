var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , divMeta = d3.select("#meta")
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
    proll.partdata.forEach(function(part) {
        part.voice = proll.partnames[part.partindex];
      })
    // var remix = {}; // new container for notes data
    //
    // proll.partdata.forEach(function(part) {
    //     var voice = proll.partnames[part.partindex]
    //       , notes = []
    //       , extent = d3.extent(part.notedata, function(d){ return d.pitch.b7; })
    //     ;
    //     part.notedata.forEach(function(note) {
    //         var pitch = note.pitch.b7;
    //         notes.push({
    //               pitch: pitch
    //             , note: note.pitch.name
    //             , time: note.starttime[0]
    //             , duration: note.duration[0]
    //             , extreme: pitch === extent[0] || pitch === extent[1]
    //         });
    //     });
    //     remix[voice] = {
    //           index: part.partindex
    //         , notes: notes
    //         , range: d3.extent(notes, function(d) { return d.pitch; })
    //       }
    //     ;
    // });
    // proll.notes = d3.entries(remix)
    //     .sort(function(a, b) {
    //         return d3.ascending(a.value.index, b.value.index);
    //       })
    // ;
    return proll;
} // parseJSON()

function chartify(data) {
    console.log(data);
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
    notesBook
        .svg(d3.select("#viewer").select("svg"))
        .data(data)
        .connect(signal)
      ()
    ;
    notesNav
        .svg(d3.select("#navigator").append("svg"))
        .x(notesBook.x())
        .y(notesBook.y())
        .viewbox(notesBook.viewbox())
        .connect(signal)
      ()
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
    notesUI();
    colorLegend();

    signal
        .on("zoom", notesBook.zoom)
        .on("separate", notesBook.separate)
        .on("hilite", notesBook.hilite)
        .on("extremes", notesBook.extremes)
        .on("notes", notesBook.notes)
        .on("ribbons", notesBook.ribbons)
    ;
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
        .replace(/[^\w]/g, '') // remove non-alphanums
        .replace(/[\s_-]+/g, '-') // {whitespace,underscore,hyphen}s -> hyphen
        .replace(/^-+|-+$/g, '') // remove leading and trailing hyphens
    ;
} // slugify()
