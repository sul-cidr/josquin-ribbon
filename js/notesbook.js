function NotesBook() {
  /*
  ** Private Variables
  */
  var svg, data
    , width
    , height
    , scale = { color: null, voice: d3.scaleBand()  }
    , domain = { x: [], y: [] } // Store the aggregate domains for all strips
    , dispatch
    , tooltip
    , canvases = []
    , display = {
          separate: false // show each note strip separately
          , hilite:   false // one set of notes is visible
          , zoom:     false // indicates an active brush
          , extremes: false // hilite the maximum and minimum pitches
        }
  ;

  /*
  ** Main Function Object
  */
  function my(selection) {
      svg = selection.call(tooltip);
      data = svg.datum();

      scale.voice
          .domain(data.partnames)
          .rangeRound([0, height])
      ;
      domain.x = [0, data.scorelength[0]];
      domain.y = [data.minpitch.b7 - 1, data.maxpitch.b7];

      svg.selectAll(".notes-g")
          .data(data.notes.entries())
        .enter().append("g")
          .each(function(d) {
              var self = d3.select(this);
              canvases
                  .push({
                        key: d.key
                      , canvas: NotesCanvas()
                          .colorScale(scale.color)
                          .showExtremeNotes(display.extremes)
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
  } // update()

  /*
  ** API (Getter/Setter) Functions
  */
  my.tooltip = function(value) {
      if(!arguments.length) return tooltip;

      tooltip = value;
      return my;
    } // my.tooltip()
  ;
  my.colorScale = function(value) {
      if(arguments.length === 0) return scale.color;
      scale.color = value;

      return my;
    } // my.colorScale()
  ;
  my.height = function(value) {
      if(arguments.length === 0) return height;

      height = value;

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
  my.showExtremeNotes = function(value) {
      if(!arguments.length) return display.extremes;

      display.extremes = value;
      canvases.forEach(function(c) {
          c.canvas.showExtremeNotes(value);
      });

      return my;
    } // my.showExtremeNotes()
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
