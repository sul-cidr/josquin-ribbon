function Score() {
  /*
  ** Private Variables - only used inside this object
  */
  // Standard variables
  var svg
    , data
    , width
    , height
    , x // scale for global domain
    , y // scale for global domain
    , xExtent // local domain
    , yExtent // local domain
    , margin = { top: 10, bottom: 10, left: 0, right: 0 }
    , tooltip
    , dispatch
  ;
  /*
  ** Main Function Object
  */
  function my(selection) {
      data = selection.datum();
      console.log(data);
      xExtent = [
            d3.min(data, function(d) { return d.time; })
          , d3.max(data, function(d) { return d.time + d.duration; })
        ]
      ;
      yExtent = d3.extent(data.map(function(d) { return d.pitch; }));

      console.log(xExtent, yExtent);

      var rects = selection.selectAll("rect")
              .data(function(d) { return d; })
      ;
      rects
        .enter().append("rect")
          .attr("class", "note")
      ;
      rects.exit().remove();

      console.log(rects);
      // computeExtremeNotes();
      // enableTooltips();
  } // my()

  /*
  ** Helper Functions
  */

  /*
  ** API - Getter/Setter Fynctions
  */
  my.x = function(_) {
      if(!arguments.length) return x;
      x = _;
      return my;
    } // my.x()
  ;
  my.y = function(_) {
      if(!arguments.length) return y;
      y = _;
      return my;
    } // my.y()
  ;
  // This is ALWAYS the last thing returned
  return my;
} // Score()
