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

    var testTableGenerator;

    before(function(){
        testTableGenerator = new TableGenerator();
    });

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
    it("should return return prop value if exists and is an object (1 level deep)", function() {
        expect(testTableGenerator.search(
            {foo: {bar: 'baz'}},
            'foo'
        )).to.deep.equal({bar: 'baz'});
    }); 
});
