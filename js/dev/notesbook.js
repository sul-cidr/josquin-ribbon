function NotesBook() {
  /*
  ** Private Variables
  */
  var data
    , svg, voices, lens
    , width
    , height
    , viewbox
    , fullheight
    , margin = { top: 25, right: 5, bottom: 25, left: 25 }
    , x = d3.scaleLinear()
    , y = d3.scaleBand().padding(0.2)
    , score  = Score()
    , ribbon = Ribbon()
    , markings = Markings()
    , lifeSize = 10 // default height and width of notes
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my() {
      svg
          .attr("class", "notesbook")
          .style("height", "100%")
          .style("width", "100%")
      ;
      x.domain([0, data.scorelength[0]]);
      y.domain(d3.range(data.minpitch.b7, data.maxpitch.b7 + 1));

      console.log(data);
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
        .append("svg")
          .attr("class", "markings")
          .call(markings.data(data.barlines).x(x.copy()).y(y.copy()))
      ;
      lens = svg
        .append("svg")
        .attr("class", "lens music")
          .attr("viewBox", [0, 0, width, height].join(' '))
          .attr("preserveAspectRatio", "none")
          .attr("x", margin.left)
          .attr("y", margin.top )
          .attr("width", "100%")
          .attr("height", "100%")
      ;
      defs = lens
        .append("defs")
      ;
      voices = lens
        .append("svg")
          .attr("class", "voices")
          .attr("id", "voices")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height].join(' '))
          .attr("preserveAspectRatio", "none")
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
      var voice = voices.selectAll(".voice")
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
      voices.selectAll(".ribbon")
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
            voices.selectAll(".subdued")
                .classed("subdued", false)
        else
            voices.selectAll("svg")
                .classed("subdued", function(d, i) { return i !== _[1]; })
            ;
      return my;
    } // my.hilite()
  ;
  my.extremes = function() {
      var xtrms = voices.selectAll(".extreme").empty();
      voices.selectAll(".extreme-plain")
          .classed("extreme", xtrms)
      ;
    } // my.extremes()
  ;
  my.zoom = function(_) {
      var vb = lens.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);
      markings.xDomain([vb[0], vb[0] + vb[2]].map(x.invert));

      lens.attr("viewBox", vb.join(' ') );

      return my;
    } // my.zoom()
  ;
  my.separate = function(_) {
      // Art-direct the various voice SVGs
      var vb = voices.attr("viewBox").split(' ');
      vb[3] = _ ? fullheight : height;

      voices
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voice")
          .attr("y", function(d, i) { return _ ? i * height : 0; })
      ;
      return my;
    } // my.separate()
  ;
  my.notes = function() { // toggles the notes on/off
      var music = voices.selectAll(".notes")
        , vis = music.style("display")
      ;
      music.style("display", vis === "inline" ? "none" : "inline");
    } // my.notes()
  ;
  my.ribbons = function(arg) {
      voices.selectAll(".ribbon")
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
