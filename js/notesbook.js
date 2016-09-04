function NotesBook() {
  /*
  ** Private Variables
  */
  var svg
    , data
    , width
    , height
    , margin = { top: 20, right: 20, bottom: 20, left: 20 }
    , scale = { color: null, voice: d3.scaleBand(), barlines: d3.scaleLinear() }
    , domain = { x: [], y: [] } // Store the aggregate domains for all strips
    , tooltip = d3.tip()
          .attr("class", "d3-tip")
          .html(function(d) { return d.note; })
    , canvases = []
    , display = {
          separate: false // show each note strip separately
          , hilite:   false // one set of notes is visible
          , zoom:     false // indicates an active brush
          , extremes: false // hilite the maximum and minimum pitches
        }
    , axis = d3.axisTop()
    , barlines
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my(selection) {
      svg = selection
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      ;
      data = svg.datum();

      domain.x = [0, data.scorelength[0]];
      domain.y = [data.minpitch.b7 - 1, data.maxpitch.b7];

      height = height - margin.top - margin.bottom;
      width = width - margin.left - margin.right;

      scale.voice
          .domain(data.partnames)
          .rangeRound([0, height])
      ;
      scale.barlines
          .domain(domain.x)
          .range([0, width])
      ;
      var bars = data.barlines.map(function(b) { return b.time[0]; });
      axis
          .scale(scale.barlines)
          .tickValues(bars)
      ;
      barlines = svg
        .append("g")
          .attr("class", "barlines")
          .call(axis)
      ;
      svg
        .append("g")
          .attr("class", "notesbook")
        .selectAll(".notes-g")
          .data(data.notes.entries())
        .enter().append("g")
          .each(function(d) {
              var self = d3.select(this).call(tooltip);
              canvases
                  .push({
                        key: d.key
                      , canvas: NotesCanvas()
                          .colorScale(scale.color)
                          .extremes(display.extremes)
                          .tooltip(tooltip)
                          .width(width)
                          .height(height)
                      , selection: self
                    })
              ;
              self
                  .call(canvases[canvases.length - 1].canvas)
              ;
            })
      ;
  } // my() - Main function object

  /*
  ** Helper Functions
  */
  function update() {
      var matched = -1;
      canvases.forEach(function(c, i) {
          var transform = 0
            , h = height
            , z = display.zoom || domain
          ;
          if(display.hilite) {
              // only change if this is a match
              matched = (c.key === display.hilite) ? i : matched;
              if(display.separate) {
                  if(matched !== i) { // we're not the matched one
                      h = 0;
                      transform = (matched === -1)
                        ? 0      // above the yet to be found matched frame,
                        : height // or below the already found one
                      ;
                  }
              }
          } else { // if no hilite
              if(display.separate) {
                  h = scale.voice.bandwidth();
                  transform = scale.voice(c.key);
              }
          }
          c.canvas
              .height(h)
              .zoom(z)
              .state((display.hilite === c.key) || !display.hilite)
              .update()
          ;
          c.selection
            .transition()
              .attr("transform", "translate(0," + transform + ")")
          ;
        })
      ;
      axis
          .scale(scale.barlines)
          .tickValues(data.barlines.map(function(b) { return b.time[0]; }))
      ;
      barlines.call(axis);
  } // update()

  /*
  ** API (Getter/Setter) Functions
  */
  my.colorScale = function(value) {
      if(arguments.length === 0) return scale.color;
      scale.color = value;

      return my;
    } // my.colorScale()
  ;
  my.width = function(value) {
      if(arguments.length === 0) return width;

      width = value;

      return my;
    } // my.width()
  ;
  my.height = function(value) {
      if(arguments.length === 0) return height;

      height = value;
      scale.voice.rangeRound([0, height]);
      axis.tickSize(-height);

      return my;
    } // my.height()
  ;
  my.full = function(value) {
      if(!arguments.length) return scale;

      canvases.forEach(function(c) {
          c.canvas.zoom(value).snap();
      });

      return my;
    } // my.full()
  ;
  my.margin = function(value) {
      if(!arguments.length) return margin;

      return my;
    } // my.margin()
  ;
  my.connect = function(value) {
      if(!arguments.length) return dispatch;

      dispatch = value;
      return my;
    } // my.connect()
  ;
  my.zoom = function(value) {
      display.zoom = value;
      display.zoom.x = display.zoom.x || domain.x;
      display.zoom.y = display.zoom.y || domain.y;
      barlines.call(axis.scale(scale.barlines.domain(display.zoom.x)));

      if(display.separate && display.hilite)
          display.zoom.y = null;

      canvases.forEach(function(c) { c.canvas.zoom(display.zoom).snap(); });

      return my;
    } // my.zoom()
  ;
  my.hilite = function(value) {
      display.hilite = (value && value.emphasize) || false;
      update();

      return my;
    } // my.hilite()
  ;
  my.separate = function(value) {
      if(!arguments.length) return display.separate;

      display.separate = value || false;
      update();

      return my;
    } // my.separate()
  ;
  my.reset = function() {
      canvases.forEach(function(c) {
          c.canvas.reset();
      });
      return my;
    } // my.reset()
  my.extremes = function(value) {
      if(!arguments.length) return display.extremes;

      display.extremes = value;
      canvases.forEach(function(c) {
          c.canvas.extremes(value);
      });

      return my;
    } // my.extremes()
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
