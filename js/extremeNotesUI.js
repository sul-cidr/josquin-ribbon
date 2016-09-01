function ExtremeNotesUI(){
    /*
    ** Private Variables
    */
    var labelText = "Show Extreme Notes"
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my(sel) {
        var label = sel
          .append("form")
            .attr("class", "form")
          .append("label")
        ;
        label
          .append("input")
            .attr("type", "checkbox")
            .property("checked", true)
            .on("click", function (e){
                dispatch.call("extremes", this, this.checked);
              })
        ;
        label
          .append("span")
            .text(labelText)
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
