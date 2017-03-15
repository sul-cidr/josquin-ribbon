function Markings() {
  /*
  ** Private Variables
  */
  var svg
    , x, y
    , width, height
    , percents = { left: 5, top: 5, right: 5, bottom: 5}
    , margin = { left: 5, top: 5, right: 5, bottom: 5}
    , data
    , reflines
    , reflinesScale = d3.scaleOrdinal()
          .domain([32, 28, 24])
          .range(["G", "C4", "F"])
    , reflinesAxis = d3.axisLeft()
          .tickValues(reflinesScale.domain())
          .tickFormat(reflinesScale)
    , barlines, barlinesScale, barlinesAxis = d3.axisBottom()
    , barLabels, barLabelCount = 15
    , mensurations, mensurationsLocs
    , mensurationsScale = d3.scaleOrdinal()
    , mensurationsAxis = d3.axisTop()
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

      barlinesAxis
          .tickValues(data.map(function(b) { return b.time[0]; }))
          .tickFormat(function (d, i){
              // barLabels is a dictionary for the "ticks" to include.
              // It is computed inside renderBarlines before rendering the axis.
              var label = data[i].label;
              return barLabels[label] ? label : "";
            })
      ;
      barlines = barlines || svg
        .append("g")
          .attr("class", "barlines haxis")
      ;

      // Locations for changes in mensuration.
      mensurationsLocs = data.filter(function(d) { return d.mensuration; });
      mensurationsScale
          .domain(mensurationsLocs.map(function(d) { return d.time[0]; }))
          .range(mensurationsLocs.map(function(d) {
              return mensurationCodes[d.mensuration] || d.mensuration;
            }))
      ;
      mensurations = mensurations || svg
        .append("g")
          .attr("class", "mensurations haxis")
      ;
      reflines = svg
        .append("g")
          .attr("class", "reflines")
      ;


      if(!width || !height) resize();
      // render();
  } // my() - main function object


  // Respond to changes in the viewport's dimensions
  function resize() {
      width = svg.node().width.baseVal.value;
      height = svg.node().height.baseVal.value;
      margin.top = (percents.top * height) / 100;
      margin.right = (percents.right * width) / 100;
      margin.bottom = (percents.bottom * height) / 100;
      margin.left = (percents.left * width) / 100;

      y.range([height - margin.bottom, margin.top]);
      barlinesScale = x.range([margin.left, width - margin.right]);

      reflines.call(renderReflines);
      barlines.call(renderBarlines);
      mensurations.call(renderMensurations);
  } // resize()



  /*
  ** Helper Functions
  */
  // This function renders the bar lines and labels.
  function renderBarlines(selection){
      // Compute the set of bar labels to show.
      var t0 = barlinesScale.domain()[0]
        , t1 = barlinesScale.domain()[1]
        , labelsExtent = d3.extent(
              data.filter(function(b){
                      var t = b.time[0];
                      return b.label && t >= t0 && t <= t1;
                    })
                  .map(function(b){ return +b.label; })
                )
        , ticks = d3.ticks(labelsExtent[0], labelsExtent[1], barLabelCount)
      ;
      // Store the collection of label "ticks" in barLabels,
      // which is used in the tickFormat function of barlinesAxis.
      barLabels = {};

      ticks.forEach(function (tick){ barLabels[tick] = true; });

      barlinesAxis
          .scale(barlinesScale.clamp(true))
          .tickSize(height - margin.bottom - margin.top)
      ;
      // Render the axis, which includes both lines and labels.
      selection
          .attr("transform", "translate(0," + margin.top + ")")
          .call(barlinesAxis)
        .selectAll(".tick")
          .classed("terminal", function(d) { return d.terminal; })
      ;
  } // renderBarlines()

  function renderMensurations(selection) {
      mensurationsAxis
          .scale(barlinesScale.clamp(false))
          .tickSize(0)
          .tickValues(mensurationsScale.domain())
          .tickFormat(mensurationsScale)
      ;
      selection
          .attr("transform", "translate(0," + margin.top + ")")
          .call(mensurationsAxis)
      ;
      selection.selectAll(".tick text")
          .attr("font-family", "BravuraText")
          .attr("font-size", "1.4em")
          .attr("dy", function(d) {
              return isNaN(mensurationsScale(d)) ? "-0.5em" : "-0.2em";
            })
      ;

  } // renderMensurations()

  function renderReflines(sel) {
      reflinesAxis
          .scale(y)
          .tickSize(x.range()[0] - x.range()[1])
      ;
      sel
          .attr("transform", "translate(" + margin.left + ",0)")
          .call(reflinesAxis)
        .selectAll(".tick")
          .attr("class", function(d) {
            return "tick refline refline--" + reflinesScale(d);
          })
      ;
      sel.select("g > .domain")
          .style("display", "none")
      ;
  } // renderReflines


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
      barlinesAxis.scale(barlinesScale.clamp(true));
      barlines.call(renderBarlines);
      mensurationsAxis.scale(barlinesScale.clamp(false));
      mensurations.call(renderMensurations);

      return my;
    } // my.x()
  ;
  my.y = function(_) {
      if(!arguments.length) return y;
      y = _.copy();
      return my;
    } // my.y()
  ;
  my.resize = function() {
      return resize;
    } // my.resize()
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
