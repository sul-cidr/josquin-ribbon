function NotesUI(){
    /*
    ** Private Variables
    */
    var div
      , toggle = {
              label: "Toggle Notes"
            , icon: "music_note"
            , callback: "toggleNotes"
          }
      , flyout = [
              {
                  label: "Combine"
                , icon: "vertical_align_center"
                , callback: "separate"
              }
            , {
                  label: "Separate"
                , icon: "format_line_spacing"
                , callback: "separate"
              }
            , {
                  label: "Show Extreme Notes"
                , icon: "library_music"
                , callback: "extremes"
              }
          ]
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my() {
        var toolbar = div.selectAll(".fixed-action-button")
            .data([toggle], function(d) { return d.label; })
        ;
        toolbar = toolbar.enter()
          .append("div")
            .attr("class", "fixed-action-button")
        ;
        toolbar
          .append("button")
            .attr("class", "mdl-button mdl-button--fab mdl-button--primary")
            .on("click", function(d) {
                var self = this;
                var vis = toolbar.select("ul").style("visibility");
                // Toggle the flyout
                toolbar.select("ul")
                    .style("visibility", vis == "visible" ? "hidden" : "visible")
                ;
                dispatch.call(d.callback, self, d.label);
              })
          .append("i")
            .attr("class", "material-icons")
            .text(function(d) { return d.icon; })
        ;
        toolbar
          .append("ul")
            .attr("class", "list-inline")
          .selectAll("li")
            .data(flyout, function(d) { return d.label; })
          .enter()
          .append("li")
          .append("button")
            .attr("class", "mdl-button mdl-button--fab mdl-button--mini-fab mdl-button--colored")
            .on("click", function(d) {
                var self = this;
                dispatch.call(d.callback, self, d.label);
              })
          .append("i")
            .attr("class", "material-icons")
            .text(function(d) { return d.icon; })
        ;
    } // my() - Main Function Object

    /*
    ** API (Getters/Setters)
    */
    my.connect = function(value){
        if(!arguments.length) return dispatch;
        dispatch = value;
        return my;
      } // my.connect()
    ;
    my.div = function (value){
        if(!arguments.length) return div;
        div = value;
        return my;
      } // my.div()
    ;
    // ALWAYS return this last
    return my;
} // NotesUI()
