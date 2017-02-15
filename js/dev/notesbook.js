function NotesBook() {
  /*
  ** Private Variables
  */
  var data
    , svg, backplane, lens
    , width
    , height
    , viewbox
    , fullheight
    , margin = { top: 25, right: 5, bottom: 40, left: 25 }
    , x = d3.scaleLinear()
    , y = d3.scaleBand().padding(0.2)
    , score  = Score()
    , ribbon = Ribbon()
    , reflines = Reflines()
    , lifeSize = 10 // default height and width of notes
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
    , barlines, barlinesScale, barlinesAxis
    , mensurations, mensurationsLocs, mensurationsAxis
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my() {
      svg
          .attr("class", "bezel")
          .style("width", "100%")
          .style("height", "100%")
      ;
      x.domain([0, data.scorelength[0]]);
      y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1));

      var scaleup = function(d) { return d * lifeSize; };
      x.range(x.domain().map(scaleup));
      y.range(d3.extent(y.domain()).reverse().map(scaleup));

      width   = Math.abs(x.range()[1] - x.range()[0]);
      height  = Math.abs(y.range()[1] - y.range()[0]);
      fullheight = height * data.partcount;
      viewbox = [x.range()[0], y.range()[1], width, height];

      var sw = parseFloat(svg.style("width"))
        , sh = parseFloat(svg.style("height"))
        , w = 500, h = Math.round(w * sh / sw)
        , fw = w + margin.left + margin.right
        , fh = h + margin.top + margin.bottom
      ;
      svg
          .attr("width", fw)
          .attr("height", fh)
          .attr("viewBox", [0, 0, fw, fh].join(' '))
          .attr("preserveAspectRatio", "none")
      ;
      markings = svg
        .append("g")
          .attr("class", "markings")
      ;
      markings
        .append("g")
          .attr("class", "reflines")
          // .attr("viewBox", [x.range()[0], y.range()[1], width, height].join(' '))
          // .attr("preserveAspectRatio", "none")
          // .attr("x", 0)
          // .attr("y", margin.top)
          // .attr("width", fw)
          // .attr("height", h)
          .call(reflines.x(x).y(y.copy().range([fh - margin.bottom, margin.top])))
      ;
      barlinesScale  = x.copy().range([margin.left, fw - margin.right]);

      // This axis is used for rendering the bar lines (always a fixed number of lines).
      barlinesAxis = d3.axisBottom()
          .scale(barlinesScale.clamp(true))
          .tickValues(data.barlines.map(function(b) { return b.time[0]; }))
          .tickFormat(function (d, i){ return data.barlines[i].label; })
          .tickSize(h)
      ;

      // Locations for changes in mensuration.
      mensurationsLocs = data.barlines
          .filter(function(d) { return d.mensuration; })
      ;
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
      barlines = markings
        .append("g")
          .attr("class", "barlines haxis")
          .attr("transform", "translate(0," + margin.top + ")")
          .call(barlinesAxis)
      ;
      barlines.selectAll(".tick")
          .classed("terminal", function(d) { console.log(d.terminal); return d.terminal; })
      ;
      mensurations = markings
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
      lens = svg
        .append("svg")
        .attr("class", "lens")
          .attr("viewBox", [0, 0, width, height].join(' '))
          .attr("preserveAspectRatio", "none")
          .attr("x", margin.left)
          .attr("y", margin.top )
          .attr("width", w)
          .attr("height", h)
      ;
      backplane = lens
        .append("svg")
          .attr("class", "backplane")
          .attr("id", "backplane")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height].join(' '))
          .attr("preserveAspectRatio", "none")
      ;
      defs = backplane
        .append("defs")
      ;
      score
          .x(x)
          .y(y)
          .defs(defs.append("g").attr("id", "notestamps"))
      ;
      ribbon
          .x(x)
          .y(y)
          .defs(defs.append("g").attr("id", "ribbonstamps"))
      ;
      // reflines
      //     .x(x)
      //     .y(y)
      // ;
      var voice = backplane.selectAll(".voice")
          .data(data.partdata, function(d) { return d.partindex; })
      ;
      voice = voice.enter()
        .append("svg")
          .attr("class", function(d) { return "voice voice" + d.partindex; })
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", viewbox.join(' '))
          .attr("preserveAspectRatio", "xMinYMid slice")
          .each(function() {
              d3.select(this)
                  // .call(reflines)
                  .call(score)
                  .call(ribbon)
              ;
            })
        .merge(voice)
      ;
      backplane.selectAll(".ribbon")
          .style("display", "none")
      ;
  } // my() - Main function object

  /*
  ** Helper Functions
  */

  /*
  ** API (Getter/Setter) Functions
  */
  my.svg = function (_){
      if(!arguments.length) return svg;
      svg = _;
      return my;
    } // my.svg()
  ;
  my.data = function (_){
      if(!arguments.length) return data;
      data = _;
      return my;
    } // my.data()
  ;
  my.connect = function(_) {
      if(!arguments.length) return dispatch;
      dispatch = _;
      return my;
    } // my.connect()
  ;
  my.hilite = function(_) {
        if(!_[0])
            backplane.selectAll(".subdued")
                .classed("subdued", false)
        else
            backplane.selectAll("svg")
                .classed("subdued", function(d, i) { return i !== _[1]; })
            ;
      return my;
    } // my.hilite()
  ;
  my.extremes = function() {
      var xtrms = backplane.selectAll(".extreme").empty();
      backplane.selectAll(".extreme-plain")
          .classed("extreme", xtrms)
      ;
    } // my.extremes()
  ;
  my.zoom = function(_) {
      var vb = lens.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);
      barlinesScale.domain([vb[0], vb[0] + vb[2]].map(x.invert));

      barlines.call(barlinesAxis.scale(barlinesScale.clamp(true)));
      measures.call(measuresAxis.scale(barlinesScale.clamp(true)));
      mensurations.call(mensurationsAxis.scale(barlinesScale.clamp(false)));

      lens.attr("viewBox", vb.join(' ') );

      return my;
    } // my.zoom()
  ;
  my.separate = function(_) {
      // Art-direct the various voice SVGs
      var vb = backplane.attr("viewBox").split(' ');
      vb[3] = _ ? fullheight : height;

      backplane
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voice")
          .attr("y", function(d, i) { return _ ? i * height : 0; })
      ;
      return my;
    } // my.separate()
  ;
  my.notes = function() { // toggles the notes on/off
      var music = backplane.selectAll(".notes")
        , vis = music.style("display")
      ;
      music.style("display", vis === "inline" ? "none" : "inline");
    } // my.notes()
  ;
  my.ribbons = function(arg) {
      backplane.selectAll(".ribbon")
          .style("display", function(d) {
              return d.toLowerCase() === arg ? "inline" : "none";
            })
      ;
    } // my.ribbons()
  ;

  my.viewbox = function(_) { return viewbox; };
  my.x = function() { return x; };
  my.y = function() { return y; };

  // This is always the last thing returned
  return my;
} // NotesBook()
