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
    , separate = false
    , hilite = false
    , zoom = false // indicates an active brush
    , showExtremeNotes = false
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
                          .showExtremeNotes(showExtremeNotes)
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
          ;
          if(hilite) {
              if(c.key === hilite) matched = i; // only change if this is a match
              if(separate && matched !== i) { // not the hilited one
                  h = 0;
                  transform = matched === -1 ? 0 : height;
              }
          } else { // if no hilite
              if(separate) {
                  h = scale.voice.bandwidth();
                  transform = scale.voice(c.key);
              }
          }
          c.canvas
              .height(h)
              .zoom((separate && hilite) ? zoom : zoom || domain)
              .state((hilite === c.key) || !hilite)
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
      zoom = value;
      zoom.x = zoom.x || domain.x;
      zoom.y = zoom.y || domain.y;

      if(separate && hilite)
          zoom.y = null;

      canvases.forEach(function(c) { c.canvas.zoom(zoom).snap(); });

      return my;
    } // my.zoom()
  ;
  my.hilite = function(value) {
      hilite = (value && value.emphasize) || false;
      update();

      return my;
    } // my.hilite()
  ;
  my.separate = function(value) {
      if(!arguments.length) return separate;

      separate = value || false;
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
      if(!arguments.length)
          return showExtremeNotes;
      else {
          showExtremeNotes = value;
          canvases.forEach(function(c) {
              c.canvas.showExtremeNotes(value);
          });
      }
      return my;
    } // my.showExtremeNotes()
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
