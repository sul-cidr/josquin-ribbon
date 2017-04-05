function Score() {
  /*
  ** Private Variables - only used inside this object
  */
  // Standard variables
  var data
    , x // scale for global domain
    , y // scale for global domain
    , pitches
    , times
    , stamps
    , startTimeAccessor
    , durationAccessor
  ;
  /*
  ** Main Function Object
  */
  function my(sel) {
      data = sel.datum();
      stampify();
      boxify(data.notedata);

      var svg = sel.select(".notes");
      if(!svg.size()) svg = sel.append("g").attr("class", "notes");

      svg
        .attr("data-bbox", my.bbox())
      ;
      svg.selectAll(".note").remove(); // Clear out all existing notes

      var notes = svg.selectAll(".note")
          .data(
                function(d) { return d.notedata; }
              , function(d) { return d.starttime[0]; }
            )
      ;

      notes.enter()
        .append("use")
          .attr("x", function(d) { return x(startTimeAccessor(d)); })
          .attr("y", function(d) { return y(d.pitch.b7); })
          .attr("xlink:href", function(d) {
              console.log(durationAccessor(d));
              return "#note-" + d.duration[0];
            })
          .attr("class", "note")
          .classed("extreme-plain", function(d) {
              return ~pitches.indexOf(d.pitch.b7);
            })
          .each(function(d) {
              /*
              ** a11y: screen readers will find all the information about the
              **      note here.
              ** side-effect: browser tooltips in ff and chrome.
              */
              var self = d3.select(this)
                , title = d.pitch.name + " : "
                    + d.duration + " beats"
                    + " (" + data.voice + ")"
              ;
              self.append("title")
                  .text(title)
              ;
              self.append("desc")
                  .text(title)
              ;
            })
      ;
  } // my()

  /*
  ** Helper Functions
  */
  function stampify() {
      // Create notes of various widths, as found in the notedata
      var noteHeight = y.bandwidth()
        , durations = d3.nest()
              .key(function(n) { return n.duration[0]; })
              .map(data.notedata)
            .keys()
              .sort(d3.ascending)
      ;
      stamps.selectAll("rect")
          .data(durations, function(d) { return d; })
        .enter().append("rect")
          .attr("id", function(d) { return "note-" + d; })
          .attr("rx", noteHeight / 2)
          .attr("ry", noteHeight / 2)
          .attr("height", noteHeight)
          .attr("width", function(d) { return x(+d); })
          .attr("vector-effect", "non-scaling-stroke")
      ;
      stamps.exit().remove();
  } // stampify()

  function boxify(notes) {
      pitches = d3.extent(notes.map(function(d) { return d.pitch.b7; }));
      times = [notes[0], notes[notes.length - 1]];
  } // boxify()

  /*
  ** API - Getter/Setter Fynctions
  */
  my.x = function(_) {
      if(!arguments.length) return x;
      x = _;
      return my;
    } // my.x()
  ;
  my.y = function(_) {
      if(!arguments.length) return y;
      y = _;
      return my;
    } // my.y()
  ;
  my.defs = function(_) {
      if(!arguments.length) return stamps;
      stamps = _.select("#notestamps");
      return my;
    } // my.stamps()
  ;
  my.bbox = function() {
      return [
          times[0].starttime[0]
        , pitches[0]
        , times[1].starttime[0] + times[1].duration - times[0].starttime[0]
        , pitches[1] - pitches[0]
      ];
    } // my.bbox()
  ;
  my.startTimeAccessor = function(_) {
      if(!arguments.length) return startTimeAccessor;
      startTimeAccessor = _;
      return my;
    } // my.startTimeAccessor()
  ;
  my.durationAccessor = function(_) {
      if(!arguments.length) return durationAccessor;
      durationAccessor = _;
      return my;
    } // my.durationAccessor()
  ;
  // This is ALWAYS the last thing returned
  return my;
} // Score()
