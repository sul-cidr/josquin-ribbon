[Statement of Work](https://docs.google.com/document/d/1aKLa1YcAJ7aMMCivqho-x6LtLYGSMkR4gbgTTTpcpi8/edit)

The program `hum2xml` was downloaded from http://extras.humdrum.org/man/hum2xml/ . It converts scores from Humdrum format to MusicXML. This command converts a sample score and outputs the XML file:

`./hum2xml Jos0302c-Missa_Da_pacem-Credo.krn > Jos0302c-Missa_Da_pacem-Credo.xm
l`

After installing the command line tool [musicjson]() with the command `npm install -g musicjson`, the following command can convert a .krn file into a .json file:

`./hum2xml Jos0302c-Missa_Da_pacem-Credo.krn | musicjson -j -i > Jos0302c-Missa_Da_pacem-Credo.json`

This method removes the voice names, and we are left with all parts named as "vox".

Alternative approach - use the API

`curl -o Jos2721-La_Bernardina.json http://josquin.stanford.edu/cgi-bin/jrp?a=proll-json&f=Jos2721-La_Bernardina`

This looks like it gives nice data for notes.
