function NotesBook() {
  /*
  ** Private Variables
  */
  var bezel, svg, lens, markings
    , data
    , viewbox
    , margin = { top: 50, right: 25, bottom: 50, left: 50 }
    , width = 960
    , height = 500
    , fullheight
    , barlinesAxis = d3.axisTop()
    , barlines
    , bars
    , measuresAxis = d3.axisBottom()
    , measures
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
    , mensurationsAxis = d3.axisTop()
    , mensurations
    , sensor = d3.voronoi()
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my() {
      w = width / (width + margin.left + margin.right) * 100;
      wp = margin.left / width * 100;
      h = height / (height + margin.top + margin.bottom) * 100;
      hp = margin.top / height * 100;

      bezel.selectAll("*").remove();
      svg = bezel.append("svg")
          .attr("class", "bezel")
          // .attr("width", width + margin.left + margin.right)
          // .attr("height", height + margin.top + margin.bottom)
          .style("width", "100%")
          .style("height", "100%")
          .attr("width", 100)
          .attr("height", 100)
          .attr("viewBox", "0 0 100 100")
          .attr("preserveAspectRatio", "none")
      ;
      lens = svg
          .call(canvas.render)
        .select("svg")
          .attr("x", 7)
          .attr("y", 7)
          .attr("width",  93)
          .attr("height", 93)
      ;
      viewbox = lens.attr("viewBox").split(' ');
      height = Math.abs(viewbox[3] - viewbox[1]);
      fullheight = lens.selectAll(".voicebox").size() * height;
      svg.selectAll(".markings")
          .data(["markings"], function(d) { return d; })
        .enter().append("svg")
          .attr("class", "markings")
            .attr("width", 100)
            .attr("height", 93)
            .attr("x", 0)
            .attr("y", 7)
//            .attr("viewBox", viewbox.join(' '))
            //.attr("preserveAspectRatio", "xMinYMin slice")
            .call(render_reflines)
          .selectAll(".tick line")
            .attr("x1", "100%")
      ;
      //markings = svg.call(canvas.render_reflines);
      ;
  } // my() - Main function object

  /*
  ** Helper Functions
  */
  function update() {
  } // update()

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
  my.data = function (value){
      if(arguments.length === 0) return data;
      data = value;
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
            lens.selectAll("svg.subdued")
                .classed("subdued", false)
        else
            lens.selectAll("svg")
                .classed("subdued", function(d, i) { return i !== _[1]; })
            ;
      return my;
    } // my.hilite()
  ;
  my.zoom = function(_) {
      var vb = lens.attr("viewBox").split(' ');
      if(!arguments.length) return vb;

      vb[0] = _[0];
      vb[2] = Math.abs(_[1] - _[0]);

      lens.attr("viewBox", vb.join(' ') );

      return my;
    } // my.zoom()
  ;
  my.separate = function(_) {
      var vb = lens.attr("viewBox").split(' ');
      vb[3] = _ ? fullheight : height;

      lens
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voicebox")
          .attr("y", function(d, i) { return _ ? i * height : 0; })
      ;
      return my;
    } // my.separate()
  ;
  my.div = function(_) {
      if(!arguments.length) return bezel;
      bezel = _;
      return my;
    } // my.div()
  ;
  my.viewbox = function(_) {
      if(!arguments.length) return viewbox;

      viewbox = _;
      return my;
    } // my.viewbox()
  ;
  my.canvas = function(_) {
      if(!arguments.length) return canvas;
      canvas = _;
      return my;
    } // my.canvas()
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
