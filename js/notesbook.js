function NotesBook() {
  /*
  ** Private Variables
  */
  var svg, data
    , width
    , height
    , perspectives = ["full", "zoom"]
    , scale = {
          full: { x: d3.scale.linear(), y: d3.scale.linear() }
        , zoom: { x: d3.scale.linear(), y: d3.scale.linear() }
      }
    , colorScale
    , dispatch
    , tooltip
    , canvases = []
  ;

  /*
  ** Main Function Object
  */
  function my(selection) {
      svg = selection;
      data = svg.datum();
      svg.selectAll(".notes-g")
          .data(data)
        .enter().append("g")
          .each(function(d) {
              canvases.push({
                    key: d.key
                  , canvas: NotesCanvas().colorScale(colorScale)
              });
              d3.select(this)
                  .call(canvases[canvases.length - 1].canvas)
              ;
            })
      ;
  } // my() - Main function object

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
      if(arguments.length === 0) return colorScale;
      colorScale = value;
      return my;
    } // my.colorScale()
  ;
  my.width = function(value) {
      if(arguments.length === 0) return width;

      width = value;
      perspectives.forEach(function(p) {
          scale[p].x.range([0, width]);
      });

      return my;
    } // my.width()
  ;
  my.height = function(value) {
      if(arguments.length === 0) return height;

      height = value;
      perspectives.forEach(function(p) {
          scale[p].y.range([height, 0]);
      });

      return my;
    } // my.height()
  ;
  my.full = function(value) {
      if(!arguments.length) return scale.full;

      if(value[0])
          scale.full.x.domain(value[0]);
      if(value[1])
          scale.full.y.domain(value[1]);

      canvases.forEach(function(c) {
          c.canvas.zoom(value);
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
  my.zoom = function(value, stop) {
      if(!arguments.length) return zoom;

      canvases.forEach(function(c) {
          c.canvas.zoom(value, stop);
      });
      return my;
    } // my.zoom()
  ;
  // This is always the last thing returned
  return my;
} // NotesBook()
