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

describe("TableGenerator.hasXProp()", function() {

    it("should return true if xprop list has property (1 level deep)", function() {
        expect(testTableGenerator.hasXProp(
            [ {name: 'foo'} ],
            'foo'
        )).to.be.true;
    });
    it("should return false if xprop list doesn't have property (1 level deep)", function() {
        expect(testTableGenerator.hasXProp(
            [ {name: 'foo'} ],
            'bar'
        )).to.be.false;
    });
    it("should return true if xprop list has property (2 levels deep)", function() {
        expect(testTableGenerator.hasXProp(
            [
                {
                    name: 'foo', properties: [
                        {name: 'bar'}
                    ]
                }
            ],
            'foo/bar'
        )).to.be.true;
    });
    it("should return true if xprop list has property (3 levels deep)", function() {
        expect(testTableGenerator.hasXProp(
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
        )).to.be.true;
    });
    it("should return false if xprop list doesn't have property (3 levels deep)", function() {
        expect(testTableGenerator.hasXProp(
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
        expect(testTableGenerator.extractProperties(
            {}
        )).to.deep.equal([]);
    });
    it("should extract xprops (1 level deep)", function() {
        expect(testTableGenerator.extractProperties(
            {foo: 'bar'}
        )).to.deep.equal([{name: 'foo'}]);
    });
    it("should extract xprops (2 levels deep)", function() {
        expect(testTableGenerator.extractProperties(
            {foo: { bar: 'baz'}}
        )).to.deep.equal([
            {name: 'foo', properties: [{
                name: 'bar'}]
            }
        ]);
    });
    it("should extract xprops (2 levels deep, siblings)", function() {
        expect(testTableGenerator.extractProperties(
            {foo: { bar: 'asd', baz: 'asd'}}
        )).to.deep.equal([
            {name: 'foo', properties: [
                {name: 'bar'},
                {name: 'baz'}
            ]}
        ]);
    });
    it("should extract xprops (3 levels deep, siblings with nested props)", function() {
        expect(testTableGenerator.extractProperties(
            {foo: { bar: 'asd', baz: { boo: 22 }}}
        )).to.deep.equal([
            {name: 'foo', properties: [
                {name: 'bar'},
                {name: 'baz', properties: [
                    {name: 'boo'}
                ]}
            ]}
        ]);
    });
    it("should be able to add xprops to existing xprops", function() {
        var res = testTableGenerator.extractProperties(
            {foo: { baz: 'asd'}},
            [{name: 'foo', properties: [{name: 'bar'}] }]
        );
        var expectedRes = [{name: 'foo', properties: [
                {name: 'bar'},
                {name: 'baz'}
            ]}];
//        console.dir(res);
//        console.dir(expectedRes);
        expect(res).to.deep.equal(expectedRes);
    });
    it("should be able to add xprops to existing xprops (3 levels deep)", function() {
        var res = testTableGenerator.extractProperties(
            {foo: { bar: { baz: 'asd'}}},
            [{name: 'foo', properties: [{name: 'bar'}] }]
        );
        var expectedRes = [{
                name: 'foo', properties: [
                    {name: 'bar', properties: [{name: 'baz'}]}
                ]
            }]
        console.log('result: ');
        console.dir(res);
        console.log('expected: ');
        console.dir(expectedRes);
        expect(res).to.deep.equal(expectedRes);
    });
});
