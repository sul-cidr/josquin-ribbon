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
    , y = d3.scaleBand()
    , dispatch
  ;

  /*
  ** Main Function Object
  */
  function my() {
      bezel.selectAll("*").remove();
      svg = bezel.append("svg")
          .attr("class", "bezel")
          // .attr("width", width + margin.left + margin.right)
          // .attr("height", height + margin.top + margin.bottom)
          .style("width", "100%")
          .style("height", "100%")
      ;
      w = width / (width + margin.left + margin.right) * 100;
      h = height / (height + margin.top + margin.bottom) * 100;
      lens = svg
          .call(canvas.render)
        .select("svg")
          .attr("x", (margin.left / width * 100) + "%")
          .attr("y", (margin.top / height * 100) + "%")
          .attr("width",  Math.round(w) + "%")
          .attr("height", Math.round(h) + "%")
      ;
      console.log(lens);
      viewbox = lens.attr("viewBox").split(' ');
      height = Math.abs(viewbox[3] - viewbox[1]);
      fullheight = lens.selectAll(".voicebox").size() * height;
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
