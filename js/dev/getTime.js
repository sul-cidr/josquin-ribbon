// Returns the time for a given object.
// Uses timesec if available, otherwise falls back to time[0].
function getTime(d) {
    if(d.timesec !== undefined) {
        return d.timesec;
    }
    return d.time[0];
}

// Same pattern for "starttime"
getTime.start = function (d) {
    if(d.starttimesec !== undefined) {
        return d.starttimesec;
    }
    return d.starttime[0];
};

// Same pattern for "duration"
getTime.duration = function (d) {
    if(d.durationsec !== undefined) {
        return d.durationsec;
    }
    return d.duration[0];
};

// Same pattern for "scorelength"
getTime.scoreLength = function (d) {
    if(d.scorelengthsec !== undefined) {
        return d.scorelengthsec;
    }
    return d.scorelength[0];
};
