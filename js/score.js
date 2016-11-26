function Score() {
  /*
  ** Private Variables - only used inside this object
  */
  // Standard variables
  var x // scale for global domain
    , y // scale for global domain
  ;
  /*
  ** Main Function Object
  */
  function my(svg) {
      var noteHeight = y.bandwidth()
        , rect = svg.selectAll("rect")
              .data(function(d) { return d; }, function(d, i) { return i; })
      ;
      rect.exit().remove();
      rect.enter()
        .append("rect")
          .attr("class", "note")
          .classed("extreme-plain", function(d) { return d.extreme; })
        .merge(rect)
          .attr("rx", noteHeight / 2)
          .attr("ry", noteHeight / 2)
          .attr("height", noteHeight)
        .transition(d3.transition())
          .attr("y", function(d) { return y(d.pitch); })
          .attr("x", function(d) { return x(d.time); })
          .attr("width", function(d) { return x(d.duration); })
      ;
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
      return my;
    } // my.y()
  ;
  // This is ALWAYS the last thing returned
  return my;
} // Score()
