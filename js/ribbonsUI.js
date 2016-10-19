function RibbonsUI(){
    /*
    ** Private Variables
    */
    var div
      , labelText = "Show Ribbons"
      , showRibbons = true
      , ribbonMode = Ribbon.STANDARD_DEVIATION
      , modes = [
          {
              label: "&#963;"
            , name: "Standard Deviation"
            , mode: Ribbon.STANDARD_DEVIATION
          },
          {
              label: "&#961;"
            , name: "Attack Density"
            , mode: Ribbon.ATTACK_DENSITY
          }
        ]
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my() {
        var form = div.selectAll("div").data([1]);
        var formEnter = form.enter().append("div");

        formEnter.append("div")
            .attr("class", "ribbon-checkbox checkbox");
        formEnter.append("div")
            .attr("class", "ribbon-radio-buttons");

        form = formEnter.merge(form);

        /**
         * Checkbox
         */
        var checkboxContainer = form.select(".ribbon-checkbox");
        var label = checkboxContainer.selectAll("label").data([1])
          .enter().append("label")
        ;
        label
            .attr("class", "btn btn-primary btn-sm")
          .append("input")
            .attr("type", "checkbox")
            .property("checked", showRibbons)
            .on("change", function (e){
                showRibbons = this.checked;
                dispatch.call("showRibbons", this, showRibbons);
                my();
              })
        ;
        label
          .append("span")
            .text(labelText)
        ;

        /**
         * Radio Buttons
         */
        var radioContainer = form.select(".ribbon-radio-buttons")
            .attr("class", "btn-group")
            .attr("data-toggle", "buttons")
        ;

        var radioLabel = radioContainer.selectAll("label")
            // Hide the radio buttons if the "show ribbons"
            // box is not checked.
            .data(showRibbons ? modes : []);

        radioLabel.exit().remove();

        var radioLabelEnter = radioLabel
            .enter().append("label")
              .attr("class", "btn btn-sm btn-primary")
              .classed("active", function (d, i){
                  return d.mode === ribbonMode;
                })
          , inputs = radioLabelEnter
              .append("input")
                .attr("type", "radio")
                .attr("name", "ribbon-mode-group")
                .property("checked", function(d, i) {
                    return d.mode === ribbonMode;
                  })
          , spans = radioLabelEnter
              .append("span")
                .html(function (d){ return d.label; })
        ;
        inputs.on("click", function (d){
            var self = this;
            ribbonMode = d.mode;
            radioContainer.selectAll("label")
                .classed("active", function(e) {
                    return this === self.parentNode;
                  })
            ;
            dispatch.call("ribbonMode", self, ribbonMode);
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
} // RibbonsUI()
