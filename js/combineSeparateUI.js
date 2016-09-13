function CombineSeparateUI(){
    /*
    ** Private Variables
    */
    var div
      , data = ["Combine", "Separate"]
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
            dispatch.call("separate", this, e == "Separate");
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
    my.div = function (value){
        if(arguments.length === 0) return div;
        div = value;
        return my;
      } // my.div()
    ;
    // ALWAYS return this last
    return my;
} // CombineSeparateUI()
