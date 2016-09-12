function ExtremeNotesUI(){
    /*
    ** Private Variables
    */
    var div
      , labelText = "Show Extreme Notes"
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my() {
        var form = div.selectAll("form").data([1]);
        form = form.enter().append("form")
            .attr("class", "form")
          .merge(form)
        ;
       
        var label = form.append("label");
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
            .text(" " + labelText)
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
        if(arguments.length === 0) return div;
        div = value;
        return my;
      } // my.div()
    ;
    // ALWAYS return this last
    return my;
} // ExtremeNotesUI()
