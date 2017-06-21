var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  , divMeta = d3.select("#meta")
  , notesBook = NotesBook().svg(d3.select("#notesbook").select("svg"))
  , notesNav = NotesNav().svg(d3.select("#navigator").select("svg"))
  , colorLegend = ColorLegend().div(divMeta.select("#legend"))
  ;

  /*
  ** Visualization's signaling system
  */
  var signal = d3.dispatch(
          // List of signals we accept
          "hilite"
          , "zoom"
          , "separate-voices"
          , "selected"
          , "show-extremes"
          , "show-ribbon"
          , "show-notes"
          , "measure-based-scaling"
        )
  ;

/*
** Where to find individual songs and the list of songs
*/
var baseURL = 'http://josquin.stanford.edu/cgi-bin/jrp?'
  , catURL = baseURL + 'a=list'
  , jsonURL = baseURL + 'a=proll-json&f='
  , work // the currently displayed song
;
var mensurationsLUT = {{ site.data.mensurations | jsonify }}
      .map(function(m) {
          m.symbols = (m.symbols || m.sign).split(';');
          m.num_beats = +m.num_beats;
          m.num_quarter_notes = +m.num_quarter_notes;
          return m;
        });

/*
** Load the list of available songs
*/
d3.queue()
    .defer(d3.text, catURL)
    .await(function(error, list) {
        if(error) throw(error);
        var data = d3.nest()
                    // the first 3 letters + next 4 digits are the id
                    .key(function(k) { return k.split('-')[0].slice(0,7); })
                    .map(list.split('\n'))
                    .keys()
          , catalog = d3.select("#catalog")
          , opt = catalog.selectAll("option")
                    .data(data, function(d) { return d; })
        ;
        opt.enter()
          .append("option")
            .property("value", function(d) { return d; })
        ;
      })
;
/*
**  Activate the "Load button"
*/
d3.select("#load_song").on("click", function() {
    load_song(d3.select("input#josquin_catalog").node().value);
  })
;

/*
** Load the song sent in via URL or a default
*/
window.onpopstate = function(event) {
    var defaultWork = "Jos2721"
      , hash = getQueryVariables()
    ;
    work = hash.id || defaultWork;

    d3.select("input#josquin_catalog").node().value = work;
    d3.select("#load_song").node().click();
} // window.onload()
window.onpopstate();

/*
** Setup the domain
*/
setupDispatcher();


function load_song(work) {
    d3.queue()
        .defer(d3.json, jsonURL + work)
        .await(function(error, proll) {
            if(error) throw error;
            // Set the URL history to the current song
            history.pushState(null, null, '?id=' + work);

            // Parse the raw JSON and pass it to chartify.
            chartify(parseJSON(proll));
          })
    ;

    function parseJSON(proll) {
        proll.partdata.forEach(function(part) {
            part.voice = proll.partnames[part.partindex];
          })
        return proll;
    } // parseJSON()
}


function setupDispatcher() {
    createSignals();
    connectSignalsToDOM();
    connectSignalsToViz();
} // setupDispatcher()

function createSignals() {
    signal
        .on("show-notes",            notesBook.notes)
        .on("show-extremes",         notesBook.extremes)
        .on("hilite",                notesBook.hilite)
        .on("show-ribbon",           notesBook.ribbons)
        .on("separate-voices",       notesBook.separate)
        .on("zoom",                  notesBook.zoom)
        .on("measure-based-scaling", notesBook.measureScaling)
    ;
} // createSignals()

// Connect the UI control elements
function connectSignalsToDOM() {

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
          var value = choice.node().value;
          signal.call(callback, this, this.checked ? value : this.value);
        })
      ;
      choice.on("change", function() {
          signal.call(callback, this, this.value);
        })
      ;
    });

    // Respond to when the user checks/unchecks the measure scaling checkbox.
    d3.select("#measure-based-scaling")
        .on("change", function(d) {
            signal.call("measure-based-scaling", null, this.checked);
        })
    ;

    // Update the checkbox when measure based scaling gets initialized or changed.
    signal.on("measure-based-scaling.checkbox", function (d){
        d3.select("#measure-based-scaling").node().checked = d;
    });

    // Initialize measure-based-scaling to false.
    // This is required here, so that the timeTransform gets an
    // initial value before the first rendering.
    signal.call("measure-based-scaling", null, false);

} // connectSignalsToDOM()

function connectSignalsToViz() {
    notesBook.connect(signal);
    notesNav.connect(signal);
    colorLegend.connect(signal);
} // connectSignalsToViz()


function chartify(data) {

    /*
    ** 1. Connect the appropriate data
    ** 2. Activate
    */
    notesBook
        .data(data)
        .measureScalingAccessors(measureScaling(data, mensurationsLUT))
      ()
    ;

    colorLegend.data(data.partnames)();
    /*
    ** 1. Set scales and dimensions
    ** 2. Activate
    */
    notesNav
        .x(notesBook.x())
        .y(notesBook.y())
        .viewbox(notesBook.viewbox())
      ()
    ;

    // Titles and polish
    var titles = divMeta.select(".meta-titles").selectAll("*")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

    d3.selectAll("#export-svg-button")
        .on("click", function (){
          var node = d3.select(".reticle").node()
            , filename = "josquin-export-" + work + ".svg"
          ;
          new SvgSaver().asSvg(node, filename);
        });

    // Initialize measure based scaling.
    signal.call("measure-based-scaling", null, true);

} // chartify()

/// Capture URL query param
function getQueryVariables() {
    var inits = {}
      , query = window.location.search.substring(1).split("&")
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
