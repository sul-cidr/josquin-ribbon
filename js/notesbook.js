function NotesBook() {
  /*
  ** Private Variables
  */
  var svg
    , data
    , viewbox
    , width
    , height
    , voices
    , barlinesAxis = d3.axisTop()
    , barlines
    , bars
    , measuresAxis = d3.axisBottom()
    , measures
    , mensurationCodes = {
            "O": ""
          , "O|": ""
          , "O|.": ""
          , "C.": ""
          , "C": ""
          , "Cr": ""
          , "C|.": ""
          , "C|": ""
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
  my.margin = function(_) {
      if(!arguments.length) return margin;
      margin = _;

      return my;
    } // my.margin()
  ;
  my.connect = function(_) {
      if(!arguments.length) return dispatch;
      dispatch = _;
      return my;
    } // my.connect()
  ;
  my.zoom = function(_) {
      var h = Math.abs(viewbox[3] - viewbox[1]) // don't change the height
        , w = Math.abs(_[1] - _[0])
      ;
      svg
          .attr("viewBox", [_[0], viewbox[1], w, viewbox[3]].join(' '))
      ;
      return my;
    } // my.zoom()
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
  my.separate = function(_) {
      svg
        .transition(d3.transition())
          .attr(
                "viewBox"
              , [
                    viewbox[0]
                  , viewbox[1]
                  , Math.abs(viewbox[2] - viewbox[0])
                  , height * (_ ? voices.length : 1)
                ]
            )
        .selectAll("svg")
          .attr("y", function(d, i) {
              return _ ? i * height : 0;
            })
      ;
      return my;
    } // my.separate()
  ;
  my.svg = function(_) {
      if(!arguments.length) return svg;
      svg = _;
      voices = svg.datum();
      viewbox = svg.attr("viewBox").split(' ');
      height = Math.abs(viewbox[3] - viewbox[1]);
      return my;
    } // my.svg()
  ;
  my.viewbox = function(_) {
      if(!arguments.length) return viewbox;

      viewbox = _;
      return my;
    } // my.viewbox()
  ;
  my.data = function (value){
      if(arguments.length === 0) return data;
      data = value;
      return my;
    } // my.data()
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
