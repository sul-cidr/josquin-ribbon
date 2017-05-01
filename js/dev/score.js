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
      boxify(data.notedata);

      var svg = sel.select(".notes");
      if(!svg.size()) svg = sel.append("g").attr("class", "notes");

      svg
        .attr("data-bbox", my.bbox())
      ;
      svg.selectAll(".note").remove(); // Clear out all existing notes

      var note = svg.selectAll(".note")
          .data(
                function(d) { return d.notedata; }
              , function(d) { return d.starttime[0]; }
            )
      ;
      note.exit().remove();

      var noteHeight = y.bandwidth();

      var noteEnter = note.enter()
        .append("rect")
          .attr("class", "note")
          .attr("x", function(d) { return x(startTimeAccessor(d)); })
          .attr("y", function(d) { return y(d.pitch.b7); })
          .attr("rx", noteHeight / 2)
          .attr("ry", noteHeight / 2)
          .attr("height", noteHeight)
          .attr("width", function(d) { return x(durationAccessor(d)); })
          .classed("extreme-plain", function(d) {
              return ~pitches.indexOf(d.pitch.b7);
            })
      ;

      noteEnter.append("title")
        .merge(note.select("title"))
        .text(function (d){
            return d.pitch.name + " : " + d.duration + " beats" + " (" + data.voice + ")";
        });

  } // my()

  /*
  ** Helper Functions
  */
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
