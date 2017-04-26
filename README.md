# josquin-ribbon

This project is about visualizing Renaissance music curated and digitized as part of the [Josquin Research Project](http://josquin.stanford.edu/about/).

[Try it out!](https://sul-cidr.github.io/josquin-ribbon/)

[![image](https://cloud.githubusercontent.com/assets/68416/23161307/a61af460-f84f-11e6-8ed6-152d86650eac.png)](https://sul-cidr.github.io/josquin-ribbon/)

The visualization methods here are geared towards music researchers who are interested in analyzing the music. All notes of a given piece are presented, colored by voice. A navigational interface for zooming and panning using brushing is provided, making use of the "focus plus context" information visualization pattern.

By default, voices are all displayed together such that their Y position is represented by pitch. It is also possible to "split" the display, much like a musical score, such that each voice is separated into its own lane. This feature, in combination with zooming, allows you to visualize any part of a piece, focusing on either the whole collection of voices together, or each voice separately.

A "ribbon" view provides higher levels of analysis in addition to display of the raw notes. The ribbon shape is computed using windowed mean and standard deviation of pitch. The width of the ribbon gives a sense of how much the notes vary in pitch in any given window of time. The center point of the ribbon is the average pitch for the window considered. Also, an "attack density" mode is provided, in which the width of the ribbons represents the sum total of note attacks per measure.


## Running this Site

This site is organized using [Jekyll](https://jekyllrb.com/). Jekyll runs automatically on [GitHub Pages](https://pages.github.com/), which is the main deployment strategy at the moment.

To run this site on your own machine, you'll need a working [Ruby](https://www.ruby-lang.org/en/documentation/installation/) environment. (For windows, you can download and run [RubyInstaller for Windows](https://rubyinstaller.org/).  For Linux or Mac you can use [rvm](http://rvm.io)). Then use the following commands:

```
# Install Jekyll on your machine (only required once).
gem install jekyll

# Use Jekyll to serve this site.
cd josquin-ribbon
jekyll serve --watch
```

For more detailed instructions, see [Setting up your GitHub Pages site locally with Jekyll](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/).
