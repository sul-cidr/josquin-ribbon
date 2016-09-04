var width = 960
  , height = 150 // height of one strip of notes
  , margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , notesNav = NotesCanvas()
  , notesNavSVG = d3.select("#nav")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
  , notesBook = NotesBook()
  , notesBookSVG = d3.select("#notes")
      .append("svg")
        .attr("width", width)
        .attr("height", 3 * height)
  , combineSeparateDiv = d3.select("#combine-separate-ui")
  , combineSeparateUI = CombineSeparateUI()
  , extremeNotesDiv = d3.select("#extreme-notes-ui")
  , extremeNotesUI = ExtremeNotesUI()
  , brush = BrushView()
  , legendContainer = d3.select("div#legend")
  , colorLegend = ColorLegend()
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

    combineSeparateDiv
        .call(combineSeparateUI.connect(signal))
    ;
    extremeNotesDiv
        .call(extremeNotesUI.connect(signal))
    ;
    notesNav
        .colorScale(colorScale)
        .margin(margin)
        .width(width)
        .height(height)
        .connect(signal)
    ;
    notesBook
        .colorScale(colorScale)
        .margin(margin)
        .height(height * 3)
        .width(width)
        .extremes(true)
        .connect(signal)
    ;
    colorLegend
        .noteHeight(10)
        .roundedCornerSize(5)
        .connect(signal)
    ;
    colorScale
        .domain(data.partnames)
    ;
    renderColorLegend(data.partnames);
    renderNotesNav(data.notes);
    renderNotesBook(data);

    var full = {
          x: [0, data.scorelength[0]]
        , y: [data.minpitch.b7 - 1, data.maxpitch.b7]
      }
    ;
    notesNav.snap(full);
    notesBook.full(full);

    brush
        .height(height)
        .connect(signal)
    ;
    signal
        .on("zoom",     notesBook.zoom)
        .on("hilite",   notesBook.hilite)
        .on("separate", notesBook.separate)
        .on("extremes", notesBook.extremes)
    ;
} // chartify()

function renderNotesNav(data) {
    notesNavSVG
      .append("g")
        .datum({ key: "full", value: d3.merge((data.values())) })
        .call(notesNav)
        .call(brush.x(notesNav.x()))
    ;
} // renderNotesNav()
function renderNotesBook(data) {
    notesBookSVG
        .datum(data)
        .call(notesBook)
    ;
} // renderNotesBook()
function renderColorLegend(data) {
    legendContainer
        .datum(data)
        .call(colorLegend)
    ;
} // renderColorLegend()
