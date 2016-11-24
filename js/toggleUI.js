function ToggleUI() {
    /*
    ** Private Variables
    */
    var dispatch;

    /*
    ** Main Function Object
    */
    function my(sel) {
        var toggle = sel.selectAll(".mdl-switch")
                .data(function(d) { return d; })
        ;
        toggle.enter()
          .append("label")
            .attr("class", "mdl-switch mdl-js-switch")
            .attr("for", function(d, i) { return "switch-" + d.callback; })
            .each(function(d, i) {
                var self = d3.select(this)
                  , check = self.append("input")
                        .attr("type", "checkbox")
                        .attr("id", "switch-" + d.callback)
                        .attr("class", "mdl-switch__input")
                  , label = self.append("span")
                        .attr("class", "mdl-switch__label")
                ;
                if(d.icon) {
                    label.append("i")
                        .attr("class", "material-icons")
                        .text(d.icon)
                    ;
                }
                componentHandler.upgradeElement(sel.select(".mdl-switch").node());
                check
                    .on("change", function() {
                        dispatch.call(d.callback, this, this.checked);
                      })
                ;
              })
            .merge(toggle)
        ;
    } // Main Function Object

    /*
    ** API: Getter/Setter Functions
    */
    my.connect = function(_) {
        if(!arguments.length) return dispatch;
        dispatch = _;
        return my;
      } // my.connect()
    ;
    // This is always the LAST thing returned
    return my;
} // ToggleUI()
