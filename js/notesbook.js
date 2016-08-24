function NotesBook() {
  /*
  ** Private Variables
  */
  var svg
    , width
    , height
    , x = d3.scale.linear()
    , y = d3.scale.ordinal()
    , dispatch
    , tooltip
  ;

  /*
  ** Main Function Object
  */
  function my(selection) {
      svg = selection;
      console.log(svg.data())
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
  my.colorScale = function (value){
      if(arguments.length === 0) return colorScale;
      colorScale = value;
      return my;
    } // my.colorScale()
  ;
  my.width = function (value){
      if(arguments.length === 0) return width;
      width = value;
      return my;
    } // my.width()
  ;
  my.height = function (value){
      if(arguments.length === 0) return height;
      height = value;
      return my;
    } // my.height()
  ;
  my.connect = function(value) {
      if(!arguments.length) return dispatch;

      dispatch = value;
      return my;
    } // my.connect()
  ;
  my.zoom = function(value) {
      if(!arguments.length) return zoom;

      return my;
    } // my.zoom()
  ;
  // This is always the last thing returned
  return my;
} // NotesBook()
