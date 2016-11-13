function Score() {
  /*
  ** Private Variables - only used inside this object
  */
  // Standard variables
  var x // scale for global domain
    , y // scale for global domain
    , extent
  ;
  /*
  ** Main Function Object
  */
  function my(svg) {
      var rect = svg.selectAll("rect")
              .data(function(d) { return d; }, function(d, i) { return i; })
      ;
      rect.exit().remove();
      rect.enter()
        .append("rect")
          .attr("class", "note")
        .merge(rect)
          .attr("rx", y.bandwidth() / 2)
          .attr("ry", y.bandwidth() / 2)
          .attr("height", y.bandwidth())
          .classed("extreme", function(d) { return ~extent.indexOf(d.pitch); })
        .transition(d3.transition())
          .attr("x", function(d) { return x(d.time); })
          .attr("y", function(d) { return y(d.pitch); })
          .attr("width", function(d) {
              return x(d.time + d.duration) - x(d.time);
            })
      ;
      // computeExtremeNotes();
      // enableTooltips();
  } // my()

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
      extent = d3.extent(y.domain());
      return my;
    } // my.y()
  ;
  // This is ALWAYS the last thing returned
  return my;
} // Score()
