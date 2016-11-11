function RibbonsUI(){
    /*
    ** Private Variables
    */
    var div
      , toggle = {
              label: "Toggle Ribbons"
            , icon: "bookmark"
            , callback: "toggleRibbons"
          }
      , flyout = [
              {
                  label: "Standard Deviation"
                , icon: "tune"
                , callback: "ribbonMode"
              }
            , {
                  label: "Attack Density"
                , icon: "multiline_chart"
                , callback: "ribbonMode"
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
        if(arguments.length === 0) return div;
        div = value;
        return my;
      } // my.div()
    ;
    // ALWAYS return this last
    return my;
} // RibbonsUI()
