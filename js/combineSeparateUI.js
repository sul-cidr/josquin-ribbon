function CombineSeparateUI(){

    var container = d3.select("#combine-separate-ui")
      , form = container.append("form").attr("class", "form")
      , data = ["Combine", "Separate"]
      , dispatch
    ;

    var labels = form.selectAll("label").data(data)
      .enter().append("label")
        .attr("class", "radio-inline")
    ;
    labels.append("input")
        .attr("type", "radio")
        .attr("name", "combine-separate-group")
    ;
    labels.append("span")
        .text(function (d){ return " " + d + " "; })
    ;

    function my() {
    } // my()

    my.connect = function(value){
        if(!arguments.length) return dispatch;
        dispatch = value;
        return my;
      } // my.connect()
    ;

    return my;
}
