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
    , x = d3.scaleLinear()
    , y = d3.scaleBand().round(true)
    , score  = Score()
    , ribbon = Ribbon()
    , markings = Markings()
    , lifeSize = 10 // default height and width of notes
    , scaleup = function(d) { return d * lifeSize; }
    , dispatch
    , selectedWidth = 500
    , showNotes = false
    , combineVoices = false
    , showRibbon = true
    , selectedRibbon = "attack_density_centered"
    , highlightExtremes = false
    , panner
  ;

  /*
  ** Main Function Object
  */
  function my() {
      if(!data) return;

      x.domain([0, getTime.scoreLength(data)]);

      /* Center the Y domain around middle C, but if all of the notes are above
       * or below middle C, limit the domain to that half
       */
      var maxRangeFromMC = Math.max(Math.max(0, data.maxpitch.b7 - 28), Math.max(0, 28 - data.minpitch.b7));
      var minPitch = (data.minpitch.b7 <= 28) ? 28 - maxRangeFromMC : 28;
      var maxPitch = (data.maxpitch.b7 >= 28) ? 28 + maxRangeFromMC + 1 : 29;
      y.domain(d3.range(minPitch, maxPitch))

      x.range(x.domain().map(scaleup));
      y.range(d3.extent(y.domain()).reverse().map(scaleup));

      width   = Math.abs(x.range()[1] - x.range()[0]);
      height  = Math.abs(y.range()[1] - y.range()[0]);
      fullheight = height * data.partcount;
      viewbox = [x.range()[0], y.range()[1], width, height];

      var sw = parseFloat(svg.style("width"))
        , sh = parseFloat(svg.style("height"))
        , w = selectedWidth, h = Math.round(w * sh / sw)
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
          .attr("viewBox", [0, 0, width, sh].join(' '))
          .attr("height", sh)
      ;
      voices
          .attr("width", width)
          .attr("height", sh)
          .attr("viewBox", [0, 0, width, sh].join(' '))
      ;
      var voice = voices.selectAll(".voice")
          .data(data.partdata, function(d) { return d.partindex; })
      ;
      voice.exit()
        .remove()
      ;
      voice = voice.enter()
        .append("svg")
          .attr("class", function(d) { return "voice voice" + d.partindex + " " + d.voice; })
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
          .style("overflow", "visible")
          .attr("viewBox", viewbox.join(' '))
          .each(function() {

              d3.select(this)
                  .call(ribbon.x(x).y(y))
                  .call(score)
              ;
            })
      ;

      panner
        .attr("height", "100%")
        .attr("width", "100%")
      ;

      panner.on("wheel.zoom", wheeled);

      my.notes(showNotes);
      my.extremes(highlightExtremes);
      my.combine(combineVoices);
      my.ribbons(selectedRibbon);
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
      ;
      rulers = svg.append("svg")
        .attr("class", "markings")
      ;
      reticle = svg
        .append("svg")
        .attr("class", "reticle music")
        .attr("preserveAspectRatio", "none")
      ;
      voices = reticle
        .append("svg")
          .attr("class", "voices")
          .attr("id", "voices")
          .attr("preserveAspectRatio", "none")
      ;
      panner = svg.append("rect")
        .attr("class", "panner")
        .attr("preserveAspectRatio", "none")
      ;
  } // initialize_SVG()
  
  wheeled = function() {
      if (d3.event) {
        let event = d3.event,
          dx = Math.abs(event.deltaX),
          dy = Math.abs(event.deltaY);
        if (dx > dy) {
          my.pan(parseInt(event.deltaX));
          event.preventDefault && event.preventDefault();
        }
      } 
    }
  ;

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
      var ribbon = voices.select("."+_[0]);
      ribbon.classed("subdued", !ribbon.classed("subdued"));
      return my;
    } // my.hilite()
  ;
  my.extremes = function(_) {
      voices.selectAll(".extreme-plain").classed("extreme", _);
      highlightExtremes = _;

      // If all notes are hidden, then hide extreme-plain notes as well
      if (!showNotes && !highlightExtremes) {
        voices.selectAll(".note").style("display", "none");
        if (selectedRibbon != "standard_deviation") {
          // And hide the staff lines unless the melodic ribbon is shown
          d3.selectAll(".refline").style("display", "none");
        }
        // Enable the selected ribbon if all notes are hidden
        my.toggleRibbons(true);
        my.ribbons(selectedRibbon);
      } else {
        d3.selectAll(".refline").style("display", "inline");
        if (highlightExtremes) {
          voices.selectAll(".extreme-plain").style("display", "inline");
        }
      }
    } // my.extremes()
  ;
  my.zoom = function(_) {
      var vb = reticle.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      // TODO move this into render function.
      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);
      selectedWidth = vb[2];
      markings.xDomain([vb[0], vb[0] + vb[2]].map(x.invert));
      reticle.attr("viewBox", vb.join(' ') );

      return my;
    } // my.zoom()
  ;
  my.pan = function(_) {
      var vb = reticle.attr("viewBox").split(' ').map( Number )
        , leftEdge = vb[0]
        , windowLength = vb[2]
      ;
      if(!arguments.length) return vb;
      if(leftEdge + windowLength + _ >= width) {
        leftEdge = width - selectedWidth;
      } else if(leftEdge + _ < 0) {
        leftEdge = 0;
      } else {
        leftEdge += _;
      }
      my.zoom([leftEdge, leftEdge + selectedWidth]);
      if(dispatch) { dispatch.call("pan", this, [leftEdge, leftEdge + selectedWidth]); }
      return my;
    }  // my.pan()
  ;
  my.combine = function(_) {
      // Art-direct the various voice SVGs
      var vb = voices.attr("viewBox").split(' ');
      vb[3] = _ ? height : fullheight;

      // TODO move this into render function.
      if (_) voices.select(".Aggregate").attr("y", fullheight);
      voices
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(_ ? ".voice:not(.Aggregate)" : ".voice")
          .attr("y", function(d, i) { return _ ? 0 : i * height; })
      ;
      document.querySelector('#legend > ul > li:last-child').style.display = _ ? "none" : "inline-block";
      markings.separate(!_);
      combineVoices = _;
      return my;
    } // my.separate()
  ;
  my.notes = function(_) { // toggles the notes on/off

      // TODO move this into render function, introduce variable.
      var music = voices.selectAll(".note")
        , extremes = voices.selectAll(".extreme-plain")
        , vis = music.style("display")
      ;

      // Argument can be null if menu was previously disabled
      if (_ === null) {
        _ = vis !== "inline";
      }

      document.getElementById("show-notes").checked = _;

      music.style("display", _ ? "inline" : "none");

      extremes.style("display", (_ || highlightExtremes) ? "inline" : "none");
      
      // Toggle staff lines/labels with notes if rhythmic activity ribbon is
      // selected. Also, if no ribbon is selected, notes (and therefore)
      // staff lines/labels will be enabled.

      showNotes = _;

      d3.selectAll(".refline")
        .style("display", (showNotes || highlightExtremes) ? "inline" : "none")
      ;

      var ribbonSelect = document.getElementById("select-ribbon"),
          centerRibbonsCheckbox = document.getElementById("center-ribbons");
      centerRibbonsCheckbox.disabled = (
        !showRibbon || 
        ribbonSelect.value != 'attack_density' || 
        (!showNotes && !highlightExtremes)
      );
      centerRibbonsCheckbox.parentElement.classList.toggle("disabled", centerRibbonsCheckbox.disabled)

      // Notes are always enabled when ribbon is hidden or when the melodic
      // ribbon is shown, so make sure the staves are also displayed.
      if (!showRibbon || selectedRibbon == "standard_deviation") {
        d3.selectAll(".refline")
          .style("display", "inline")
        ;
      }

      // Show the ribbon if notes are being hidden
      if (!_ && !showRibbon && !highlightExtremes) {
        my.toggleRibbons(true);
        my.ribbons(selectedRibbon);
      // Attack density ribbon is "centered" on middle C when notes are hidden
      } else if (showRibbon && selectedRibbon == "attack_density" && !_) {
        my.ribbons("attack_density_centered");
      // Attack density ribbon aligns with notes when they are shown
      } else if (showRibbon && selectedRibbon == "attack_density_centered" && _) {
        my.ribbons("attack_density");
      }

    } // my.notes()
  ;
  my.toggleRibbons = function(_) {
      var combineVoicesCheckbox = document.getElementById("combine-voices"),
          ribbonSelect = document.getElementById("select-ribbon"),
          centerRibbonsCheckbox = document.getElementById("center-ribbons");
      showRibbon = _;
      document.getElementById("show-ribbon").checked = showRibbon;
      ribbonSelect.disabled = !showRibbon;
      centerRibbonsCheckbox.disabled = (
        !showRibbon || 
        ribbonSelect.value != 'attack_density' || 
        !showNotes || 
        combineVoicesCheckbox.checked
      );
      centerRibbonsCheckbox.parentElement.classList.toggle("disabled", centerRibbonsCheckbox.disabled)

      if (showRibbon) {
        my.ribbons(selectedRibbon);
      } else {
        voices.selectAll(".ribbon")
          .style("display", "none");
        // Always show notes if ribbons are hidden
        // but don't bother if extreme notes are already shown
        if (!highlightExtremes) {
          my.notes(true);
        }
        combineVoicesCheckbox.disabled = false;
        combineVoicesCheckbox.parentElement.classList.remove("disabled");
      }

    } // my.toggleRibbons()
  ;
  my.ribbons = function(arg) {

      var combineVoicesCheckbox = document.getElementById("combine-voices");
      var centerRibbonsCheckbox = document.getElementById("center-ribbons");
      if ((arg == "attack_density") || (arg == "attack_density_centered")) {
        // Don't show staves for rhythmic density ribbon if notes are off
        if (!showNotes) {
          d3.selectAll(".refline")
            .style("display", "none")
          ;
          arg = "attack_density_centered";
        } else {
          d3.selectAll(".refline")
            .style("display", "inline")
          ;
          arg = (document.getElementById("center-ribbons").checked) ? "attack_density" : "attack_density_centered";
        }
        // Disable Combine Voices option for rhythmic density ribbon
        combineVoicesCheckbox.checked = false;
        combineVoicesCheckbox.disabled = true;
        combineVoicesCheckbox.parentElement.classList.add("disabled");

        centerRibbonsCheckbox.disabled = !showNotes;
        centerRibbonsCheckbox.parentElement.classList.toggle("disabled", centerRibbonsCheckbox.disabled) 

        my.combine(false);
      } else {
        // Always show staves for melodic ribbon, enable Combine Voices opt
        d3.selectAll(".refline")
          .style("display", "inline")
        ;
        combineVoicesCheckbox.disabled = false;
        combineVoicesCheckbox.parentElement.classList.remove("disabled");
        centerRibbonsCheckbox.disabled = true;
        centerRibbonsCheckbox.parentElement.classList.toggle("disabled", centerRibbonsCheckbox.disabled) 
      }    

      // TODO move this into render function, introduce variable.
      voices.selectAll(".ribbon")
        .style("display", function(d) {
          return (d.toLowerCase() === arg) && showRibbon ? "inline" : "none";
        })
      ;

      selectedRibbon = arg;

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
