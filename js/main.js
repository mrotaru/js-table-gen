$( document ).ready(function() {

    // IE8 and below do not have indexOf
    // ---------------------------------
    var indexOf = function(needle) {
        if(typeof Array.prototype.indexOf === 'function') {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function(needle) {
                var i = -1, index = -1;

                for(i = 0; i < this.length; i++) {
                    if(this[i] === needle) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call(this, needle);
    };

    function getOwnProps(obj){
        var ret = [];
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                ret.push(name);
            }
        }
        return ret;
    }

    // extract all possible properties from an array of objects
    // --------------------------------------------------------
    // data can have max 1 nesting
    function buildProps(data){
        var props = [];
        for(var i=0; i< data.length; ++i){
            if(typeof(data[i]) !== 'object') {
                continue
            } else {
                var item = data[i];
                for (var propName in item) {

                    var i2 = indexOf.call(props, propName);
                    if(i2 != -1) {
                        if(typeof(props[i2]) === 'string') {
                            // we already listed this property
                            continue
                        }
                    }

                    // properties can be strings or objects
                    var currVal = item[propName];
                    if(typeof(currVal) === 'string'){
                        props.push(propName);
                    } else if(typeof(currVal) === 'object'){

                        var currItemProps = buildProps([currVal]);
                        var found = false;
                        for(var _i = 0; _i < props.length; ++_i){
                            // if property is an object - check if already listed
                            if(typeof(props[_i]) === 'object' && props[_i].hasOwnProperty(propName)) {
                                props[_i][propName] = _.union(props[_i][propName], currItemProps)
                                found = true;
                            }
                        }
                        if(!found) {
                            var ret = {};
                            ret[propName] = currItemProps;
                            props.push(ret);
                        }
                    } else {
                        throw("type not supported");
                    }
                }
            }
        }
        console.log('built props: ', props);
        return props;
    }

    var data = window.statsCompareData;
    console.log(data);

    if(!data.length >= 1) {
        return;
    }

    // array: each item is a string or another array (nested props)
    var props = buildProps(data);
//    var props = getOwnProps(data[0]);
    console.log(props);

    var $table = $('<table class="table"></table>');

    // number of columns
    var nrCols = 0;
    for(var i=0; i < props.length; ++i){
        if(typeof(props[i]) === 'string') {
            nrCols++;
        } else if (typeof(props[i]) === 'object') {
            var keys = Object.keys(props[i]);
            console.log(keys);

            nrCols += props[i][keys[0]].length;
        }
    }
    console.log('nrCols: ', nrCols);

    // is second row needed ? for nested properties
    var needSecondRow = false;
    _(props).each(function(prop){
        if(typeof(p) === 'object') {
            needSecondRow = true;
        }
    });

    // build table header - first row
    var $thead = $('<thead></thead>');
    var $tr = $('<tr></tr>');
    for(var i=0; i < props.length; ++i){
        if(typeof(props[i]) === 'string'){
            $tr.append( '<th>' + props[i] + '</th>' );
            $thead.append($tr);
        } else {
            var propName = Object.keys(props);
            console.log(props);
            $tr.append('<th colspan="' + keys.length + '">' + propName + '</th>');
            $thead.append($tr);
        }
    }

    // create the second row
    if(needSecondRow) {
        var $tr = $('<tr></tr>')
        _(props).each(function(prop){
            if(typeof(prop) === 'object') {
                // sould be an array
//                $
            } else {
                $tr.append("<td></td>");
            }
        });
    }

    $table.append($thead);

    // each item
    var $tbody = $('<tbody></tbody>');
    for(var i=0; i< data.length; ++i){
        $tr = $('<tr></tr>');
        for(var j=0; j < props.length; ++j){
            var propName = props[j];
            $tr.append( '<td>' + data[i][propName] + '</td>' );
        }
        $tbody.append($tr);
    }
    $table.append($tbody);

    // insert table into dom
    $('#data').append($table);
});
