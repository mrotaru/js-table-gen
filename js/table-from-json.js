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
        console.log('extracting from: ',item);
        var self = this;

        var xprops = xprops ? xprops.slice(0) : [];

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
                        var extracted = self.extractXProps(item[iprop], existing.hasOwnProperty('properties') ? existing.properties : []);

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
                        var extracted = self.extractXProps(item[iprop]);
                        if(extracted.length > 0) {
                            console.log('pushing new xprop: ', extracted);
                            xprops.push({name: iprop, properties: extracted});
                        }
                    } else {
                        xprops.push({name: iprop});
                    }
                }
            }
        }
        console.log('returning:',xprops);
        return xprops;
    }

    TableGenerator.prototype.makeTable = function(json){
        for(var i=0; i<json.length; i++){
            console.log();
        }
    }

    root.TableGenerator = TableGenerator;
}).call(this);
