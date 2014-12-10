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
        console.log(xprops1, xprops2);
        var res = xprops1;
        var i=0;
        for (i=0; i < xprops2.length; ++i) {
            var found = false;
            for (var j=0; j < xprops1.length; ++j) {
                //console.log('comparing ', xprops2[i].name, 'with', xprops1[j].name);
                if(xprops2[i].name === xprops1[j].name) {
                    if(xprops2[i].hasOwnProperty(properties)){
                        // we need to combine them
                        if(xprops1[j].hasOwnProperty(properties)){
                            xprops1[j].properties = self.combineXProps(xprop2[i].properties, xprops1[j].properties);
                        } else {
                        }
                    }
                    found = true;
                }
            }

            if(i == xprops1.length-1 && !found){
                // traversed all xprops1 elements, but this prop was not found
                res.push(xprops2[i])
            }
        }
        return res;
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
    TableGenerator.prototype.extractProperties = function(item, xprops, path){
        var self = this;

        var xprops = xprops || [];

        // each property
        for (var iprop in item) {
            if (item.hasOwnProperty(iprop)) {
                if(typeof item[iprop] === 'object'){
                    if(!self.hasXProp(xprops, iprop)) {
                        // iprop is not in xprops
                        var ex = self.extractProperties(item[iprop]);
                        xprops.push({name: iprop, properties: ex, noiprop: true});
                    } else {

                        // iprop is already in xprops
                        // ex: ( {foo: {bar: 2}}, [{name: 'foo', properties: [{name: 'baz'}] }] )
                        // so, we need to add 'bar' to xprops[0].properties

                        // 1. find xprop it in the array
                        for (var i=0; i < xprops.length; ++i) {
                            if(xprops[i].name === iprop) {

                                // 2. make sure it has a `properties` array
                                if(!xprops[i].hasOwnProperty('properties')){
                                    xprops[i].properties = [];
                                }

                                // 3. recursivelly add to xprops
                                var ex = self.extractProperties(item[iprop]);
                                xprops[i].properties = self.combineXProps(xprops[i].properties,ex);
                            }
                        }
                    }
                } else { // simple iprop
                    xprops = self.addXProp(xprops, iprop);
                }
            }
        }
        return xprops;
    }

    TableGenerator.prototype.makeTable = function(json){
        for(var i=0; i<json.length; i++){
            console.log();
        }
    }

    root.TableGenerator = TableGenerator;
}).call(this);
