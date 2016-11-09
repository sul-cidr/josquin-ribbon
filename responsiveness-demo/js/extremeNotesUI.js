function ExtremeNotesUI(){
    /*
    ** Private Variables
    */
    var div
      , labelTextExtremes = "Show Extreme Notes"
      , labelTextNotes = "Show Notes"
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

        // Checkbox for showing/hiding all notes.
        checkbox(form, labelTextNotes, function (checked){
            if(arguments.length){
                dispatch.call("notes", this, checked);
            } else {
                // Initial value is true.
                return true;
            }
        });

        // Checkbox for showing/hiding extreme notes.
        checkbox(form, labelTextExtremes, function (checked){
            if(arguments.length){
                dispatch.call("extremes", this, checked);
            } else {
                // Initial value is true.
                return true;
            }
        });

    } // my() - Main Function Object

    function checkbox(form, labelText, accessor){
        var label = form
          .append("label")
            .attr("class", "btn btn-sm btn-default")
            .classed("active", true)
        ;
        label
          .append("input")
            .attr("type", "checkbox")
            .property("checked", true)
            .on("change ", function (e){
                accessor(this.checked);
                label.classed("active", this.checked);
              })
        ;
        label
          .append("span")
            .text(" " + labelText)
        ;
    }

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
