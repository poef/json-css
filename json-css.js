(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define([], factory(root));
    } else if ( typeof exports === 'object' ) {
        module.exports = factory();
    } else {
        root.jsonCSS = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    'use strict';

	var jsonCSS = {};

    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
	
	function safeTagName(name) {
		return !name.match(/[^A-Za-z_-]/);
	}

    /**
     * This method builds up an array of tags, containing the data as attributes
     * each open tag has an index attribute that links back to the original data
     * through the ids list.
     * the list argument is an array of tags, to be joined and then set with
     * innerHTML, which is far faster in Edge/IE then using createElement.
     */
    function prerender(ids, list, value, name) {
        if (!name) {
            name = 'entry';
        }
		var realName = name;
		if (!safeTagName(name)) {
			name = 'entry';
		}
        var id = ids.length;
        ids.push(value);
        if ( Array.isArray(value) ) {
            list.push('<'+name+' name="'+htmlEntities(realName)+'" index="'+id+'">');
            for (var i=0, l=value.length; i<l; i++) {
                prerender(ids,list,value[i]);
            }
            list.push('</'+name+'>');
        } else if ( typeof value === 'object') {
            if (!value) { // null
                list.push('<'+name+' name="'+htmlEntities(realName)+'" value="" index="'+id+'"></'+name+'>');
            } else {
                list.push('<'+name+' name="'+htmlEntities(realName)+'" index="'+id+'">');
                for (var i in value) {
                    prerender(ids,list, value[i], i);
                }
                list.push('</'+name+'>');
            }
        } else { // string, int, boolean
            list.push('<'+name+' name="'+htmlEntities(realName)+'" value="'+htmlEntities(value)+'" index="'+id+'"></'+name+'>');
        }
    }    

    /**
     * Render a json structure as a HTML5 dom tree, so we can use querySelectorAll to search through it
     */
    function renderData(ids, node, value) {
        var result = [];
        prerender(ids, result, value);
        node.innerHTML = result.join('');
    }

    function filterNodes(nodes, query) {
        var result = [];
        for (var i=0; i<nodes.length; i++) {
            if (nodes[i].querySelector(query)) {
                result.push(nodes[i]);
            }
        }
        return result;
    };

    function searchNodes(ids, tree, queries) {
        var baseQuery;

        if (typeof queries === "string") {
            baseQuery = queries;
            queries = [];
        } else {
            baseQuery = queries[0];
        }
        var resultNodes = tree.querySelectorAll(baseQuery);
        if (resultNodes.length === 1 && resultNodes[0].getAttribute("type") === "array") {
            resultNodes = resultNodes[0].childNodes;
        }

        for (var i=1; i<queries.length; i++) {
            resultNodes = filterNodes(resultNodes, queries[i]);
        }
        
        var result = [];
        for (i=0; i<resultNodes.length; i++) {
            var id = parseInt(resultNodes[i].getAttribute('index'));
            result.push({
                key : resultNodes[i].getAttribute('name'),
                value : ids[ id ]
            });
        }
        return result;            
    };

    jsonCSS.init = function(data) {
        var ids = [];
        if (!data.hasOwnProperty('searchElement')) {
            var searchElement = document.createElement("search");
        } else {
            var searchElement = data.searchElement;
        }
        renderData(ids, searchElement, data);
                        
        if (data.hasOwnProperty("search")) {
            return;
        }

        Object.defineProperty(data, "search", {
            get : function() {
                return function() {
                    if (!this.hasOwnProperty("searchElement")) {
                        Object.defineProperty(this, "searchElement", {
                            get : function() {
                                return searchElement;
                            },
                            enumerable : false,
                            configurable : false
                        });
                    }
                    var result = searchNodes(ids, this.searchElement, arguments);
                    return result;
                }
            },
            enumerable : false,
            configurable : false
        });
    }

	return jsonCSS;
});    
