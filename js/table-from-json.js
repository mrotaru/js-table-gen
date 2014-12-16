(function() {
    var root = this;

    var TableGenerator = function(){
    }

    /**
     * Return value at `path` in `obj`.
     *
     * Example:
     * 
     * search({foo: 'bar'}, 'foo') returns 'bar'
     * search({foo: 'bar'}, 'nope') returns null
     * search({foo: {bar: 'baz'}}, 'foo/bar') returns 'baz'
     */
    TableGenerator.prototype.search = function(obj,path){
        var self = this;

        var pathComponents = path.split('/');
        var firstPathComponent = pathComponents[0];
        var lastPathComponent  = pathComponents[pathComponents.length-1];

        if(obj.hasOwnProperty(firstPathComponent)) {
            if(pathComponents.length === 1){
                return obj[firstPathComponent];
            } else {
                pathComponents.splice(0,1);
                var newPath = pathComponents.join('/');
                return self.search(obj[firstPathComponent], newPath);
            }
        } else {
            return null;
        }
    }


    /**
     * Similar to `search`, it takes a `path` and object as input.
     * But the object is an array, each element being an object with:
     *  - `name` {string} name of the property (mandatory)
     *  - `properties` {array} nested properties (optional)
     *
     * An example illustrates much better:
     *
     *  extractedproperties = [ 
     *      {name: "foo"},
     *      {name: "bar", properties: [ {name: "p1"} ]
     *  ]
     *
     *  hasXProp(xprops, "/foo")          -> true
     *  hasXProp(xprops, "/foo/p1")       -> false
     *  hasXProp(xprops, "/bar")          -> true
     *  hasXProp(xprops, "/bar/p1")       -> true
     *
     *  @returns true if `path` is already in `xprops`
     *
     */
    TableGenerator.prototype.hasXProp = function(xprops, path){
        var self = this;

        var pathComponents = path.split('/');
        var firstPathComponent = pathComponents[0];

        var found = false;

        for (var i=0; i < xprops.length; ++i) {
            if(xprops[i].name === firstPathComponent){
                if(pathComponents.length === 1) {
                    return true;
                } else {
                    if(!xprops[i].hasOwnProperty("properties")){
                        return false;
                    } else {
                        pathComponents.splice(0,1);
                        var newPath = pathComponents.join('/');
                        return self.hasXProp(xprops[i].properties, newPath);
                    }
                }
            }
        }
        
        return found;
    }

    /**
     * If `obj` matches the structure described by `xprop`, return an array with each
     * property value extracted (or null, if object doesn't have it) and `path`.
     */
    function xpropVals(xprop, obj){
        var self = this;
        res = [];


        if(!xprop.hasOwnProperty('properties')){
            res.path = path + '/' + xprop.name;
            if(obj.hasOwnProperty(xprop.name)){
                res.value = obj[xprop.name];
            } else {
                res.value = null;
            }
            return res;
        } else {

            function xpropsVals(xprops, obj, path) {
                var path = path || '';

                for (var i=0;i < xprops.length; ++i) {
                    if(!xprops[i].hasOwnProperty('properties')){
                        if(obj.hasOwnProperty(xprop.name)){
                            res.value = obj[xprop.name];
                        } else {
                            res.value = null;
                        }
                        return res;
                    }
                }
                if(!found){
                    return null;
                }
            }
            xpropsVals(xprop.properties, obj);
        }
    }


    /**
     * See test/tests.js for examples
     *
     * @returns {Array} of new x-properties
     */
    TableGenerator.prototype.addXProp = function(xprops, path){
        var self = this;

        var pathComponents = path.split('/');
        var firstPathComponent = pathComponents[0];

        var found = false;

        for (var i=0; i < xprops.length; ++i) {
            if(xprops[i].name === firstPathComponent){
                if(pathComponents.length > 1) {
                    if(!xprops[i].hasOwnProperty("properties")){
                        xprops[i].properties = [];
                    }
                    if(!self.hasXProp(xprops[i].properties, pathComponents[1])) {
                        xprops[i].properties.push({name: pathComponents[1]});
                    }
                }
                found = true;
            }
        }

        if(!found) {
            xprops.push({name: firstPathComponent });
            if(pathComponents.length === 1) {
                return xprops;
            } else {
                var xprop = xprops[xprops.length-1];
                xprop.properties = [];
                pathComponents.splice(0,1);
                var newPath = pathComponents.join('/');
                xprop.properties = self.addXProp(xprop.properties, newPath);
            }
        }

        return xprops;
    }
    
    /**
     * Combine two xprops arrays
     *
     * In:  [{name: 'foo'}], [{name: 'bar'}]
     * Out: [{name: 'foo'}], [{name: 'bar'}]
     *
     * In:  [{name: 'foo'}], [{name: 'foo', properties: [{name: 'bar'}] }]
     * Out: [{name: 'foo', properties: [{name: 'bar'}] }]
     *
     * In:  [{name: 'foo', properties: [{name: 'bar'}] }], [{name: 'foo', properties: [{name: 'baz'}] }]
     * Out: [{name: 'foo', properties: [{name: 'bar'}, {name: 'baz'}] }]
     *
     */
    TableGenerator.prototype.combineXProps = function(xprops1, xprops2){
        var self = this;
        var ret = xprops1.slice(0);

        for (var i=0; i < xprops2.length; ++i) {
            var src = xprops2[i];

            for (var j=0; j < xprops1.length; ++j) {
                dst = xprops1[j];

                var found = false;

                if(src.name === dst.name) {

                    found = true;

                    // if no nested xprops
                    if(!src.hasOwnProperty('properties')){
                        // we don't need to do anything more for this xprop
                        break;
                    } else {
                        // if dst has no 'properties', simply copy it from src
                        if(!dst.hasOwnProperty('properties')){
                            dst.properties = src.properties;
                        } else {
                            dst.properties = self.combineXProps(dst.properties, src.properties);
                        }
                        break;
                    }
                }
                if(j == xprops1.length-1 && !found){
                    // traversed all ret elements, but this prop was not found
                    ret.push(src)
                }
            }
        }
        return ret;
    }

    /**
     * Extract properties into `props`. So, `props` is an array, each element
     * being an object with at least a `name` property. It can also have a 'properties'
     * property. It does not care about values.
     *
     *  Input:
     *  var item = {
     *              "foo": "asd",
     *              "bar": { "p1":  100 }
     *             }
     *
     *  Output:
     *  [ 
     *      {name: "foo"},
     *      {name: "bar", properties: [ {name: "p1"} ]
     *  ]
     *
     *
     */
    TableGenerator.prototype.extractXProps = function(item, xprops, path){
        var self = this;

        var xprops = xprops ? xprops.slice(0) : [];
        var path = path || '';

        // each own property
        for (var iprop in item) {
            if (item.hasOwnProperty(iprop)) {

                // check if we already have this xprop in xprops
                var existing = null;
                for (var i=0; i < xprops.length; ++i) {
                    if(xprops[i].name === iprop) {
                        existing = xprops[i];
                        break;
                    }
                }

                // if we have it in xprops
                if(existing) {

                    // if iprop is complex (an object), we need to recurse.
                    // Otherwise, for simple props, since it exists already, we don't need
                    // to do anything.
                    if(typeof item[iprop] === 'object'){

                        // recurse, sending existing.properties as second parameter, if existing has it
                        var extracted = self.extractXProps(
                            item[iprop],
                            existing.hasOwnProperty('properties') ? existing.properties : [],
                            path + '/' + iprop
                        );

                        // since we'll be extracting properties from an object, we make
                        // sure our xprop has a 'properties' property.
                        if(extracted.length > 0) {
                            if(!existing.hasOwnProperty('properties')){
                                existing.properties = extracted;
                            } else {
                                // combine with existing xprops
                                existing.properties = self.combineXProps(existing.properties, extracted);
                            }
                        }
                    }
                } else { // we don't have it
                    if(typeof item[iprop] === 'object'){
                        var extracted = self.extractXProps(item[iprop], null, path + '/' + iprop);
                        if(extracted.length > 0) {
                            xprops.push({name: iprop, path: path + '/' + iprop, properties: extracted});
                        }
                    } else {
                        xprops.push({name: iprop, path: path + '/' + iprop});
                    }
                }
            }
        }
        return xprops;
    }

    /**
     * Calculate total number of "leaves" of the xprop tree. This is needed to
     * know the number of columns a table header should span.
     *
     * In: {name: 'foo'} 
     * Out: 1
     *
     * In: {name: 'foo', properties: [{name: 'bar'}] } 
     * Out: 1
     *
     * In: {name: 'foo', properties: [{name: 'bar'}, {name: 'baz'}] } 
     * Out: 2
     *
     * More examples in test suite
     */
    TableGenerator.prototype.getSpan = function(xprop){
        var self = this;

        if(!xprop.hasOwnProperty('properties')){
            return 1;
        } else {
            var subProps = 0;
            for (var i=0; i < xprop.properties.length; ++i) {
                subProps += self.getSpan(xprop.properties[i]);
            }
            return subProps;
        }
    }

    /**
     * Calculate the depth of a xprop. That is, how many levels do it's
     * nested xprops extend.
     */
    TableGenerator.prototype.getDepth = function(xprop, currentLevel){
        var self = this;
        var currentLevel = currentLevel || 1;
        if(!xprop.hasOwnProperty('properties')){
            return currentLevel;
        } else {
            var max = 1;
            for (var i=0; i < xprop.properties.length; ++i) {
                var depth = self.getDepth(xprop.properties[i], currentLevel+1);
                if(depth > max){
                    max = depth;
                }
            }
            return max;
        }
    }

    /**
     * Go through all xprops and place them on the appropriate level.
     *
     * Generate a bi-dimensional array.
     *
     * First dimension being the level - 0 for top level xprops, 1 for one level
     * below, and so on. The number of elements will, therefore, be equal to the
     * "depth" of the xprop tree.
     *
     * Second dimension, represens the elements themselves. The results from this
     * function are intended for use in generating a multi-level table header, so
     * each element must be an object with one mandatory property: `name` and can
     * also have a `span` and `depth` (colspan and rowspan).
     * 
     */
    TableGenerator.prototype.layerXProps = function(xprops){
        var self = this;
        var ret = [];

        // compute maximum depth - the number of layers, or rows
        var depth = 0;
        for (var i=0; i < xprops.length; ++i) {
           var _depth = self.getDepth(xprops[i]);
           if(_depth > depth) {
               depth = _depth;
           }
        }

        function layerXProp(xprop, level){

            if(ret[level] === undefined){
                ret.push([]);
            }

            if(xprop.hasOwnProperty('properties')){

                ret[level].push({name: xprop.name, path: xprop.path, span: self.getSpan(xprop)});

                for (var i=0; i < xprop.properties.length; ++i) {
                    layerXProp(xprop.properties[i], level+1);
                }
            } else {

                var item = {};
                if(xprop.name){
                    item.name = xprop.name;
                }

                item.path = xprop.path;
                item.span = 1;

                var _depth = depth-level;
                if(_depth !== 1){
                    item.depth = _depth;
                }

                ret[level].push(item);
            }
        }

        for (var i=0; i < xprops.length; ++i) {
            layerXProp(xprops[i],0);
        }
        
        return ret;
    }

    TableGenerator.prototype.makeTable = function(json){
        for(var i=0; i<json.length; i++){
            console.log();
        }
    }

    root.TableGenerator = TableGenerator;
}).call(this);
