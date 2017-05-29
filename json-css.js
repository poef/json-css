    editor.search = function() {
        var renderData = function(node, value) {
            var i;
            if (typeof value === "string") {
                node.setAttribute("value", value.toLowerCase());
                node.setAttribute("type", "string");
                node.simplyValue = value;
            } else if (typeof value === "number") {
                node.setAttribute("value", value);
                node.setAttribute("type", "number");
                node.simplyValue = value;
            } else if (value === null) {
                node.simplyValue = value;
            } else if (typeof value === "object" && value.constructor === Array) {
                for (i=0; i<value.length; i++) {
                    node.appendChild(renderNode("entry", value[i]));
                }
            } else if (typeof value === "object") { 
                for (i in value) {
                    var newChild = renderNode(i, value[i]);
                    node.appendChild(newChild);
                }
            } else {
                console.log("Hier kan ik niks mee");
                console.log(typeof value);
                console.log(value);
            }
        };

        var renderNode = function(key, value) {
            var node;
            if (key.match(/[^A-Za-z_-]/)) {
                node = document.createElement("node");
            } else {
                node = document.createElement(key);
            }

            if (value === null) {
                node.setAttribute("type", "null");
            } else if ((typeof value === "object") && value.constructor === Array) {
                node.setAttribute("type", "array");
            } else {
                node.setAttribute("type", "object");
            }

            node.setAttribute("name", key);
            renderData(node, value);
            node.simplyValue = value;
            return node;
        };

        var filterNodes = function(nodes, query) {
            var result = [];
            for (var i=0; i<nodes.length; i++) {
                if (nodes[i].querySelector(query)) {
                    result.push(nodes[i]);
                }
            }
            return result;
        };

        var searchNodes = function(tree, queries) {
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
                result.push({
                    key : resultNodes[i].getAttribute('name'),
                    value : resultNodes[i].simplyValue
                });
            }
            return result;            
        };

        return {
            init : function(data) {
                if (data.hasOwnProperty("search")) {
                    return;
                }

                Object.defineProperty(data, "search", {
                    get : function() {
                        return function() {
                        //    console.time("search");
                            if (!this.hasOwnProperty("searchElement")) {
                                var searchElement = document.createElement("search");
                                renderData(searchElement, this);
                                Object.defineProperty(this, "searchElement", {
                                    get : function() {
                                        return searchElement;
                                    },
                                    enumerable : false,
                                    configurable : false
                                });
                            }
                            var result = searchNodes(this.searchElement, arguments);
                        //    console.timeEnd("search");
                            return result;
                        }
                    },
                    enumerable : false,
                    configurable : false
                });
            }
        }
    }();
    