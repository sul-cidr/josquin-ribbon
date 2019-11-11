/* exported prettifyXml */
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
