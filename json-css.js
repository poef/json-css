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
	
    function isSafeTagName(name) {
    	return !name.match(/[^A-Za-z_-]/);
    }

    /**
     * This method builds up an array of tags, containing the data as attributes
     * each open tag has an index attribute that links back to the original data
     * through the ids list.
     * the list argument is an array of tags, to be joined and then set with
     * innerHTML, which is far faster in Edge/IE then using createElement.
     */
    function prerender(ids, list, value, name, seen) {
        if (seen.has(value)) {
            if (!this.jsonCyclicWarning) {
                console.warn('json-css: cyclic data structure detected, skipping some values');
                this.jsonCyclicWarning = true;
            }
            return;
        }
        var id = ids.length;
        if (value && typeof value == 'object') {
            seen.set(value, id);
        }
        ids.push(value);
        if (!name) {
            name = 'entry';
        }
		var realName = name;
		if (!isSafeTagName(name)) {
			name = 'entry';
		}
        if ( Array.isArray(value) ) {
            list.push('<'+name+' name="'+htmlEntities(realName)+'" index="'+id+'">');
            for (var i=0, l=value.length; i<l; i++) {
                prerender.call(this, ids,list,value[i],null,seen);
            }
            list.push('</'+name+'>');
		} else if ( typeof value === 'object' && ( value instanceof String || value instanceof Number || value instanceof Boolean) ) {
            list.push('<'+name+' name="'+htmlEntities(realName)+'" value="'+htmlEntities(value)+'" index="'+id+'"></'+name+'>');
        } else if ( typeof value === 'object') {
            if (!value) { // null
                list.push('<'+name+' name="'+htmlEntities(realName)+'" value="" index="'+id+'"></'+name+'>');
            } else {
                list.push('<'+name+' name="'+htmlEntities(realName)+'" index="'+id+'">');
                for (var i in value) {
                    prerender.call(this, ids,list, value[i], i, seen);
                }
                list.push('</'+name+'>');
            }
        } else { // string, int, boolean
            list.push('<'+name+' name="'+htmlEntities(realName)+'" value="'+htmlEntities(value)+'" index="'+id+'"></'+name+'>');
        }
    }    

    /**
     * Renders a json structure as a HTML5 dom tree, so we can use querySelectorAll to search through it
     */
    function renderData(ids, node, value, seen) {
        var result = [];
        prerender.call(this, ids, result, value, null, seen);
        result.shift(result.pop()); // remove extra outer entry
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
    }

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
    }

    jsonCSS.init = function(data) {
        var ids=[];
        var seen = new WeakMap();

        return {
			dom: null,
            query: function() {
                if (!this.dom) {
                    this.dom = document.createElement('search');
                    renderData.call(this, ids, this.dom, data, seen);
                }
                return searchNodes(ids, this.dom, arguments);
            },
            update: function() {
                this.dom = null;
                ids = [];
            }
        };
    }

    return jsonCSS;
});    
