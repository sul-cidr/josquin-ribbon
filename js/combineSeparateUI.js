function CombineSeparateUI(){
    /*
    ** Private Variables
    */
    var form
      , data = ["Combine", "Separate"]
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
                .attr("class", "radio-inline")
          , inputs = labels
              .append("input")
                .attr("type", "radio")
                .attr("name", "combine-separate-group")
                .property("checked", function(d, i) { return !i; })
          , spans = labels
              .append("span")
                .text(function (d){ return " " + d + " "; })
        ;
        inputs.on("click", function (e){
            dispatch.separate(e == "Separate");
        });
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
} // CombineSeparateUI()
