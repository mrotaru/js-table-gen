$( document ).ready(function() {

    var data = window.statsCompareData;
    console.log('data: ', data);

    var tableGenerator = new TableGenerator();
    var props = [];
    for (var i=0; i < data.length; ++i) {
        props = tableGenerator.extractXProps(data[i],props);
    }

    console.log('extracted props: ');
    console.dir(props);

    if(!data.length >= 1) {
        return;
    }

    var $table = $('<table class="table"></table>');

    // number of columns
    var nrCols = 0;

    function getPropsOnDepth(xprop, depth){
        if(depth === 0) {
            return xprops;
        }

        if((depth > 0 && !xprop.hasOwnProperty('properties')) || depth < 0){
            return null;
        }

        for (var i=0; i < xprop.properties.length; ++i) {
            
        }
    }

    // build table header
    // done in two or more passes
    // 1. build row from top level props. But we need `colspan`
    var $thead = $('<thead></thead>');
    function buildHeader(xprops){
        var recurse = false;
        var $tr = $('<tr></tr>');
        for(var i=0; i < props.length; ++i){
            var prop = xprops[i];
            $tr.append('<th colspan="' + tableGenerator.getNrOfEdgeProps(prop) + '">' + prop.name + '</th>');
            if(prop.hasOwnProperty('properties')){
                recurse = true;
            }
            if(recurse){
            }
        }
        $thead.append($tr);
    }

        if(typeof(props[i]) === 'string'){
        } else {
            var propName = Object.keys(props[i]);
            $tr.append('<th colspan="' + props[i][propName].length + '">' + propName + '</th>');
            $thead.append($tr);
        }
    }

    console.log('nrCols: ', nrCols);

    // create the second row
    if(needSecondRow) {
        var $tr = $('<tr></tr>')
        _(props).each(function(prop){
            if(typeof(prop) === 'object') {
                // sould be an array
                _(prop[Object.keys(prop)[0]]).each(function(nestedProp){
                    console.log('nestedProp: ', nestedProp);
                    $tr.append('<th>' + nestedProp + '</th>');
                });
            } else {
                $tr.append("<td></td>");
            }
        });
        $thead.append($tr);
    }

    $table.append($thead);

    var $tbody = $('<tbody></tbody>');
    // each item
    _(data).each(function(item){
        $tr = $('<tr></tr>');
        // each property
        _(props).each(function(prop){
            if(typeof(prop) === 'string'){
                $tr.append( '<td>' + item[prop] + '</td>' );
            } else {
                var mPropName = Object.keys(prop)[0];
                _(prop[mPropName]).each(function(nestedProp){
                    $tr.append( '<td>' + item[mPropName][nestedProp] + '</td>' );
                });
            }
        });
        $tbody.append($tr);
    });
    $table.append($tbody);

    // insert table into dom
    $('#data').append($table);
});
