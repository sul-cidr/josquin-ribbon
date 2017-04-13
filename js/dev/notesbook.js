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
    , margin = { top: "10%", right: "5%", bottom: "5%", left: "5%" }
    , percents = { left: 5, top: 15, right: 5, bottom: 5 }
    , x = d3.scaleLinear()
    , y = d3.scaleBand()
    , score  = Score()
    , ribbon = Ribbon()
    , markings = Markings()
    , lifeSize = 10 // default height and width of notes
    , scaleup = function(d) { return d * lifeSize; }
    , separate = false // store the separation state
    , hilite = {}
    , display = { notes: true, ribbons: false}
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my() {
      x.domain([0, data.scorelength[0]]);
      x.range(x.domain().map(scaleup));
      y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1))
          .padding(0.2)
      ;
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
      voice
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", viewbox.join(' '))
          .each(function() {
              d3.select(this)
                  .call(score.x(x).y(y).defs(defs))
                  .call(ribbon.x(x).y(y))
              // Initially, don't show the ribbons
                .selectAll(".ribbon")
                    .style("display", "none")
              ;
            })
      ;
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
        .style("width", "100%")
        .style("height", "100%")
      ;
      reticle = svg
        .append("svg")
        .attr("class", "reticle music")
        .attr("preserveAspectRatio", "none")
        .attr("x", percents.left + "%")
        .attr("y", percents.top + "%" )
      ;
      defs = reticle
        .append("defs")
      ;
      // Create a space for the note rectangles of various time durations
      defs.append("g").attr("id", "notestamps");

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
      if(!arguments.length) return [hilite.voice, hilite.index];
      hilite.voice = _[0];
      hilite.index = _[1];
      voices.selectAll("svg")
          .classed("subdued", hilite.voice &&
              function(d, i) { return i !== hilite.index; })
      ;
      return my;
    } // my.hilite()
  ;
  my.extremes = function() {
      var xtrms = voices.selectAll(".extreme").empty();
      voices.selectAll(".extreme-plain")
          .classed("extreme", xtrms)
      ;
      return my;
    } // my.extremes()
  ;
  my.zoom = function(_) {
      var vb = reticle.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);
      markings.xDomain([vb[0], vb[0] + vb[2]].map(x.invert));

      reticle.attr("viewBox", vb.join(' '));

      return my;
    } // my.zoom()
  ;
  my.separate = function(_) {
      if(!arguments.length) return separate;
      separate = _ ? true : false;

      // Art-direct the various voice SVGs
      var vb = voices.attr("viewBox").split(' ');
      vb[3] = separate ? fullheight : height;

      markings.separate(separate); // set this one off
      voices
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voice")
          .attr("y", function(d, i) { return separate ? i * height : 0; })
      ;
      return my;
    } // my.separate()
  ;
  my.notes = function(_) { // toggles the notes on/off
      if(!arguments.length) return display.notes;
      var music = voices.selectAll(".notes")
        , vis = music.style("display")
      ;
      display.notes = vis === "inline" ? "none" : "inline";
      music.style("display", display.notes);
    } // my.notes()
  ;
  my.ribbons = function(_) {
      if(!arguments.length) return display.ribbons;
      display.ribbons = _;
      voices.selectAll(".ribbon")
          .style("display", function(d) {
              return d.toLowerCase() === display.ribbons ? "inline" : "none";
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
