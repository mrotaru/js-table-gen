$( document ).ready(function() {

    var data = window.statsCompareData;
//    console.log('data: ', data);

    var tableGenerator = new TableGenerator();
    var xprops = [];
    for (var i=0; i < data.length; ++i) {
        xprops = tableGenerator.extractXProps(data[i],xprops);
    }

//    console.log('extracted props: ');
//    console.dir(xprops);

    if(!data.length >= 1) {
        return;
    }

    // build table header
    function buildHeader(layeredXProps){
        var $thead = $('<thead></thead>');
        for (var i=0; i < layeredXProps.length; ++i) {

            var $tr = $('<tr></tr>');
            for(var j=0; j < layeredXProps[i].length; ++j){
                var prop = layeredXProps[i][j];
                var colspan = prop.hasOwnProperty('span' ) ? prop.span.toString() : "1";
                var rowspan = prop.hasOwnProperty('depth') ? prop.depth.toString() : "1";
                var name = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
                var str = '<th colspan="' + colspan + '" rowspan="' + rowspan + '">' + name + '</th>';
                console.log(str);
                $tr.append(str);
            }

            $thead.append($tr);
        }
        return $thead;
    }

    var layeredXProps = tableGenerator.layerXProps(xprops);
    var $table = $('<table class="table"></table>');
    $table.append(buildHeader(layeredXProps));


    var $tbody = $('<tbody></tbody>');
    // each item
//    _(data).each(function(item){
//        $tr = $('<tr></tr>');
//        // each property
//        _(xprops).each(function(prop){
//            if(typeof(prop) === 'string'){
//                $tr.append( '<td>' + item[prop] + '</td>' );
//            } else {
//                var mPropName = Object.keys(prop)[0];
//                _(prop[mPropName]).each(function(nestedProp){
//                    $tr.append( '<td>' + item[mPropName][nestedProp] + '</td>' );
//                });
//            }
//        });
//        $tbody.append($tr);
//    });
    $table.append($tbody);

    // insert table into dom
    $('#data').append($table);
});
