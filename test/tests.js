var testTableGenerator;
before(function(){
    testTableGenerator = new TableGenerator();
});

describe("TableGenerator.search()", function() {

    var items = [
        {
            "name": "foo",
            "a": {
                "p1": {
                    "sp1": 100
                }
            }
        },{
            "name": "bar",
            "a": {
                "p1": {
                    "sp2": 200
                }
            }
        }
    ]

    /**
     * Note that this functino does not check for  a regular property.
     */
    it("should return return prop value if exists (1 level deep)", function() {
        expect(testTableGenerator.search(
            {foo: 'bar'},
            'foo'
        )).to.equal('bar');
    }); 
    it("should return return prop value if exists (2 levels deep)", function() {
        expect(testTableGenerator.search(
            {foo: {bar: 'baz'}},
            'foo/bar'
        )).to.equal('baz');
    }); 
    it("should return return prop value if exists (3 levels deep)", function() {
        expect(testTableGenerator.search(
            {foo: {bar: {baz: 'goo'}}},
            'foo/bar/baz'
        )).to.equal('goo');
    }); 
    it("should return null if property does not exist exist (1 level deep)", function() {
        expect(testTableGenerator.search({},'foo')).to.be.null;
    }); 
    it("should return null if property does not exist exist (2 levels deep)", function() {
        expect(testTableGenerator.search(
            {foo: {bar: 'baz'}},
            'foo/noo'
        )).to.be.null;
    }); 
    it("should return null if property does not exist exist (3 levels deep)", function() {
        expect(testTableGenerator.search(
            {foo: {bar: {baz: 'goo'}}},
            'foo/bar/noo'
        )).to.be.null;
    }); 
    it("should return prop value if exists and is an object (1 level deep)", function() {
        expect(testTableGenerator.search(
            {foo: {bar: 'baz'}},
            'foo'
        )).to.deep.equal({bar: 'baz'});
    }); 
});

describe("TableGenerator.eachXProp()", function() {
    it("should iterate over all sub-properties", function() {
        var xprops = [];
        testTableGenerator.eachXProp(
            {name: 'foo', properties: [{name: 'bar'}] },
            function(xprop){
                xprops.push(xprop);
            }
        );
        expect(xprops).to.deep.equal([{name: 'bar'}]);
    });
    it("should iterate over all sub-properties - 2 xprops, siblings", function() {
        var xprops = [];
        testTableGenerator.eachXProp(
            {name: 'foo', properties: [{name: 'bar'}, {name: 'baz'}] },
            function(xprop){
                xprops.push(xprop);
            }
        );
        expect(xprops).to.deep.equal([{name: 'bar'},{name: 'baz'}]);
    });
    it("should iterate over all sub-properties - 2 xprops, nested", function() {
        var xprops = [];
        testTableGenerator.eachXProp(
            {name: 'foo', properties: [{name: 'bar'}, {name: 'baz', properties: [{name: 'bez'}] }] },
            function(xprop){
                xprops.push(xprop);
            }
        );
        expect(xprops).to.deep.equal([{name: 'bar'},{name: 'bez'}]);
    });
});
describe("TableGenerator.findXProp()", function() {

    it("should find xprop if xprop list has property (1 level deep)", function() {
        expect(testTableGenerator.findXProp(
            [ {name: 'foo'} ],
            'foo'
        )).to.deep.equal({name: 'foo'})
    });
    it("should return false if xprop list doesn't have property (1 level deep)", function() {
        expect(testTableGenerator.findXProp(
            [ {name: 'foo'} ],
            'bar'
        )).to.be.false;
    });
    it("should find xprop if xprop list has property (2 levels deep)", function() {
        expect(testTableGenerator.findXProp(
            [
                {
                    name: 'foo', properties: [
                        {name: 'bar'}
                    ]
                }
            ],
            'foo/bar'
        )).to.deep.equal({name: 'bar'});
    });
    it("should find xprop if xprop list has property (3 levels deep)", function() {
        expect(testTableGenerator.findXProp(
            [
                {
                    name: 'foo', properties: [
                        {
                            name: 'bar', properties: [
                                {
                                    name: 'baz'
                                }
                            ]
                        }
                    ]
                }
            ],
            'foo/bar/baz'
        )).to.deep.equal({name: 'baz'});
    });
    it("should return false if xprop list doesn't have property (3 levels deep)", function() {
        expect(testTableGenerator.findXProp(
            [
                {
                    name: 'foo', properties: [
                        {
                            name: 'bar', properties: [
                                {
                                    name: 'baz'
                                }
                            ]
                        }
                    ]
                }
            ],
            'foo/bar/noo'
        )).to.be.false;
    });
});

describe("TableGenerator.addXProp()", function() {

    it("should add xprop (1 level deep, no existing sub-properties)", function() {
        expect(testTableGenerator.addXProp(
            [],
            'foo'
        )).to.be.deep.equal([{name: 'foo'}]);
    });
    it("should add xprop (2 level deep)", function() {
        expect(testTableGenerator.addXProp(
            [{name: 'foo'}],
            'foo/bar'
        )).to.be.deep.equal(
            [{name: 'foo', properties: [{name: 'bar'}] }]
        );
    });
    it("should add xprop (2 level deep, existing sub-properties)", function() {
        expect(testTableGenerator.addXProp(
            [{name: 'foo', properties: [{name: 'bar'}] }],
            'foo/baz'
        )).to.be.deep.equal(
            [{name: 'foo', properties: [{name: 'bar'},{name: 'baz'}] }]
        );
    });
    it("should add xprop (2 level deep, no existing sub-properties)", function() {
        expect(testTableGenerator.addXProp(
            [],
            'foo/bar'
        )).to.be.deep.equal(
            [{name: 'foo', properties: [{name: 'bar'}] }]
        );
    });
    it("should add xprop (3 level deep, no existing sub-properties)", function() {
        expect(testTableGenerator.addXProp(
            [],
            'foo/bar/baz'
        )).to.be.deep.equal(
            [{name: 'foo', properties:
                [{name: 'bar', properties:
                    [{name: 'baz'}]}]
            }]
        );
    });
});

describe("TableGenerator.combineXProps()", function() {
    it("should combine 2 xprops on same level", function() {
        expect(testTableGenerator.combineXProps(
            [{name: 'foo'}],
            [{name: 'bar'}]
        )).to.deep.equal(
            [
                {name: 'foo'}, {name: 'bar'}
            ]
        );
    });

    it("should combine nested xprops, 1 level difference", function() {
        expect(testTableGenerator.combineXProps(
            [{name: 'foo'}],
            [{name: 'foo', properties: [{name: 'bar'}] }]
        )).to.deep.equal(
            [
                {name: 'foo', properties: [{name: 'bar'}] }
            ]
        );
    });
    it("should combine nested xprops, 1 level difference, siblings", function() {
        expect(testTableGenerator.combineXProps(
            [{name: 'foo', properties: [{name: 'bar'}] }],
            [{name: 'foo', properties: [{name: 'baz'}] }]
        )).to.deep.equal(
            [
                {name: 'foo', properties: [{name: 'bar'}, {name: 'baz'}] }
            ]
        );
    });
});

describe("TableGenerator.extractXProps()", function() {
    it("should return empty array from empty object", function() {
        expect(testTableGenerator.extractXProps(
            {}
        )).to.deep.equal([]);
    });
    it("should extract xprops (1 level deep)", function() {
        expect(testTableGenerator.extractXProps(
            {foo: 'bar'}
        )).to.deep.equal([{name: 'foo', path: '/foo'}]);
    });
    it("should extract xprops (2 levels deep)", function() {
        var result = testTableGenerator.extractXProps(
            {foo: { bar: '123'}}
        );
        var expected = [{name: 'foo', path: '/foo', properties: [{
                name: 'bar', path: '/foo/bar'}]
        }];
//        console.log(result);
//        console.log(expected);
        expect(result).to.deep.equal(expected);
    });
    it("should extract xprops (2 levels deep, siblings)", function() {
        var result = testTableGenerator.extractXProps(
            {foo: { bar: 'asd', baz: 'asd'}}
        );
        var expected =([
            {name: 'foo', path: '/foo', properties: [
                {name: 'bar', path: '/foo/bar'},
                {name: 'baz', path: '/foo/baz'}
            ]}
        ]);
//        console.log(result);
//        console.log(expected);
        expect(result).to.deep.equal(expected);
    });
    it("should extract xprops (3 levels deep, siblings with nested props)", function() {
        var result = testTableGenerator.extractXProps(
            {foo: { bar: 'asd', baz: { boo: 22 }}}
        );
        var expected = [
            {name: 'foo', path: '/foo', properties: [
                {name: 'bar', path: '/foo/bar'},
                {name: 'baz', path: '/foo/baz', properties: [
                    {name: 'boo', path: '/foo/baz/boo'}
                ]}
            ]}
        ];
//        console.log(result);
//        console.log(expected);
        expect(result).to.deep.equal(expected);
    });
    it("should be able to add xprops to existing xprops", function() {
        var result = testTableGenerator.extractXProps(
            {foo: { baz: 'asd'}},
            [{name: 'foo', path: '/foo', properties: [{name: 'bar', path: '/foo/bar'}] }]
        );
        var expected = [{name: 'foo', path: '/foo', properties: [
                {name: 'bar', path: '/foo/bar'},
                {name: 'baz', path: '/foo/baz'}
            ]}];
//        console.log(result);
//        console.log(expected);
        expect(result).to.deep.equal(expected);
    });
    it("should be able to add xprops to existing xprops (3 levels deep)", function() {
        var result = testTableGenerator.extractXProps(
            {foo: { bar: { baz: 'asd'}}},
            [{name: 'foo', path: '/foo', properties: [{name: 'bar', path: '/foo/bar'}] }]
        );
        var expected= [{
                name: 'foo', path: '/foo', properties: [
                    {name: 'bar', path: '/foo/bar', properties: [{
                        name: 'baz', path: '/foo/bar/baz'
                    }]}
                ]
            }]
//        console.log(result);
//        console.log(expected);
        expect(result).to.deep.equal(expected);
    });
});

describe("TableGenerator.getDepth()", function() {
    it("should return 1 for a prop without nested props", function() {
        expect(testTableGenerator.getDepth({name: 'foo'})).to.equal(1);
    });
    it("should return 2 for a prop with one nested prop", function() {
        expect(testTableGenerator.getDepth(
            {name: 'foo', properties: [{name: 'bar'}] }
        )).to.equal(2);
    });
    it("should return 3 for a prop with one nested prop", function() {
        expect(testTableGenerator.getDepth(
            {name: 'foo', properties: [{name: 'bar', properties: [{name: 'baz'}] }] }
        )).to.equal(3);
    });
    it("should return 4 for a prop with one nested prop (siblings)", function() {
        expect(testTableGenerator.getDepth(
            {name: 'foo', properties: [{name: 'bar', properties: [{name: 'baz'}] },
                                       {name: 'bez', properties: [{name: 'boz', properties: [{name: 'biz'}] }] }
        ]}
        )).to.equal(4);
    });
});

describe("TableGenerator.getSpan()", function() {
    it("should return 1 if a single property", function() {
        expect(testTableGenerator.getSpan({name: 'foo'})).to.equal(1);
    });
    it("should return 1 if a single property, with another nested property", function() {
        expect(testTableGenerator.getSpan(
            {name: 'foo', properties: [{name: 'bar'}] }
        )).to.equal(1);
    });
    it("should return 2 if a property has 2 nested properties", function() {
        expect(testTableGenerator.getSpan(
            {name: 'foo', properties: [{name: 'bar'},{name: 'baz'}] }
        )).to.equal(2);
    });
    it("should return 3 if a property has 2 nested properties, and one of them has 2 nested props", function() {
        expect(testTableGenerator.getSpan(
            {
                name: 'foo', properties: [
                    {
                        name: 'bar'
                    },{
                        name: 'baz', properties: [
                            {name: 'bez'},
                            {name: 'boz'}
                        ]
                    }
                ]
            }
        )).to.equal(3);
    });
});

describe("TableGenerator.layerXProps()", function() {
    it("should work for basic case", function() {
        var res = testTableGenerator.layerXProps(
            [ {name: 'foo', path: '/foo'} ]
        );
        var expectedRes =
            [ [ {name: 'foo', path: '/foo',  span: 1} ] ] 
//        console.log(res);
//        console.log(expectedRes);
        expect(res).to.deep.equal(expectedRes);
    });
    it("should work with sub-properties", function() {
        var res = testTableGenerator.layerXProps(
            [ {name: 'foo', path: '/foo', properties: [{name: 'bar', path: '/foo/bar'}, {name: 'baz', path: '/foo/baz'}] } ]
        );
        var expectedRes =
            [ 
                [ {name: 'foo', path: '/foo', span: 2} ], // level 0
                [ {name: 'bar', path: '/foo/bar', span: 1}, {name: 'baz', path: '/foo/baz',  span: 1} ] // level 1
            ]
//        console.log(res);
//        console.log(expectedRes);
        expect(res).to.deep.equal(expectedRes);
    });
    it("should work with sub-properties, 3 levels", function() {
        /*  
         *        1A      1B     1C
         *       |   \           |
         *      2A1  2A2        2C
         *     /   \
         *   3A1  3A2
         */
        var res = testTableGenerator.layerXProps(
            [
                {
                    name: '1A', path: '/1A', properties: [
                        {
                            name: '2A1', path: '/1A/2A1', properties: [
                                {name: '3A1', path: '/1A/2A1/3A1'},
                                {name: '3A2', path: '/1A/2A1/3A2'}
                            ]
                        },{
                            name: '2A2', path: '/1A/2A2'
                        }
                    ]
                },{
                    name: '1B', path: '/1B'
                },{
                    name: '1C', path: '/1C', properties: [
                        {name: '2C', path: '/1C/2C'}
                    ]
                }

            ]
        );
        var expectedRes =
            [ 
                [ {name: '1A',  path: '/1A', span: 3}, {name: '1B', path: '/1B',  span: 1, depth: 3}, {name: '1C', path: '/1C', span: 1} ], // level 0
                [ {name: '2A1', path: '/1A/2A1', span: 2}, {name: '2A2', path: '/1A/2A2', span: 1, depth: 2}, {name: '2C', path: '/1C/2C', span: 1, depth: 2} ], // level 1
                [ {name: '3A1', path: '/1A/2A1/3A1', span: 1}, {name: '3A2', path: '/1A/2A1/3A2', span: 1} ] // level 3
            ]
//        console.log(res);
//        console.log(expectedRes);
        expect(res).to.deep.equal(expectedRes);
    });
});
