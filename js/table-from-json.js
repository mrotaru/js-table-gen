(function() {
    var root = this;

    //    props:
    //     [
    //         {name: "name"},
    //         {name: "a",
    //             properties: [{
    //                 name: "p1",
    //                 properties: [
    //                     {name: "sp1"},
    //                     {name: "sp2"}
    //                 ]
    //             }]
    //         } 
    //     ]

    //    getProp(items[0])

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
     * Similar to `value`, it takes a `path` and object as input. But the object
     * is of a special kind:
     *
     *  extractedproperties = [ 
     *      {name: "foo"},
     *      {name: "bar", properties: [ {name: "p1"} ]
     *  ]
     *
     *  "/foo"          -> true
     *  "/foo/p1"       -> false
     *  "/bar"          -> true
     *  "/bar/p1"       -> true
     *
     *  @returns true if `path` is a valid path for objects described by extractedProperties
     *
     */
    TableGenerator.prototype.hasProp = function(propName, extractedProperties){
        for(var i=0; i<extractedProperties.length; i++){
            if(propName === extractedProperties[i].name){
                return true;
            }
        }
        return false;
    }

    /**
     *
     *  extractedproperties = [ 
     *      {name: "foo"},
     *  ]
     *  
     *  "/bar" -> {name: "bar"}
     *  "/foo/bar" -> {name: "foo", propertie: [{name: "bar"}]
     *  "/foo/bar/baz" -> {name: "foo", propertie: [{name: "bar", properties: [{name: "baz"}]}]
     *
     */
    TableGenerator.prototype.insertProp = function(path, props){
        var pathParts = path.split('/');

        /**
         *  If we only have 1 path component, we only need to search top-level properties. If the
         *  property is found, retrun `props` as it is since we don't need to do anything else.
         *
         *  "/foo", [{name: "foo"}] -> props
         *
         *  Else:
         *
         *  "/bar", [{name: "foo"}] -> props.push({name: 'foo'})
         *
         */
        if(pathParts.length === 1){
            var found = false;
            for(var i=0; i<props.length; i++){
                if(props[i].name === pathParts[0]){
                    found = true;
                    break;
                }
            }

            if(found){
                return props;
            } else {
                // if here, it means we'be been through all known props and first path
                // element was not found. So, we add it and return.
                return props.push({name: pathParts[0]});
            }
            /*
             * More than one element in path. We only check the top one. If we have such a prop,
             * check that prop for next path component by recursivelly calling this function.
             *
            // "/bar/baz", [{name: "foo"}] : have 'bar' ? no. then add bar
             *
             */
        } else {
            //
            if(!hasProp(pathParts[0], props)){
                // insert
            } 

            // find root

            // insert in 'properties' array 

        }

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
    TableGenerator.prototype.extractProperties = function(item, prefix, props){

        var props = [];
        prefix = prefix || '';

        // each property
        for (var prop in item) {
            if (item.hasOwnProperty(prop)) {
                var path = prefix + '/' + prop;
                console.log(path);

                // add to 'props'
                if(!encountered(path, props)){
                    if(typeof(item[prop] === 'object')){
                        props 
                    } else {
                        addSimpleProp(path);
                    }
                }
            }
        }
    }

    TableGenerator.prototype.makeTable = function(json){
        for(var i=0; i<json.length; i++){
            console.log();
        }
    }

    root.TableGenerator = TableGenerator;
}).call(this);
