var width = 960
  , height = 150 // height of one strip of notes
  , margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , notesNav = NotesNav()
      .svg(d3.select("#nav").append("svg"))
  , notesBook = NotesBook()
      .svg(d3.select("#notes").append("svg"))
  , combineSeparateUI = CombineSeparateUI()
      .div(d3.select("#combine-separate-ui"))
  , extremeNotesUI = ExtremeNotesUI()
      .div(d3.select("#extreme-notes-ui"))
  , colorLegend = ColorLegend()
      .div(d3.select("div#legend"))
  , colorScale = d3.scaleOrdinal(d3.schemeCategory10)
;
var defaultWork = "Jos2721-La_Bernardina"
  , hash = window.location.hash
  , work = hash ? hash.substr(1) : defaultWork
  , jsonURL = "http://josquin.stanford.edu/cgi-bin/jrp?a=proll-json&f=" + work
;
d3.json(jsonURL, function(error, proll) {
    if(error) throw error;
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
    var signal = d3.dispatch("hilite", "zoom", "separate", "selected", "extremes");

    combineSeparateUI.connect(signal);
    extremeNotesUI.connect(signal);

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
        .noteHeight(10)
        .roundedCornerSize(5)
        .data(data.partnames)
        .connect(signal)
    ;
        
    // Render views.
    notesNav();
    notesBook();
    combineSeparateUI();
    extremeNotesUI();
    colorLegend();

    var full = {
          x: [0, data.scorelength[0]]
        , y: d3.range(data.minpitch.b7, data.maxpitch.b7)
      }
    ;
    notesNav.full(full);
    notesBook.full(full);

    signal
        .on("zoom",     notesBook.zoom)
        .on("hilite",   notesBook.hilite)
        .on("separate", notesBook.separate)
        .on("extremes", notesBook.extremes)
    ;
} // chartify()
