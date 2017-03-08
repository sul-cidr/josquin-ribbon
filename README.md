# josquin-ribbon

This project is about visualizing Renaissance music curated and digitized as part of the [Josquin Research Project](http://josquin.stanford.edu/about/).

[Try it out!](https://sul-cidr.github.io/josquin-ribbon/)

[![image](https://cloud.githubusercontent.com/assets/68416/23161307/a61af460-f84f-11e6-8ed6-152d86650eac.png)](https://sul-cidr.github.io/josquin-ribbon/)

The visualization methods here are geared towards music researchers who are interested in analyzing the music. All notes of a given piece are presented, colored by voice. A navigational interface for zooming and panning using brushing is provided, making use of the "focus plus context" information visualization pattern.

By default, voices are all displayed together such that their Y position is represented by pitch. It is also possible to "split" the display, much like a musical score, such that each voice is separated into its own lane. This feature, in combination with zooming, allows you to visualize any part of a piece, focusing on either the whole collection of voices together, or each voice separately.

A "ribbon" view provides higher levels of analysis in addition to display of the raw notes. The ribbon shape is computed using windowed mean and standard deviation of pitch. The width of the ribbon gives a sense of how much the notes vary in pitch in any given window of time. The center point of the ribbon is the average pitch for the window considered. Also, an "attack density" mode is provided, in which the width of the ribbons represents the sum total of note attacks per measure.
