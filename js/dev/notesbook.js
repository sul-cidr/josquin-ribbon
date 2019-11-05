function NotesBook() {
  /*
  ** Private Variables
  */
  var data
    , svg, voices, reticle, rulers
    , width
    , height
    , viewbox
    , fullheight
    // PMB These values are duplicated in markings.js -- not good
    // Also in notescanvas.js -- though maybe not used there
    //, margin = { top: "10%", right: "5%", bottom: "5%", left: "5%" }
    , margin = { top: "0%", right: "0%", bottom: "0%", left: "0%" }
    //, percents = { left: 0, top: 15, right: 0, bottom: 5}
    , percents = { left: 0, top: 0, right: 0, bottom: 0}
    , x = d3.scaleLinear()
    , y = d3.scaleBand().round(true)
    , score  = Score()
    , ribbon = Ribbon()
    , markings = Markings()
    , lifeSize = 10 // default height and width of notes
    , scaleup = function(d) { return d * lifeSize; }
    , dispatch
    , showNotes = false
    , combineVoices = false
    , showRibbon = true
    , selectedRibbon = "attack_density_centered"
    , hideExtremes = false
  ;

  /*
  ** Main Function Object
  */
  function my() {
      if(!data) return;

      /* Build the "Aggregate" voice data */
      var combinedData = Object();
      combinedData['partindex'] = data.partcount;
      combinedData['voice'] = 'Combined';
      combinedData['notedata'] = Array();
      combinedNoteData = Array();
      for (var v in data.partdata) {
        for (var n in data.partdata[v].notedata) {
          combinedNoteData.push(data.partdata[v].notedata[n]);
        }
      }
      combinedNoteData.sort(function(a,b) { return(a.starttimesec <= b.starttimesec ? -1 : 1)});
      combinedData.notedata = combinedNoteData;
      data.partcount += 1;
      data.partnames.push("Aggregate");
      data.partdata.push(combinedData);
 
      x.domain([0, getTime.scoreLength(data)]);
      y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1))
          .padding(0.2)
      ;
      x.range(x.domain().map(scaleup));
      y.range(d3.extent(y.domain()).reverse().map(scaleup));

      width   = Math.abs(x.range()[1] - x.range()[0]);
      height  = Math.abs(y.range()[1] - y.range()[0]);
      fullheight = height * data.partcount;
      viewbox = [x.range()[0], y.range()[1], width, height];

      var sw = parseFloat(svg.style("width"))
        , sh = parseFloat(svg.style("height"))
        , w = 500, h = Math.round(w * sh / sw)
        , fw = w + margin.left + margin.right
        , fh = h + margin.top + margin.bottom
      ;
      markings
          .data(data.barlines)
          .voices(data.partnames)
          .x(x)
          .y(y)
      ;
      rulers
          .call(markings)
      ;
      reticle
          .attr("viewBox", [0, 0, width, height].join(' '))
        // Make room for the markings around
          .attr("width", (100 - percents.left - percents.right) + "%")
          .attr("height", (100 - percents.top - percents.bottom) + "%")
      ;
      voices
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height].join(' '))
      ;
      var voice = voices.selectAll(".voice")
          .data(data.partdata, function(d) { return d.partindex; })
      ;
      voice.exit()
        .remove()
      ;

      voice = voice.enter()
        .append("svg")
          .attr("class", function(d) { return "voice voice" + d.partindex; })
          .attr("preserveAspectRatio", "xMinYMid slice")
        .merge(voice)
      ;

      score
        .x(x)
        .y(y)
      ;

      voice
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", viewbox.join(' '))
          .each(function() {

              d3.select(this)
                  .call(score)
                  .call(ribbon.x(x).y(y))
              ;
            })
      ;

      my.notes(showNotes);
      my.extremes(hideExtremes);
      my.combine(combineVoices);
      my.ribbons(selectedRibbon);

      window.onresize = function(event) { markings.calibrate(); };
  } // my() - Main function object

  /*
  ** Helper Functions
  */
  function initialize_SVG() {
      // Set up the SVG nested structure:
      //   - Using %s allows the SVGs to be responsive in dimension
      //       and relative placement
      //   - The preserveAspectRatio settings cause the image to fill
      //       the viewport, distorting the image if necessary.
      svg
          .attr("class", "notesbook")
          .style("height", "100%")
          .style("width", "100%")
      ;
      rulers = svg.append("svg")
        .attr("class", "markings")
      ;
      reticle = svg
        .append("svg")
        .attr("class", "reticle music")
        .attr("preserveAspectRatio", "none")
        .attr("x", percents.left + "%")
        .attr("y", percents.top + "%" )
      ;
      voices = reticle
        .append("svg")
          .attr("class", "voices")
          .attr("id", "voices")
          .attr("preserveAspectRatio", "none")
      ;
  } // initialize_SVG()

  /*
  ** API (Getter/Setter) Functions
  */
  my.svg = function (_){
      if(!arguments.length) return svg;
      svg = _;
      initialize_SVG()
      return my;
    } // my.svg()
  ;
  my.data = function (_){
      if(!arguments.length) return data;
      data = _;
      return my;
    } // my.data()
  ;
  my.connect = function(_) {
      if(!arguments.length) return dispatch;
      dispatch = _;
      return my;
    } // my.connect()
  ;
  my.hilite = function(_) {

      // TODO move this into render function, introduce variable.
        if(!_[0])
            voices.selectAll(".subdued")
                .classed("subdued", false)
        else
            voices.selectAll("svg")
                .classed("subdued", function(d, i) { return i !== _[1]; })
            ;

      return my;
    } // my.hilite()
  ;
  my.extremes = function(_) {
      var music = voices.selectAll(".extreme-plain")
        , vis = music.style("display")
      ;

      // Argument can be null if menu was previously disabled
      if (_ === null) {
        _ = !hideExtremes;
      }

      music.style("display", _ ? "none" : "inline");
      hideExtremes = _;
    } // my.extremes()
  ;
  my.zoom = function(_) {
      var vb = reticle.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      // TODO move this into render function.
      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);
      markings.xDomain([vb[0], vb[0] + vb[2]].map(x.invert));
      reticle.attr("viewBox", vb.join(' ') );

      return my;
    } // my.zoom()
  ;
  my.combine = function(_) {
      // Art-direct the various voice SVGs
      var vb = voices.attr("viewBox").split(' ');
      vb[3] = _ ? height : fullheight;

      // TODO move this into render function.
      voices
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voice")
          .attr("y", function(d, i) { return _ ? 0 : i * height; })
      ;
      markings.separate(!_);
      combineVoices = _;
      return my;
    } // my.separate()
  ;
  my.notes = function(_) { // toggles the notes on/off

      // TODO move this into render function, introduce variable.
      var music = voices.selectAll(".notes")
        , vis = music.style("display")
      ;
      // Argument can be null if menu was previously disabled
      if (_ === null) {
        _ = vis !== "inline";
      }

      music.style("display", _ ? "inline" : "none");
      // Only display "Hide Extreme Notes" when "Show Notes" is selected
      d3.select(document.getElementById("show-notes").parentNode.nextElementSibling).style("display", _ ? "inline" : "none");

      // Toggle staff lines/labels with notes if rhythmic activity ribbon is
      // selected. Also, if no ribbon is selected, notes (and therefore)
      // staff lines/labels will be enabled.
      if (!showRibbon || selectedRibbon != "standard_deviation") {
        d3.selectAll(".refline")
          .style("display", _ ? "inline" : "none");
        ;
      }

      // If notes are turned off and no ribbon is enabled, show default/last ribbon
      if (!_ && !showRibbon && selectedRibbon) {
        my.ribbons(selectedRibbon);
      }

      showNotes = _;

      if (showRibbon && selectedRibbon == "attack_density" && !_) {
        my.ribbons("attack_density_centered");
      } else if (showRibbon && selectedRibbon == "attack_density_centered" && _) {
        my.ribbons("attack_density");
      }
    } // my.notes()
  ;

  my.ribbons = function(arg) {

      if (arg !== "all") {
        document.getElementById("show-ribbon").checked = true;
        document.getElementById("select-ribbon").setAttribute("style", "display: inline");
        if ((arg == "attack_density") || (arg == "attack_density_centered")) {
          // Don't show staves for rhythmic density ribbon if notes are off
          if (!showNotes) {
            d3.selectAll(".refline")
              .style("display", "none")
            ;
            arg = "attack_density_centered";
          } else {
            arg = "attack_density";
          }
          // Disable Combine Voices option for rhythmic density ribbon
          document.getElementById("combine-voices").checked = false;
          document.getElementById("combine-ui").setAttribute("style", "display: none");
          my.combine(false);
        } else {
          // Always show staves for melodic ribbon, enable Combine Voices opt
          d3.selectAll(".refline")
            .style("display", "inline")
          ;
          document.getElementById("combine-ui").setAttribute("style", "display: inline");
        }
        showRibbon = true;
        selectedRibbon = arg;
      } else {
        // If no ribbon is displayed, notes and staves should be enabled
        document.getElementById("show-notes").checked = true;
        showRibbon = false;
        my.notes(true);
      }
      // TODO move this into render function, introduce variable.
      voices.selectAll(".ribbon")
        .style("display", function(d) {
            return d.toLowerCase() === arg ? "inline" : "none";
          })
      ;
    } // my.ribbons()
  ;

  /*
  ** API - Getter-only Methods
  */
  my.viewbox = function() { return viewbox; };
  my.x = function() { return x; };
  my.y = function() { return y; };

  // This is always the last thing returned
  return my;
} // NotesBook()
