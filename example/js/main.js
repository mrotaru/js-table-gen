$( document ).ready(function() {

    var data = window.statsCompareData;

    var tableGenerator = new TableGenerator({
        flatten: ['/damage/swing','/damage/thrust']
    });

    // insert table into dom
    $('#data').append(tableGenerator.makeTable(data));
});
