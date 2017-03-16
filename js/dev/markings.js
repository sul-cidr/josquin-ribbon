function Markings() {
  /*
  ** Private Variables
  */
  var svg
    , data
    , x, y
    , width, height
    , percents = { left: 5, top: 5, right: 5, bottom: 5}
    , margin = { left: 5, top: 5, right: 5, bottom: 5}
    , reflines, voices = d3.scaleBand()
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
    , separate
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
      reflines = svg.selectAll(".reflines")
          .data(voices.domain(), function(d) { return d; })
      ;
      reflines = reflines
        .enter().append("g")
          .attr("class", function(d, i) { return "refline voice-" + i; })
        .merge(reflines)
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

      barlinesScale = x.range([margin.left, width - margin.right]);
      y.range([height - margin.bottom, margin.top]);
      voices.range(y.range());

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
        , labelsExtent = d3.extent(data
              .filter(function(b){
                  return b.label && isBetween(b.time[0], barlinesScale.domain());
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

  function isBetween(num, extent) {
      return (num >= extent[0]) && (num <= extent[1]);
  } // isBetween()

  function renderMensurations(selection) {
      mensurationsAxis
          .scale(barlinesScale.clamp(true))
          .tickSize(0)
          .tickValues(
              mensurationsScale.domain()
                .filter(function(d) {
                    return isBetween(d, barlinesScale.domain());
                  }))
          .tickFormat(mensurationsScale)
      ;
      selection
          .attr("transform", "translate(0," + margin.top + ")")
          .call(mensurationsAxis)
      ;
      selection.selectAll(".tick text")
          .attr("font-family", "BravuraText")
          .attr("font-size", "1.4em")
          .attr("dy", "-0.2em")
      ;
  } // renderMensurations()

  function renderReflines() {
      reflinesAxis
          .tickSize(x.range()[0] - x.range()[1])
      ;
      reflines
        .each(function(d, i) {
            var self = d3.select(this)
              , myscale = separate
                  ? y.copy().range([voices(d) + voices.bandwidth(), voices(d)])
                  : y
            ;
            self
                .attr("transform", "translate(" + margin.left + ",0)")
              .transition()
                .call(reflinesAxis.scale(myscale))
            ;
            self.select("g > .domain")
                .style("display", "none")
            ;
          })
        .selectAll(".tick")
          .attr("class", function(d) {
            return "tick refline refline--" + reflinesScale(d);
          })
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
  my.voices = function (_) {
      if(!arguments.length) return voices.domain();
      voices.domain(_);
      return my;
    } // my.voices()
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
      mensurationsAxis.scale(barlinesScale.clamp(true));
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
  my.connect = function(_) {
      if(!arguments.length) return dispatch;
      dispatch = _;
      return my;
    } // my.connect()
  ;

  // API Method. Respond to combine/separate button signal
  my.separate = function(_) {
      if(!arguments.length) return separate;

      separate = _;
      renderReflines();

      return my;
    } // my.separate()
  ;
  // API Method. Expensive, because it causes a rerender.
  my.calibrate = resize;

  // This is ALWAYS the last thing returned
  return my;
} // Markings()
