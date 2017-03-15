var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , divMeta = d3.select("#meta")
  , notesNav = NotesNav()
  , notesBook = NotesBook()
  , colorLegend = ColorLegend()
      .div(divMeta.select("#legend"))
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
    var signal = d3.dispatch(
              "hilite"
            , "zoom"
            , "separate-voices"
            , "selected"
            , "show-extremes"
            , "show-ribbon"
            , "show-notes"
          )
    ;
    notesBook
        .svg(d3.select("#notesbook").select("svg"))
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
        .on("show-notes",    notesBook.notes)
        .on("show-extremes", notesBook.extremes)
        .on("hilite",   notesBook.hilite)
        .on("show-ribbon",  notesBook.ribbons)
        .on("separate-voices", notesBook.separate)
        .on("zoom",     notesBook.zoom)
    ;
    // Connect the UI control elements
    // Combine/Separate Voices
    d3.select("#separate-ui").selectAll("input")
        .on("change", function(d) {
            signal.call(this.id, this, this.checked)
        })
    ;
    // Show/Hide Notes and Extreme Notes
    d3.select("#notes-ui").selectAll("input")
        .on("change", function(d) {
            d3.select(this.parentNode.nextElementSibling)
                .style("display", this.checked ? null : "none")
            ;
            signal.call(this.id, this, null);
          })
    ;
    // Show/Hide ribbons
    d3.select("#ribbons-ui").each(function() {
      var check = d3.select(this).select("input")
        , choice = d3.select(this).select("select")
        , callback = check.node().id // callback name == checkbox 'id'
      ;
      // Hide the ribbon dropdown initially
      choice.style("display", "none");

      check.on("change", function(d) {
          choice.style("display", this.checked ? null : "none");
          signal.call(callback, this, this.checked ? choice.node().value: this.value);
        })
      ;
      choice.on("change", function() {
          signal.call(callback, this, this.value);
        })
      ;
    });

    // Titles and polish
    var titles = divMeta.select(".panel-heading").selectAll("*")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

    d3.selectAll("#export-svg-button")
        .on("click", function (){
          var node = d3.select(".bezel").node()
            , filename = "josquin-export-" + work + ".svg"
          ;
          new SvgSaver().asSvg(node, filename);
        });
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
