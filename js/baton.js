var width = 960
  , height = 150 // height of one strip of notes
  , margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , canvas = NotesCanvas()
      .svg(d3.select("body").append("svg")) // on the shadow DOM
  // , notesNav = NotesNav()
  //     .svg(d3.select("#nav").append("svg"))
  // , notesBook = NotesBook()
  //     .svg(d3.select("#notes"))
  , combineSeparateUI = CombineSeparateUI()
      .div(d3.select("#combine-separate-ui"))
  , extremeNotesUI = ExtremeNotesUI()
      .div(d3.select("#extreme-notes-ui"))
  , ribbonsUI = RibbonsUI()
      .div(d3.select("#ribbons-ui"))
  , colorLegend = ColorLegend()
      .div(d3.select("div#legend"))
  , colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  , lifeSize = 10 // screen width of 1 duration
  , lifeScale = d3.scaleLinear()
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
    var notes = []
      , voice
    ;
    proll.partdata.forEach(function(part) {
        voice = proll.partnames[part.partindex];
        part.notedata.forEach(function(note) {
            notes.push({
                  pitch: note.pitch.b7
                , note: note.pitch.name
                , time: note.starttime[0]
                , duration: note.duration[0]
                , voice: voice
            });
        });
    });
    // Group the notes by voice
    proll.notes = d3.nest()
        .key(function(d) { return d.voice; })
        .map(notes)
    ;
    return proll;
} // parseJSON()

function chartify(data) {
    canvas.data(data)(); // draw things in the shadow DOM.
    var notesnav = d3.select("#nav").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
    ;
    notesnav
      .append("use")
        .attr("xlink:href", "#score")
        .attr("pointer-events", "none")
    ;
    notesnav
      .append("use")
        .attr("xlink:href", "#ribbon")
    ;
    var signal = d3.dispatch(
              "hilite"
            , "zoom"
            , "separate"
            , "selected"
            , "extremes"
            , "showRibbons"
            , "ribbonMode"
            , "notes"
          )
    ;
    combineSeparateUI.connect(signal);
    extremeNotesUI.connect(signal);
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
    combineSeparateUI();
    extremeNotesUI();
    ribbonsUI();
    colorLegend();

    var full = {
          x: [0, data.scorelength[0]]
        , y: d3.range(data.minpitch.b7, data.maxpitch.b7)
      }
    ;
    // notesNav.full(full);
    // notesBook.full(full);

    // Lifesize of this piece
    lifeScale
        .range([0, lifeSize * data.scorelength[0]])
        .domain([0, data.scorelength[0]])
    ;
    // Domain window corresponding to the size of the canvas
    // notesNav.extent([0, lifeScale.invert(notesBook.width())]);

    signal
        // .on("zoom",     notesBook.zoom)
        // .on("hilite",   notesBook.hilite)
        // .on("separate", notesBook.separate)
        // .on("extremes", notesBook.extremes)
        // .on("showRibbons", notesBook.showRibbons)
        // .on("ribbonMode", notesBook.ribbonMode)
        // .on("notes", notesBook.showNotes)
    ;
} // chartify()

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
