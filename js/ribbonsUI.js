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
            label: "Standard Deviation",
            mode: Ribbon.STANDARD_DEVIATION
          },
          {
            label: "Attack Density",
            mode: Ribbon.ATTACK_DENSITY
          }
        ]
      , dispatch
    ;
    /*
    ** Main Function Object
    */
    function my() {
        var form = div.selectAll("form").data([1]);
        var formEnter = form.enter().append("form");

        formEnter.append("div")
            .attr("class", "ribbon-checkbox");
        formEnter.append("div")
            .attr("class", "ribbon-radio-buttons");

        form = formEnter.merge(form);
        
        /**
         * Checkbox
         */
        var checkboxContainer = form.select(".ribbon-checkbox");
        var label = checkboxContainer.selectAll("label").data([1]);
        var labelEnter = label.enter().append("label");

        labelEnter
          .append("input")
            .attr("type", "checkbox")
            .property("checked", showRibbons)
            .on("click", function (e){
                showRibbons = this.checked;
                dispatch.call("showRibbons", this, showRibbons);
                my();
              })
        ;
        labelEnter
          .append("span")
            .text(" " + labelText)
        ;

        /**
         * Radio Buttons
         */
        var radioContainer = form.select(".ribbon-radio-buttons");

        var radioLabel = radioContainer.selectAll("label")
            // Hide the radio buttons if the "show ribbons"
            // box is not checked.
            .data(showRibbons ? modes : []);

        radioLabel.exit().remove();

        var radioLabelEnter = radioLabel
            .enter().append("div").append("label")
        var inputs = radioLabelEnter
              .append("input")
                .attr("type", "radio")
                .attr("name", "ribbon-mode-group")
                .property("checked", function(d, i) {
                  return d.mode === ribbonMode;
                })
          , spans = radioLabelEnter
              .append("span")
                .text(function (d){ return " " + d.label + " "; })
        ;
        inputs.on("click", function (d){
            ribbonMode = d.mode;
            dispatch.call("ribbonMode", this, ribbonMode);
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
