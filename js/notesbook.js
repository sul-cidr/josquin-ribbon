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
      domain.y = [data.minpitch.b7, data.maxpitch.b7];

      svg.selectAll(".notes-g")
          .data(data.notes.entries())
        .enter().append("g")
          .each(function(d) {
              var self = d3.select(this);
              canvases
                  .push({
                        key: d.key
                      , canvas: NotesCanvas().colorScale(scale.color)
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
  function emphasize() {
      canvases.forEach(function(c) {
          if(hilite) {
              if(hilite === c.key) c.canvas.on();
              else c.canvas.off();
          } else {
              c.canvas.on();
          }
        })
      ;
  } // emphasize()

  function update() {
      var transforms = { true: 0, false: 0 }
        , h = (separate && !hilite)
              ? scale.voice.bandwidth() // separated and un-highlighted
              : height
      ;
      canvases.forEach(function(c) {
          transforms.true = scale.voice(c.key);

          c.canvas.height(h);
          if(separate && hilite)
              c.canvas.zoom();
          else
              c.canvas.zoom(domain);
          if(!separate)
              c.canvas.snap(domain);

          emphasize();

          c.canvas.update();

          c.selection
            .transition()
              .attr("transform", "translate(0," +  transforms[separate] + ")")
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
  my.width = function(value) {
      if(arguments.length === 0) return width;

      width = value;

      return my;
    } // my.width()
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
          c.canvas.snap(value);
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
      if(!arguments.length)
          return canvases.map(function(c) { return c.canvas.zoom(); });
      value.y = value.y || domain.y;

      canvases.forEach(function(c) {
          c.canvas.snap(value);
      });
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
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
