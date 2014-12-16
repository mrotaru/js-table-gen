$( document ).ready(function() {

    var data = window.statsCompareData;

    var tableGenerator = new TableGenerator();

    // insert table into dom
    $('#data').append(tableGenerator.makeTable(data));
});
