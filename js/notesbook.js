function NotesBook() {
  /*
  ** Private Variables
  */
  var svg
    , data
    , viewbox
    , width
    , height
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
      svg.call(canvas.render);
      svg = svg.select("svg");
      viewbox = svg.attr("viewBox").split(' ');
      height = Math.abs(viewbox[3] - viewbox[1]);
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

  function reflinesRender(selection) {
      selection.style("visibility", showReflines ? "visible" : "hidden");
      if(!showReflines) return;

      selection
         .call(reflinesAxis)
       .selectAll(".tick")
         .filter(function (d){ return reflinesValues[d].style === "dashed" })
         .attr("stroke-dasharray", "4 4")
     ;
  } // reflinesRender()


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
            svg.selectAll("svg.subdued")
                .classed("subdued", false)
        else
            svg.selectAll("svg")
                .classed("subdued", function(d, i) { return i !== _[1]; })
            ;
      return my;
    } // my.hilite()
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
      var vb = svg.attr("viewBox").split(' ');
      vb[3] = _ ? fullheight : height;

      svg
        .transition(d3.transition())
          .attr("viewBox", vb.join(' '))
        .selectAll(".voicebox")
          .attr("y", function(d, i) { return _ ? i * height : 0; })
      ;
      return my;
    } // my.separate()
  ;
  my.svg = function(_) {
      if(!arguments.length) return svg;
      svg = _;
      return my;
    } // my.svg()
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
