var glyphids = d3.range(910, 920).map(function(n) { return "uniE" + n; })

d3.select("#upload-input").on("click", function() {
	d3.select("#hidden-file-upload").node().click();
});

d3.select("#hidden-file-upload").on("change", function() {
	var URL = window.URL || window.webkitURL;
	d3.queue()
		.defer(d3.xml, URL.createObjectURL(this.files[0]))
		.await(chartify)
	;

});

function chartify(error, data) {
		var srcsvg = d3.select(data).select("svg")
			, tgtsvg = d3.select("body").append("svg")
						.attr("class", "todownload")
						.style("display", "none")
		;

		var defs = srcsvg.select("defs")
			, license = srcsvg.select("metadata").text()
		;
		tgtsvg.selectAll("symbol")
				.data(glyphids, function(d) { return d; })
			.enter().append("symbol")
				.attr("id", function(d) { return d; })
				.each(function(d, i) {
						var self = d3.select(this)
							, src = srcsvg.select("glyph[glyph-name='" + d + "']")
							, shape = src.attr("d")
							, path = self.append("path")
										.attr("d", shape)
										.attr("transform", src.attr("transform"))
							, vb = d3.values(path.node().getBBox()).map(Math.round).join(' ')
						;
						console.log(src.attr("transform"), src)
						self
								.attr('viewBox', vb)
					})
		;
		d3.select("textarea").text(d3.select("body>svg").node().outerHTML)
		console.log(tgtsvg);
} // chartify()
