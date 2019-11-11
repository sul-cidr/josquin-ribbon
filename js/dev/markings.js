/* global d3 */
/* exported Markings */

function Markings() {
  /*
  ** Private Variables
  */
  var svg
    , data
    , x, y
    , width, height
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
    , mensurationCodes = function(mentag) {
            return mentag
              .replace(/^C/g, "c")
              .replace(/^O/g, "o")
              .replace(/r/g, "-reverse")
              .replace(/\//g, "-over")
              .replace(/\|/g, "-pipe")
              .replace(/\./g, "-dot")
              .replace(/(\d+)/g, "-$1")
              .replace(/^-/, "n")
            ;
        }
    , sections, sectionsLocs
    , sectionsScale = d3.scaleOrdinal()
    , sectionsAxis = d3.axisTop()
    , separate
    , scorelength
    , dispatch
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
          .domain(mensurationsLocs.map(getTime))
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
          .domain(sectionsLocs.map(getTime))
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
      barlinesScale = x.range([0, width]);
      y.range([height, 0]);
      voices.range(y.range());

      // TODO move this block into the render function (my())
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
                  return b.label && isBetween(getTime(b), barlinesScale.domain());
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
          .tickValues(data.map(getTime))
          .tickFormat(function (d, i){
              // barLabels is a dictionary for the "ticks" to include.
              var label = data[i].label;
              return barLabels[label] ? label : "";
            })
          .tickSize(height)
      ;
      // Render the axis, which includes both lines and labels.
      selection
          .attr("transform", "translate(0,0)")
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
          .call(mensurationsAxis)
      ;
      selection.selectAll(".tick").each(function() {
          var self = d3.select(this)
            , sym = self.select("text")
            , code = mensurationCodes(sym.text())
          ;
          if(code) {
              // Hide the text
              sym.style("display", "none")
              // Show the SVG symbol
              var use = self.selectAll("use")
                  .data([code], function(d) { return d; })
              ;
              use.exit()
                .remove()
              ;
              use = use.enter()
                .append("use")
                  .attr("class", "mensuration")
                  .attr("x", "-7.5px")
                  .attr("y", "-15px")
                .merge(use)
              ;
              use
                  .attr("xlink:href", "#" + code)
                  .attr("height", "30")
                  .attr("width", "30")
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
          .attr("transform", "translate(15,-6)")
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

      // TODO move this into render function, use .exit()
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

      // TODO move this (entire block) into render function
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

      // TODO move this into render function
      reflines.call(renderReflines);

      return my;
    } // my.separate()
  ;
  // API Method. Expensive, because it causes a rerender.
  my.calibrate = resize;

  // This is ALWAYS the last thing returned
  return my;
} // Markings()
