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
              label: "Standard Deviation"
              , mode: Ribbon.STANDARD_DEVIATION
            }
          , {
              label: "Attack Density"
              , mode: Ribbon.ATTACK_DENSITY
            }
          ]
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my() {
        var cbform = div.select(".panel-body").selectAll("div").data([1])
          , cbformEnter = cbform.enter().append("div")
                .attr("class", "ribbon-checkbox checkbox")
        ;
        cbform = cbformEnter.merge(cbform);

        /**
         * Checkbox
         */
        var label = cbform.selectAll("label").data([1])
              .enter().append("label")
        ;
        label
            .attr("class", "btn btn-default btn-sm")
          .append("input")
            .attr("type", "checkbox")
            .property("checked", showRibbons)
            .on("change", function (e){
                showRibbons = this.checked;
                dispatch.call("showRibbons", this, showRibbons);
                label.classed("active", showRibbons);
                my();
              })
        ;
        label
          .append("span")
            .text(" " + labelText)
        ;

        /**
         * Radio Buttons
        **/
        var rdform = div.select(".panel-footer").selectAll("div").data([1])
          , rdformEnter = rdform.enter().append("div")
                .attr("class", "ribbon-radio-buttons")
                .classed("btn-group", true)
                .attr("data-toggle", "buttons")
        ;
        rdform = rdformEnter.merge(rdform);
        // Hide the radio buttons if the "show ribbons" box is not checked.
        rdform.style("display", showRibbons ? null : "none");

        var radioLabel = rdform.selectAll("label")
              .data(modes);

        var radioLabelEnter = radioLabel
            .enter().append("label")
              .attr("class", "btn btn-sm btn-default")
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
        radioLabel = radioLabelEnter.merge(radioLabel);

        inputs.on("click", function (d){
            var self = this;
            ribbonMode = d.mode;
            radioLabel
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
