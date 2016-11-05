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

      xExtent = [
            d3.min(data, function(d) { return d.time; })
          , d3.max(data, function(d) { return d.time + d.duration; })
        ]
      ;
      yExtent = d3.extent(data.map(function(d) { return d.pitch; }));

      var rect = selection.selectAll("rect")
              .data(function(d) { return d; })
      ;
      rect.enter()
        .append("rect")
          .attr("class", "note")
      ;
      rect.exit()
        .remove()
      ;
      selection.selectAll("rect")
       .transition(d3.transition())
          .attr("x", function(d) { return x(d.time); })
          .attr("width", function(d) {
              return x(d.time + d.duration) - x(d.time);
            })
          .attr("y", function(d) { return y(d.pitch); })
          .attr("height", y.bandwidth())
          .attr("rx", y.bandwidth() / 2)
          .attr("ry", y.bandwidth() / 2)
      ;
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
