function Markings() {
  /*
  ** Private Variables
  */
  var svg
    , x, y
    , width, height
    , margin = { left: 30, top: 30, right: 10, bottom: 30}
    , data
    , reflines = Reflines()
    , barlines, barlinesScale, barlinesAxis
    , barLabels, barLabelCount = 15
    , mensurations, mensurationsLocs, mensurationsAxis
    , mensurationCodes = {
            "O"  : ""
          , "O|" : ""
          , "O|.": ""
          , "C." : ""
          , "C"  : ""
          , "Cr" : ""
          , "C|.": ""
          , "C|" : ""
          , "C|r": ""
        }
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my(el) {
      svg = el;
      width = svg.node().width.baseVal.value;
      height = svg.node().height.baseVal.value;
      console.log(el);

      barlinesScale = x.range([margin.left, width - margin.right]);
      // This axis is used for rendering the bar lines and labels.
      barlinesAxis = d3.axisBottom()
          .scale(barlinesScale.clamp(true))
          .tickValues(data.map(function(b) { return b.time[0]; }))
          .tickFormat(function (d, i){
              // barLabels is a dictionary for the "ticks" to include.
              // It is computed inside renderBarlines before rendering the axis.
              var label = data[i].label;
              return barLabels[label] ? label : "";
            })
          .tickSize(height - margin.bottom - margin.top) // Make the line span the vertical space.
      ;
      barlines = svg
        .append("g")
          .attr("class", "barlines haxis")
          .attr("transform", "translate(0," + margin.top + ")")
          .call(renderBarlines)
      ;
      barlines.selectAll(".tick")
          .classed("terminal", function(d) { return d.terminal; })
      ;

      // Locations for changes in mensuration.
      mensurationsLocs = data.filter(function(d) { return d.mensuration; });
      mensurationsScale = d3.scaleOrdinal()
          .domain(mensurationsLocs.map(function(d) { return d.time[0]; }))
          .range(mensurationsLocs.map(function(d) {
              return mensurationCodes[d.mensuration] || d.mensuration;
            }))
      ;
      mensurationsAxis = d3.axisTop()
          .scale(barlinesScale.clamp(false))
          .tickSize(0)
          .tickValues(mensurationsScale.domain())
          .tickFormat(mensurationsScale)
      ;
      mensurations = svg
        .append("g")
          .attr("class", "mensurations haxis")
          .attr("transform", "translate(0," + margin.top + ")")
          .call(mensurationsAxis)
      ;
      mensurations.selectAll(".tick text")
          .attr("font-family", "BravuraText")
          .attr("font-size", "1.4em")
          .attr("dy", function(d) {
              return isNaN(mensurationsScale(d)) ? "-0.5em" : "-0.2em";
            })
      ;
      svg
        .append("g")
          .attr("class", "reflines")
          .call(reflines.x(x).y(y.copy().range([height - margin.bottom, margin.top])))
      ;

  } // my() - main function object

  /*
  ** Helper Functions
  */
  // This function renders the bar lines and labels.
  function renderBarlines(selection){

      // Compute the set of bar labels to show.
      var t0 = barlinesScale.domain()[0],
          t1 = barlinesScale.domain()[1],
          labelsExtent = d3.extent(
              data.filter(function(b){
                  var t = b.time[0];
                  return b.label && t >= t0 && t <= t1;
              })
              .map(function(b){ return +b.label; })
          ),
          ticks = d3.ticks(labelsExtent[0], labelsExtent[1], barLabelCount);

      // Store the collection of label "ticks" in barLabels,
      // which is used in the tickFormat function of barlinesAxis.
      barLabels = {};
      ticks.forEach(function (tick){
          barLabels[tick] = true;
      });

      // Render the axis, which includes both lines and labels.
      selection.call(barlinesAxis);
  } // renderBarlines()


  /*
  ** API - Getter/Setter Methods
  */
  my.data = function (_){
      if(!arguments.length) return data;
      data = _;
      return my;
    } // my.data()
  ;
  my.x = function(_) {
      if(!arguments.length) return x;
      x = _.copy();
      return my;
    } // my.x()
  ;
  my.xDomain = function(_) {
      if(!arguments.length) return x.domain();
      x.domain(_);
      barlinesAxis.scale(barlinesScale.clamp(true))
      barlines.call(renderBarlines);
      mensurations.call(mensurationsAxis.scale(barlinesScale.clamp(false)));

      return my;
    } // my.x()
  ;
  my.y = function(_) {
      if(!arguments.length) return y;
      y = _.copy();
      return my;
    } // my.y()
  ;
  my.connect = function(_) {
      if(!arguments.length) return dispatch;
      dispatch = _;
      return my;
    } // my.connect()
  ;

  // This is ALWAYS the last thing returned
  return my;
} // Markings()
