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
            .attr("for", function(d, i) { return "switch-" + d.key; })
            .each(function(d, i) {
                d3.select(this)
                  .append("input")
                    .attr("type", "checkbox")
                    .attr("id", "switch-" + d.key)
                    .attr("class", "mdl-switch__input")
                    .on("change", function() {
                        var ret = d.values
                              ? (this.checked ? d.values[0] : d.values[1])
                              : this.checked
                        ;
                        dispatch.call(d.key, this, ret);
                      })
                ;
                d3.select(this)
                  .append("span")
                    .attr("class", "mdl-switch__label")
                  .append("i")
                    .attr("class", "material-icons")
                    .text(d.icon)
                ;
              })
            .merge(toggle)
        ;
        componentHandler.upgradeElement(sel.select(".mdl-switch").node());
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
