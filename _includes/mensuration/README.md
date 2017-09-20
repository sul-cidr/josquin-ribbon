
Mensuration symbols
===================


| File | Description |
|------|-------------|
| [Makefile](Makefile)			|	Creates `mensuration.symbol` file from `../../doc/mensuration-sampler *.svg` files	|
| [README.md](README.md)			|	This file	|
| [makemensuration](makemensuration)		|	PERL script to extract symbols and place in `mensuration.symbol` file  (used by [Makefile](Makefile))	|
| [mensuration-old.symbol](mensuration-old.symbol)	|	Old mensuration symbols (does not include compound mensuration symbols)	|
| [mensuration.symbol](mensuration.symbol)		|	Automatically generated mensuration symbol list created by typing `make` on the command-line.	|


Maintenance
===========

To add a new mensuration symbol to the list, create a file for that 
mensuration sign in the `../../doc/mensuration-sampler` page, and also 
add it to the HTML page for that directory.  Then in this directory 
type `make` to update the file `mensuration.symbol`.  This file is included
in `../../index.html` for use in the ribbon plotter on that page.


Mensuration IDs
===============

Mensuration symbol IDs are based on their names in the JSON proll files, which
in turn are the names of the mensuration signs in the source Humdrum 
files.  Use the following javascript code to convert a JSON mensuration tag
string into a mensuration symbol ID:

```javascript
var menid = mentag.replace(/^C/g, "c")
	.replace(/^O/g, "o")
	.replace(/r/g, "-reverse")
	.replace(/\//g, "-over")
	.replace(/\|/g, "-pipe")
	.replace(/\./g, "-dot")
	.replace(/(\d+)/g, "-$1")
	.replace(/^-/, "n");
```


For example, "`C|r`" will be transformed into the mensuration symbol 
ID `c-pipe-reverse`.


Example symbol
===============


Here is the example entry for the Circle mensuration:

```svg
	<symbol id="o" viewBox="0 0 1000 1000" overflow="inherit">
		<title> Circle mensuration </title>
		<desc> SMUFL codepoint E911. </desc>
		<path transform="scale(1,-1)" 
			d="M266 -266c-70 0 -137 28 -187 78s-78 117 -78 188c0 70 28 137 78 187s117 78 187 78c71 0 138 -28 188 -78s78 -117 78 -187c0 -71 -28 -138 -78 -188s-117 -78 -188 -78zM266 217c-58 0 -112 -23 -153 -64s-64 -95 -64 -153s23 -113 64 -154s95 -64 153 -64 s113 23 154 64s64 96 64 154s-23 112 -64 153s-96 64 -154 64z" 
		/> 
	</symbol>
```

Each symbol contains a `<title>` describing the mensuration, as well as a 
`<desc>` which lists the SMUFL glyphs used to construct the mensuration.  The 
symbols for "8" and "6" are not available in SMUFL, so these are currently 
hacked.


