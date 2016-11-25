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
      return my;
    } // my.zoom()
  ;
  my.hilite = function(value) {
      return my;
    } // my.hilite()
  ;
  my.separate = function(value) {
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
  my.data = function (value){
      if(arguments.length === 0) return data;
      data = value;
      return my;
    } // my.data()
  ;

  // This is always the last thing returned
  return my;
} // NotesBook()
