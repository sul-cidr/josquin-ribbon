var width = 960
  , height = 150 // height of one strip of notes
  , notesViewContext = NotesCanvas()
  , notesViewContextSVG = d3.select("#notes")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
  , notesViewFocus = NotesBook()
  , notesViewFocusSVG = d3.select("#notes")
      .append("svg")
        .attr("width", width)
        .attr("height", 3 * height)
  , combineSeparateDiv = d3.select("#combine-separate-ui")
  , combineSeparateUI = CombineSeparateUI()
  , brush = BrushView()
  , legendContainer = d3.select("div#legend")
  , colorLegend = ColorLegend()
  , colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  , tip = d3.tip().attr("class", "d3-tip")
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
                , pitchName: note.pitch.name
                , time: note.starttime[0]
                , duration: note.duration[0]
                , voice: voice
            });
        });
    });
    // Group the notes by voice
    proll.notes = d3.nest()
        .key(function(d) { return d.voice; })
        .map(notes, d3.map)
    ;
    return proll;
} // parseJSON()

function chartify(data) {
    var signal = d3.dispatch("hilite", "zoom", "separate", "selected");

    combineSeparateDiv
        .call(combineSeparateUI.connect(signal))
    ;
    notesViewContext
        .colorScale(colorScale)
        .width(width)
        .height(height)
        .connect(signal)
    ;
    notesViewFocus
        .colorScale(colorScale)
        .height(height * 3)
        .tooltip(tip)
        .showExtremeNotes(true)
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
    renderNotesViewContext(data.notes);
    renderNotesViewFocus(data);

    var full = {
          x: [0, data.scorelength[0]]
        , y: [data.minpitch.b7 - 1, data.maxpitch.b7]
      }
    ;
    notesViewContext.snap(full);
    notesViewFocus.full(full);

    brush
        .height(height)
        .connect(signal)
    ;
    signal
        .on("zoom",     notesViewFocus.zoom)
        .on("hilite",   notesViewFocus.hilite)
        .on("separate", notesViewFocus.separate)
    ;
} // chartify()

function renderNotesViewContext(data) {
    notesViewContextSVG
      .append("g")
        .datum({ key: "full", value: d3.merge((data.values())) })
        .call(notesViewContext)
        .call(brush.x(notesViewContext.x()))
    ;
} // renderNotesViewContext()
function renderNotesViewFocus(data) {
    notesViewFocusSVG
        .datum(data)
        .call(notesViewFocus)
    ;
} // renderNotesViewContext()
function renderColorLegend(data) {
    legendContainer
        .datum(data)
        .call(colorLegend)
    ;
} // renderColorLegend()
