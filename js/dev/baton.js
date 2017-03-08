var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , divMeta = d3.select("#meta")
  , notesNav = NotesNav()
  , notesBook = NotesBook()
  , colorLegend = ColorLegend()
      .div(divMeta.select("#legend"))
  , ribbonsUI = askus()
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
    colorLegend
        .noteHeight(10)
        .roundedCornerSize(5)
        .data(data.partnames)
        .connect(signal)
    ;

    // Render views.
    colorLegend();

    signal
        .on("notes",    notesBook.notes)
        .on("extremes", notesBook.extremes)
        .on("hilite",   notesBook.hilite)
        .on("ribbons",  notesBook.ribbons)
        .on("separate", notesBook.separate)
        .on("zoom",     notesBook.zoom)
    ;
    // Connect the UI control elements
    // Show/Hide Notes and Extreme Notes
    d3.select("#notes-ui").selectAll(".btn")
        .datum(function(d) {
            return this.id.split("-")[1]; // names are: show-notes and show-extremesS
          })
        .on("click", function(d) {
            signal.call(d3.select(this).datum(), this, null);
          })
    ;
    // Combine/Separate Voices
    d3.select("#separate-ui")
        .on("click", function(d) {
            var checked = d3.select(this).select("input").node().checked;
            signal.call("separate", this, !checked)
        })
    ;
    // Show/Hide ribbons
    d3.select("#ribbons-ui").call(ribbonsUI.connect(signal));
    // Titles and polish
    var titles = divMeta.select(".panel-heading").selectAll("*")
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