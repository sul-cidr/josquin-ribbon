function RibbonsUI(){
    /*
    ** Private Variables
    */
    var div
      , labelText = "Show Ribbons"
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
            .property("checked", true)
            .on("click", function (e){
                dispatch.call("showRibbons", this, this.checked);
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
                .data(modes)
              .enter().append("div").append("label")
          , inputs = radioLabel
              .append("input")
                .attr("type", "radio")
                .attr("name", "ribbon-mode-group")
                .property("checked", function(d, i) { return !i; })
          , spans = radioLabel
              .append("span")
                .text(function (d){ return " " + d.label + " "; })
        ;
        inputs.on("click", function (d){
            dispatch.call("ribbonMode", this, d.mode);
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
