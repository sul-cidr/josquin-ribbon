/* exported prettifyXml, cleanSvg, addSvgPadding */
var prettifyXml = function(sourceXml) {
  if (!XSLTProcessor) return sourceXml;
  var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
  var xsltDoc = new DOMParser().parseFromString([
    '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
    '  <xsl:strip-space elements="*"/>',
    '  <xsl:template match="para[content-style][text()]">',
    '    <xsl:value-of select="normalize-space(.)"/>',
    '  </xsl:template>',
    '  <xsl:template match="node()|@*">',
    '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
    '  </xsl:template>',
    '  <xsl:output indent="yes"/>',
    '</xsl:stylesheet>',
  ].join('\n'), 'application/xml');

  var xsltProcessor = new XSLTProcessor();    
  xsltProcessor.importStylesheet(xsltDoc);
  var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  var resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
};

var _roundValue = function(valueAsString) {
  return parseFloat(valueAsString).toFixed(5).replace(/\.?0*$/,'');
}

var cleanSvg = function(svg) {
  // Export only visible elements
  svg.querySelectorAll("[style*='display: none']").forEach(function(elem) {
    elem.remove();
  });

  // Remove empty `<text/>` nodes
  svg.querySelectorAll('text').forEach(function(textElem) {
    if (!textElem.textContent) textElem.remove()
  });

  // Remove unused symbols from `<defs/>`
  svg.querySelectorAll('defs > symbol').forEach(function(sym) {
    if (!svg.querySelector("use[*|href='#" + sym.id + "']")) sym.remove();
  });

  // Remove `<title/>` elems from notes
  svg.querySelectorAll("rect > title").forEach(function(elem) {
    elem.remove();
  });

  // Copy needed styles
  svg.querySelectorAll("g.ribbon").forEach(function(elem) {
    elem.setAttribute("fill", elem.style.fill);
    elem.setAttribute("fill-opacity", elem.style.fillOpacity);
    elem.setAttribute("stroke", elem.style.stroke);
  });   

  svg.querySelectorAll("g.notes").forEach(function(elem) {
    var firstNote = elem.querySelector("rect.note");
    elem.setAttribute("fill", firstNote.style.fill);
    elem.setAttribute("fill-opacity", firstNote.style.fillOpacity);
    elem.setAttribute("stroke", firstNote.style.stroke);
    elem.setAttribute("stroke-width", firstNote.style.strokeWidth);
  });   

  // Remove all style attributes
  svg.removeAttribute("style");
  svg.querySelectorAll("[style]").forEach(function(elem) {
    elem.removeAttribute("style");
  });   

  // Remove all class attributes
  svg.removeAttribute("class");
  svg.querySelectorAll("[class]").forEach(function(elem) {
    elem.removeAttribute("class");
  });   

  // Remove unnecessary default values
  svg.querySelectorAll("[transform='translate(0,0)']").forEach(function(elem) {
    elem.removeAttribute("transform");
  });   
  svg.querySelectorAll("[fill='none']").forEach(function(elem) {
    elem.removeAttribute("fill");
  });   
  svg.querySelectorAll("[opacity='1']").forEach(function(elem) {
    elem.removeAttribute("opacity");
  });
  svg.querySelectorAll("[text-anchor='middle']").forEach(function(elem) {
    elem.removeAttribute("text-anchor");
  });

  // Limit `x` and `width` attributes to a maximum of 5 decimal places
  svg.querySelectorAll("[x]").forEach(function(elem) {
    elem.setAttribute("x", _roundValue(elem.getAttribute("x")));
  });
  svg.querySelectorAll("[width]").forEach(function(elem) {
    elem.setAttribute("width", _roundValue(elem.getAttribute("width")));
  });
} 

var addSvgPadding = function(svg, hPad=50, vPad=100) {
  // svg.querySelectorAll(':scope > svg') // ← no IE or Edge support :(
  svg.querySelectorAll("[xmlns] > svg").forEach(function(elem) {
    elem.setAttribute("overflow", "visible");
    elem.setAttribute("x", "25");
    elem.setAttribute("y", "50");
    elem.setAttribute("width", svg.width.baseVal.value);
  })
  svg.setAttribute("width", svg.width.baseVal.value + hPad);
  svg.setAttribute("height", svg.height.baseVal.value + vPad);
}
