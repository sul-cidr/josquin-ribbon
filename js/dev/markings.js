function Markings() {
  /*
  ** Private Variables
  */
  var svg
    , data
    , x, y
    , width, height
    , percents = { left: 5, top: 15, right: 5, bottom: 5}
    , margin = { left: 5, top: 10, right: 5, bottom: 5}
    , reflines, voices = d3.scaleBand()
    , reflinesScale = d3.scaleOrdinal()
          .domain([32, 28, 24])
          .range(["G", "C4", "F"])
    , reflinesAxis = d3.axisLeft()
          .tickFormat(reflinesScale)
    , barlines, barlinesScale, barlinesAxis = d3.axisBottom()
    , barLabels, barLabelCount = 15
    , mensurations, mensurationsLocs
    , mensurationsScale = d3.scaleOrdinal()
    , mensurationsAxis = d3.axisTop()
    , mensurationCodes = {
            "O." : "E910"
          , "O"  : "E911"
          , "O|" : "E912"
          , "O|.": "E913"
          , "C." : "E914"
          , "C"  : "E915"
          , "Cr" : "E916"
          , "C.|": "E917"
          , "C|.": "E917"
          , "C|" : "E918"
          , "C|r": "E919"
          , "C.r": "E91A"
          , "1"  : "E926"
          , "2"  : "E927"
          , "3"  : "E928"
          , "4"  : "E929"
        }
    , sections, sectionsLocs
    , sectionsScale = d3.scaleOrdinal()
    , sectionsAxis = d3.axisTop()
    , separate
    , scorelength
    , dispatch
    , timeTransform = function (d){ return d; }
  ;

  /*
  ** Main Function Object
  */
  function my(el) {
      svg = el;

      barlines = barlines || svg
        .append("g")
          .attr("class", "barlines haxis")
      ;

      // Locations for changes in mensuration.
      mensurationsLocs = data.filter(function(d) { return d.mensuration; });
      mensurationsScale
          .domain(mensurationsLocs.map(function(d) {
              return timeTransform(d.time[0]);
          }))
          .range(mensurationsLocs.map(function(d) { return d.mensuration; }))
      ;

      mensurations = mensurations || svg
        .append("g")
          .attr("class", "mensurations haxis")
      ;
      // Reference lines (the three horizontal pitch lines)
      reflinesAxis
          .tickValues(reflinesScale.domain()
                  .filter(function(d) { return isBetween(d, y.domain()); })
          )
      ;
      reflines = svg.selectAll(".refline")
          .data(voices.domain(), function(d, i) { return d; })
      ;
      reflines = reflines
        .enter().append("g")
          .attr("class", function(d, i) { return "refline voice-" + i; })
        .merge(reflines)
      ;

      // Locations for section labels
      sectionsLocs = data.filter(function(d) { return d.sectionlabel; });
      sectionsScale
          .domain(sectionsLocs.map(function(d) {
              return timeTransform(d.time[0]);
          }))
          .range(sectionsLocs.map(function(d) { return d.sectionlabel; }))
      ;
      sections = sections || svg
        .append("g")
          .attr("class", "sections haxis")
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
      sections.call(renderSections);
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
          .tickValues(data.map(function(b) { return b.time[0]; }))
          .tickFormat(function (d, i){
              // barLabels is a dictionary for the "ticks" to include.
              var label = data[i].label;
              return barLabels[label] ? label : "";
            })
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
      selection.selectAll(".tick").each(function() {
          var self = d3.select(this)
            , sym = self.select("text")
            , code = mensurationCodes[sym.text()]
          ;
          if(code) {
              // Hide the text
              sym.style("visibility", "hidden")
              // Show the SVG symbol
              var use = self.selectAll("use")
                  .data([sym.text()], function(d) { return d; })
              ;
              use.exit()
                .remove()
              ;
              use = use.enter()
                .append("use")
                  .attr("class", "mensuration")
                .merge(use)
              ;
              use
                  .attr("xlink:href", "#uni" + code)
                  .attr("x", -7)
                  .attr("y", -24)
                  .attr("height", "18")
                  .attr("width", "14")
              ;
          }
        })
      ;
  } // renderMensurations()

  function renderSections(selection) {
      sectionsAxis
          .scale(barlinesScale.clamp(true))
          .tickSize(0)
          .tickValues(
              sectionsScale.domain()
                .filter(function(d) { return isBetween(d, barlinesScale.domain())
              ;
            }))
          .tickFormat(sectionsScale)
      ;
      selection
          .attr("transform", "translate(0," + (margin.top / 2) + ")")
          .call(sectionsAxis)
      ;
  } // renderSectionLabels()

  function renderReflines(selection) {
      reflinesAxis
          .tickSize(x.range()[0] - x.range()[1])
      ;
      selection
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
      reflines.exit().remove();
  } // renderReflines

  /*
  ** Utility Functions
  */
  function isBetween(num, arr) {
      var extent = d3.extent(arr);
      return (num >= extent[0]) && (num <= extent[1]);
  } // isBetween()


  /*
  ** API - Getter/Setter Methods
  */
  my.data = function (_){
      if(!arguments.length) return data;

      if(reflines) reflines.selectAll(".refline").remove();
      data = _;
      height = width = null;
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
      sections.call(renderSections);

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
  my.scorelength = function(_) {
      if(!arguments.length) return scorelength;
      scorelength = _;
      return my;
    } // my.scorelength()
  ;

  // API Method. Respond to combine/separate button signal
  my.separate = function(_) {
      if(!arguments.length) return separate;

      separate = _;
      reflines.call(renderReflines);

      return my;
    } // my.separate()
  ;
  // API Method. Expensive, because it causes a rerender.
  my.calibrate = resize;

  // Setter only.
  my.timeTransform = function(_){
      timeTransform = _;
      return my;
  };

  // This is ALWAYS the last thing returned
  return my;
} // Markings()
