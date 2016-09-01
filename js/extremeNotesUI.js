function ExtremeNotesUI(){
    /*
    ** Private Variables
    */
    var form
      , data = ["Show Extreme Notes"]
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my(sel) {
        form = sel
          .append("form")
            .attr("class", "form")
        ;
        var labels = form.selectAll("label")
                .data(data)
              .enter().append("label")
          , inputs = labels
              .append("input")
                .attr("type", "checkbox")
                .property("checked", true)
          , spans = labels
              .append("span")
                .text(function (d){ return " " + d + " "; })
        ;
        inputs.on("click", function (e){
            dispatch.extremes(this.checked);
          })
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
    // ALWAYS return this last
    return my;
} // ExtremeNotesUI()
