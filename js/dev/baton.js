/* global d3, NotesBook, NotesNav, ColorLegend, SvgSaver */
/* global prettifyXml, cleanSvg, addSvgPadding, processSymbols, safariNamespaceFix */
/* exported voicesHaxisOffset */

var notesBook = NotesBook().svg(d3.select("#notesbook").select("svg"))
  , notesNav = NotesNav().svg(d3.select("#navigator").select("svg"))
  , colorLegend = ColorLegend().div(d3.select("#legend"))
  , currentScore
  , aggregateVoice
  , currentWork // the currently displayed song
  ;

  /*
  ** Visualization's signaling system
  */
  var signal = d3.dispatch(
          // List of signals we accept
          "hilite"
          , "zoom"
          , "combine-voices"
          , "selected"
          , "show-extremes"
          , "select-ribbon"
          , "show-ribbon"
          , "show-notes"
        )
  ;

/*
** Where to find individual songs and the list of songs
*/
var baseURL = 'https://josquin.stanford.edu/cgi-bin/jrp?'
  , catURL = baseURL + 'a=list'
  , jsonURL = baseURL + 'a=proll-json&f='
;
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
** Enter key triggers load on chooser widget
*/
document.querySelector("#josquin_catalog").addEventListener("input", function() {
  if (document.querySelector("#catalog option[value='" + this.value + "']"))
    load_song(this.value);
})



/*
** Setup the domain
*/
setupDispatcher();


function load_song(work) {
    d3.queue()
        .defer(d3.json, jsonURL + work)
        .await(function(error, proll) {
            if(error) {
               console.log("Problem downloading", jsonURL + work);
               throw error;
            }
            // Set the URL history to the current song
            history.pushState(null, null, '?id=' + work);

            currentWork = work;

            // Parse the raw JSON and pass it to chartify.
            currentScore = parseJSON(proll);
            chartify();
          })
    ;

    function parseJSON(proll) {
        proll.partdata.forEach(function(part) {
            part.voice = proll.partnames[part.partindex];
          })

        /* Build the "Aggregate" voice data */
        var combinedData = Object();
        combinedData['partindex'] = proll.partcount;
        combinedData['voice'] = 'Aggregate';
        combinedData['notedata'] = Array();
        combinedNoteData = Array();
        for (var v in proll.partdata) {
          for (var n in proll.partdata[v].notedata) {
            combinedNoteData.push(proll.partdata[v].notedata[n]);
          }
        }
        combinedNoteData.sort(function(a,b) { return(a.starttimesec <= b.starttimesec ? -1 : 1)});
        combinedData.notedata = combinedNoteData;

        proll.partcount = proll.partcount + 1;
        proll.partnames.push("Aggregate");
        proll.partdata.push(combinedData);

        return proll;

    } // parseJSON()
}


function setupDispatcher() {
    createSignals();
    connectSignalsToDOM();
    connectSignalsToViz();
} // setupDispatcher()

function createSignals() {

    // Pass each event into notesBook via accessors.
    signal
        .on("show-notes",      notesBook.notes)
        .on("show-extremes",   notesBook.extremes)
        .on("hilite",          notesBook.hilite)
        .on("show-ribbon",     notesBook.toggleRibbons)
        .on("select-ribbon",   notesBook.ribbons)
        .on("combine-voices",  notesBook.combine)
        .on("zoom",            notesBook.zoom)
    ;

    // Update the duration indicator on zoom.
    signal.on("zoom.durationIndicator", function (extent){
        var duration = (extent[1] - extent[0]) / 10;
        var message = duration + " seconds selected";
        d3.select("#zoomed-duration-indicator").text(message);
    });
} // createSignals()

// Connect the UI control elements
function connectSignalsToDOM() {

    // Combine/Separate Voices
    d3.select("#combine-ui").selectAll("input")
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
      ;

      check.on("change", function(d) {
          choice.style("display", this.checked ? null : "none");
          signal.call("show-ribbon", this, this.checked);
        })
      ;
      choice.on("change", function() {
          signal.call("select-ribbon", this, this.value);
        })
      ;
    });
} // connectSignalsToDOM()

function connectSignalsToViz() {
    notesBook.connect(signal);
    notesNav.connect(signal);
    colorLegend.connect(signal);
} // connectSignalsToViz()


function chartify() {
    if (!currentScore) return;
    var data = currentScore;

    /*
    ** 1. Connect the appropriate data
    ** 2. Activate
    */
    colorLegend.data(data.partnames)();
    notesBook.data(data)();

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
    var titles = d3.select(".meta-titles").selectAll("*")
        .data(data.filename.split(".krn")[0].split('-').reverse())
    ;
    titles.text(function(d) { return d.split('_').join(' '); });

    d3.selectAll("#export-svg-button")
        .on("click", function (){
          var node = d3.select(".notesbook").node()
            , filename = "josquin-export-" + currentWork + ".svg"
          ;
          new SvgSaver().asSvgAlt(node, filename, function(clonedSvg) {
            addSvgPadding(clonedSvg, 25, 50);
            processSymbols(clonedSvg);
            cleanSvg(clonedSvg);
            var serializedSvg = prettifyXml(clonedSvg.outerHTML);
            serializedSvg = safariNamespaceFix(serializedSvg);
            return serializedSvg;
          });
        });
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

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

window.addEventListener("resize", debounce(chartify, 250));
