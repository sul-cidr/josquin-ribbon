function NotesBook() {
  /*
  ** Private Variables
  */
  var data
    , svg, backplane
    , width
    , height
    , viewbox
    , fullheight
    , margin = { top: 50, right: 25, bottom: 50, left: 50 }
    , x = d3.scaleLinear()
    , y = d3.scaleBand().padding(0.2)
    , score  = Score()
    , ribbon = Ribbon()
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
    , dispatch
  ;

  /*
  ** Main Function Object
  */
    function my() {
      svg
          .attr("class", "lens")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height].join(' '))
          .attr("preserveAspectRatio", "none")
          .style("width", "100%")
          .style("height", "100%")
      ;
      backplane = svg
        .append("svg")
          .attr("class", "backplane")
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
  function mensurationsRender(selection) {
      selection
          .call(mensurationsAxis)
        .selectAll(".tick")
          .each(function(d, i) {
              var self = d3.select(this)
                , sym = data.barlines[i].mensuration
              ;
              self.select("text")
                  .text(mensurationCodes[sym] || null)
              ;
            })
      ;
  } // mensurationsRender()


  function render_reflines(sel) {
      var lines = d3.scaleOrdinal()
            .domain([32, 28, 24])
            .range(["G", "C4", "F"])
        , y = canvas.y().range([93, 0])
        , axis = d3.axisLeft()
            .scale(y)
            .tickValues(lines.domain())
            .tickFormat(lines)
      ;
      sel
        .append("g")
          .call(axis)
        .selectAll(".tick")
          .attr("class", function(d) {
              return "tick refline refline--" + lines(d);
            })
      sel.select("g").selectAll("path, line")
          .attr("vector-effect", "non-scaling-stroke")
      ;
      console.log(sel, y.domain(), y.range());
  } // render_reflines()


  /*
  ** API (Getter/Setter) Functions
  */
  my.svg = function (value){
      if(!arguments.length) return svg;
      svg = value;
      return my;
    } // my.svg()
  ;
  my.data = function (value){
      if(!arguments.length) return data;
      data = value;

      x.domain([0, data.scorelength[0]]);
      y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1));

      var scaleup = function(d) { return d * lifeSize; };
      x.range(x.domain().map(scaleup));
      y.range(d3.extent(y.domain()).reverse().map(scaleup));

      width   = Math.abs(x.range()[1] - x.range()[0]);
      height  = Math.abs(y.range()[1] - y.range()[0]);
      fullheight = height * data.partcount;
      viewbox = [x.range()[0], y.range()[1], width, height];

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
      var vb = svg.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);

      svg.attr("viewBox", vb.join(' ') );

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
  my.viewbox = function(_) {
      if(!arguments.length) return viewbox;

      viewbox = _;
      return my;
    } // my.viewbox())
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
