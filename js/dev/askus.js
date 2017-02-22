function askus() {
    /* Private Variables */
    var dom
      , name
      , buttons = { all: null, pick: null }
      , dropdown
      , dispatch // button click callback sent by caller
      , value
    ;

    // Main Function Object
    function widget(el) {
        dom = el;
        buttons.all = dom.select(".choice-all");
        buttons.pick = dom.select(".choice-pick");
        dropdown = buttons.pick.select("select");
        name = dom.attr("id").split("-")[1];
        buttons.all
            .on("click", function() {
                value = "all";
                dom.select(".choice-pick select").selectAll("option")
                    .property("selected", function(d, i) { return !i; })
                ;
                dispatch.call("ribbons", this, value);
              })
        ;
        buttons.pick
            .on("click", function() {
                var val = d3.select(this).select("input").node().value;
                if(!dropdown.node().value) {
                    dropdown.selectAll("option:enabled")
                        .property("selected", function(d, i) {
                            return !val
                              ? i === 1 // first option
                              : d.key === val // set it to what it was last time
                            ;
                          })
                      ;
                      dropdown.each(function(d, i) {
                          d3.select(this).on("change").apply(this, [d, i]);
                        })
                      ;
                }
              })
        ;
        dropdown
            .on("change", function() {
                value = this.value;
                d3.select(this.parentNode).select("input")
                    .node()
                    .value = value
                ;
                console.log(value);
                dispatch.call("ribbons", this, value);
              })
        ;
    } // main function object

    /*
     * API Getters/Setters
     */
    widget.connect = function(arg) {
      if(!arguments.length) return dispatch;

        dispatch = arg;
        return widget;
      } // widget.connect()
    ;
    widget.choices = function(arg) {
        if(!arguments.length)
            return dropdown.selectAll("option").data();

        populate(arg);
        return widget;
      } // widget.choices()
    ;
    widget.reset = function() {
        buttons.all.node().click();

        return widget;
      } // widget.reset()
    ;
    widget.value = function(arg) {
        if(!arguments.length)
          return value
        ;
        if(arg === "all" || arg === "")
            buttons.all.node().click()
        ;
        if(arg === "") {}

        else {
            dropdown.selectAll("option")
                .property("selected", function(d, i) {
                    return ~d.key.indexOf(arg) || !i;
                  })
            ;
            if(dropdown.node().value) {
                dropdown.each(function(d, i) {
                    d3.select(this).on("change").apply(this, [d, i]);
                  })
                ;
                buttons.pick.node().click();
            }
            else {
                buttons.all.node().click()
            }
        }
        return widget;
      } // widget.value()
    ;
    // This is ALWAYS the last thing returned
    return widget;
} // askus()
