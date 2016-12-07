function Reflines() {
  /*
  ** Private Variables - only used within this object/function
  */
  var x, y
    , lines = d3.scaleOrdinal()
          .domain([32, 28, 24])
          .range(["G", "C4", "F"])
    , axis = d3.axisLeft()
          .tickValues(lines.domain())
          .tickFormat(lines)
  ;
  /*
  ** Main Function Object
  */
  function my(sel) {
      sel
        // .append("g")
        //   .attr("class", "reflines")
        .append("g")
          .attr("transform", "translate(" + margin.left + ",0)")
          .call(axis.scale(y).tickSize(x.range()[0] - x.range()[1]))
        .selectAll(".tick")
          .attr("class", function(d) {
            return "tick refline refline--" + lines(d);
          })
      ;
      sel.select("g .domain")
          .style("display", "none")
      ;
  } // main function object

  /*
  ** API - Getter/Setter Functions
  */
  my.x = function (_){
      if(!arguments.length)
          return x;
      x = _;
      return my;
    } // my.x()
  ;
  my.y = function (_){
      if(!arguments.length)
          return y;
      y = _;
      return my;
    } // my.y()
  ;

  /* This is always the last thing returned */
  return my;
} // Reflines()
