/* exported prettifyXml, cleanSvg */
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

  // Remove most style attributes
  svg.removeAttribute("style");
  var selectors = [
    "svg", "g:not(.ribbon)", "path", "defs", "symbol", "use",
    "title", "desc", "line", "text"];
  selectors.forEach(function(selector) {
    svg.querySelectorAll(selector).forEach(function(elem) {
      elem.removeAttribute("style");
    });              
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
} 
