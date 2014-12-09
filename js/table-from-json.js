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
        for (var prop in item) {
            if (item.hasOwnProperty(prop)) {
                if(typeof item[prop] === 'object'){
                    xprops.push({name: prop, properties: self.extractProperties(item[prop])});
                } else {
                    xprops = self.addXProp(xprops, prop);
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
