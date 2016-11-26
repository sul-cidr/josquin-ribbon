var width = 960
  , height = 150 // height of one strip of notes
  , margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , notesNav = NotesNav()
      .svg(d3.select("#nav").append("svg"))
  , notesBook = NotesBook()
      .svg(d3.select("#notes"))
  , divMeta = d3.select("#meta")
  , notesUI = NotesUI()
      .div(divMeta.select("#notes-ui"))
  , ribbonsUI = RibbonsUI()
      .div(divMeta.select("#ribbons-ui"))
  , colorLegend = ColorLegend()
      .div(divMeta.select("#legend"))
  , colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  , lifeSize = 10 // screen width of 1 duration
  , lifeScale = d3.scaleLinear()
;
var defaultWork = "Jos2721-La_Bernardina"
  , hash = getQueryVariables()
  , work = hash.id || defaultWork
  , jsonURL = "http://josquin.stanford.edu/cgi-bin/jrp?a=proll-json&f=" + work
;
d3.json(jsonURL, function(error, proll) {
    if(error) throw error;
    // Set the URL history to the current song
    history.pushState(null, null, '?id=' + work);
    chartify(parseJSON(proll));
});

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
    notesUI.connect(signal);
    ribbonsUI.connect(signal);

    colorScale
        .domain(data.partnames)
    ;
    notesNav
        .colorScale(colorScale)
        .margin(margin)
        .width(width)
        .height(height)
        .data(data)
        .connect(signal)
    ;
    notesBook
        .colorScale(colorScale)
        .margin(margin)
        .height(height * 3)
        .width(width)
        .extremes(true)
        .data(data)
        .connect(signal)
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
    ribbonsUI();
    colorLegend();

    var full = {
          x: [0, data.scorelength[0]]
        , y: d3.range(data.minpitch.b7, data.maxpitch.b7)
      }
    ;
//    notesNav.full(full);
    notesBook.full(full);

    // Lifesize of this piece
    lifeScale
        .range([0, lifeSize * data.scorelength[0]])
        .domain([0, data.scorelength[0]])
    ;
    // Domain window corresponding to the size of the canvas
    notesNav.extent([0, lifeScale.invert(notesBook.width())]);


    signal
        .on("zoom"         , notesBook.zoom)
        .on("hilite"       , notesBook.hilite)
        .on("separate"     , notesBook.separate)
        .on("extremes"     , notesBook.extremes)
        .on("toggleNotes"  , notesBook.toggleNotes)
        .on("toggleRibbons", notesBook.toggleRibbons)
        .on("ribbonMode"   , notesBook.ribbonMode)
    ;

    // Titles and other UI polishes
    var titles = divMeta.selectAll(".panel-title")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

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
