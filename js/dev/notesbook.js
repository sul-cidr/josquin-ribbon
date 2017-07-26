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
    , percents = { left: 5, top: 15, right: 5, bottom: 5}
    , x = d3.scaleLinear()
    , y = d3.scaleBand().round(true)
    , score  = Score()
    , ribbon = Ribbon()
    , markings = Markings()
    , lifeSize = 10 // default height and width of notes
    , scaleup = function (d){ return d * lifeSize; }
    , dispatch
    , rawAccessors = {
          timeTransform: function (d){
              return d;
          }
        , startTime: function (d){
              return +d.starttime[0];
          }
        , duration: function (d){
              return +d.duration[0];
          }
        , scoreLength: function (){
              return data.scorelength[0];
          }
      }
    , measureScalingAccessors
    , startTimeAccessor = rawAccessors.startTime
    , durationAccessor = rawAccessors.duration
    , timeTransform = rawAccessors.timeTransform
    , zoom
    , show = {
            extremes: false
          , notes: true
          , ribbons: false
        }
  ;

  /*
  ** Main Function Object
  */
  function my() {
      if(!data) return;

      setXScale();
      reWidthFromData();
      setYScale();
      reHeightFromData();
      updateViewbox();

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

      // Default to being zoomed out completely.
      var reticleViewbox = [0, 0, width, height];

      // If a zoom has been set in response to brushing,
      // set the viewBox accordingly.
      if (zoom) {
        reticleViewbox[0] = zoom[0];
        reticleViewbox[2] = Math.abs(zoom[1] - zoom[0]);
      }

      reticle
          .attr("viewBox", reticleViewbox.join(' '))
        // Make room for the markings around
          .attr("width", (100 - percents.left - percents.right) + "%")
          .attr("height", (100 - percents.top - percents.bottom) + "%")
      ;
      voices
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", reticleViewbox.join(' '))
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
        .startTimeAccessor(startTimeAccessor)
        .durationAccessor(durationAccessor)
      ;

      voice
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", viewbox.join(' '))
          .each(function() {

              d3.select(this)
                  .call(score)
                  .call(ribbon.x(x).y(y))
              // Initially, don't show the ribbons
                .selectAll(".ribbon")
                  .style("display", "none")
              ;
            })
      ;
      toggleNotes(); // preserve show/hide of notes
      extremify(); // preserve state of highlighting extreme notes
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

  function setXScale() {
    if(!data) return;

    // TODO take into account the zoom state here.
    x.domain([0, rawAccessors.scoreLength()]);
    x.range(x.domain().map(scaleup));
  } // setXScale()

  function setYScale() {
      if(!data) return;
      y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1))
          .padding(0.2)
      ;
      y.range(d3.extent(y.domain()).reverse().map(scaleup));
  } // setYScale()

  function reWidthFromData() {
      if(!data) return;
      width   = Math.abs(x.range()[1] - x.range()[0]);
  } // reWidthFromData()

  function reHeightFromData() {
      if(!data) return;
      height  = Math.abs(y.range()[1] - y.range()[0]);
      fullheight = height * data.partcount;
  } // reHeightFromData()

  function updateViewbox() {
      viewbox = [x.range()[0], y.range()[1], width, height];
      reticle
        .transition(d3.transition())
          .attr("viewBox", [0, 0, width, height].join(' '))
      ;
  } // updateViewbox()

  function extremify() {
      voices.selectAll(".extreme-plain")
          .classed("extreme", show.extremes)
      ;
  } // extremify()

  function toggleNotes() {
      voices.selectAll(".notes")
          .style("display", show.notes === "inline" ? "none" : "inline")
      ;
  } // toggleNotes()

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
  my.measureScalingAccessors = function (_){
      if(!arguments.length) return measureScalingAccessors;
      measureScalingAccessors = _;
      return my;
    } // my.measureScalingAccessors()
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
      if(!arguments.length) return show.extremes;

      show.extremes = voices.selectAll(".extreme").empty();

      extremify();
      return my;
    } // my.extremes()
  ;

  // Setter only (never used as getter).
  my.zoom = function(_) {
      zoom = _
      markings.xDomain(zoom.map(x.invert));
      return my;
    } // my.zoom()
  ;
  my.separate = function(_) {
      // Art-direct the various voice SVGs
      var vb = voices.attr("viewBox").split(' ');
      vb[3] = _ ? fullheight : height;

      // TODO move this into render function.
      voices
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voice")
          .attr("y", function(d, i) { return _ ? i * height : 0; })
      ;
      markings.separate(_);
      return my;
    } // my.separate()
  ;
  my.notes = function() { // toggles the notes on/off
      show.notes = voices.selectAll(".notes").style("display");
      toggleNotes()
      return my;
    } // my.notes()
  ;
  my.ribbons = function(arg) {

      // TODO move this into render function, introduce variable.
      voices.selectAll(".ribbon")
          .style("display", function(d) {
              return d.toLowerCase() === arg ? "inline" : "none";
            })
      ;
    } // my.ribbons()
  ;
  // Setter only, accepts a boolean value.
  // Toggles the measure-based scaling on/off.
  my.measureScaling = function(_) {
      var accessors = _ ? measureScalingAccessors : rawAccessors;
      startTimeAccessor = accessors.startTime;
      durationAccessor = accessors.duration;
      markings.timeTransform(accessors.timeTransform);
      ribbon.timeTransform(accessors.timeTransform);
      my();
    } // my.measureScaling()
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
