function ToggleUI() {
    /*
    ** Private Variables
    */
    var dispatch;

    /*
    ** Main Function Object
    */
    function my(sel) {
        sel.selectAll(".mdl-switch")
            .data(function(d) { return d; })
          .enter().append("label")
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
                , options = d3.entries(d.options)
              ;
              if(d.icon) {
                  label.append("i")
                      .attr("class", "material-icons")
                      .text(d.icon)
                  ;
              } else if(options.length) {
                  label.append("select")
                      .attr("disabled", "disabled")
                      .on("change", function() {
                          dispatch.call(d.callback, this, this.value);
                        })
                    .selectAll("option")
                      .data(options, function(o) { return o.key; })
                    .enter().append("option")
                      .attr("default", function(d, i) { return !i; }) // 1st
                      .attr("value", function(o) { return o.key; })
                      .text(function(o) { return o.value; })
                  ;
              }
              componentHandler.upgradeElement(sel.select(".mdl-switch").node());
              check
                  .on("change", function() {
                      var checked = this.checked
                        , node = label.select("select").node()
                        , value = checked && node
                                ? node.value
                                : checked
                      ;
                      if(options.length) {
                          label.select("select")
                              .attr("disabled", checked ? null : "disabled")
                          ;
                      }
                      dispatch.call(d.callback, this, value);
                    })
              ;
            })
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
