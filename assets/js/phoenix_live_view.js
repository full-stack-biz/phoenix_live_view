module.exports = /******/ (function (modules, runtime) {
  // webpackBootstrap
  /******/ "use strict"; // The module cache
  /******/ /******/ var installedModules = {}; // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {},
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    ); // Flag the module as loaded
    /******/
    /******/ /******/ module.l = true; // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ __webpack_require__.ab = __dirname + "/"; // the startup function
  /******/
  /******/ /******/ function startup() {
    /******/ // Load entry module and return exports
    /******/ return __webpack_require__(362);
    /******/
  } // initialize runtime
  /******/ /******/ runtime(__webpack_require__); // run startup
  /******/
  /******/ /******/ return startup();
  /******/
})(
  /************************************************************************/
  /******/ {
    /***/ 340: /***/ function (module) {
      "use strict";

      var DOCUMENT_FRAGMENT_NODE = 11;

      function morphAttrs(fromNode, toNode) {
        var toNodeAttrs = toNode.attributes;
        var attr;
        var attrName;
        var attrNamespaceURI;
        var attrValue;
        var fromValue;

        // document-fragments dont have attributes so lets not do anything
        if (
          toNode.nodeType === DOCUMENT_FRAGMENT_NODE ||
          fromNode.nodeType === DOCUMENT_FRAGMENT_NODE
        ) {
          return;
        }

        // update attributes on original DOM element
        for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
          attr = toNodeAttrs[i];
          attrName = attr.name;
          attrNamespaceURI = attr.namespaceURI;
          attrValue = attr.value;

          if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

            if (fromValue !== attrValue) {
              if (attr.prefix === "xmlns") {
                attrName = attr.name; // It's not allowed to set an attribute with the XMLNS namespace without specifying the `xmlns` prefix
              }
              fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
          } else {
            fromValue = fromNode.getAttribute(attrName);

            if (fromValue !== attrValue) {
              fromNode.setAttribute(attrName, attrValue);
            }
          }
        }

        // Remove any extra attributes found on the original DOM element that
        // weren't found on the target element.
        var fromNodeAttrs = fromNode.attributes;

        for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
          attr = fromNodeAttrs[d];
          attrName = attr.name;
          attrNamespaceURI = attr.namespaceURI;

          if (attrNamespaceURI) {
            attrName = attr.localName || attrName;

            if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
              fromNode.removeAttributeNS(attrNamespaceURI, attrName);
            }
          } else {
            if (!toNode.hasAttribute(attrName)) {
              fromNode.removeAttribute(attrName);
            }
          }
        }
      }

      var range; // Create a range object for efficently rendering strings to elements.
      var NS_XHTML = "http://www.w3.org/1999/xhtml";

      var doc = typeof document === "undefined" ? undefined : document;
      var HAS_TEMPLATE_SUPPORT =
        !!doc && "content" in doc.createElement("template");
      var HAS_RANGE_SUPPORT =
        !!doc &&
        doc.createRange &&
        "createContextualFragment" in doc.createRange();

      function createFragmentFromTemplate(str) {
        var template = doc.createElement("template");
        template.innerHTML = str;
        return template.content.childNodes[0];
      }

      function createFragmentFromRange(str) {
        if (!range) {
          range = doc.createRange();
          range.selectNode(doc.body);
        }

        var fragment = range.createContextualFragment(str);
        return fragment.childNodes[0];
      }

      function createFragmentFromWrap(str) {
        var fragment = doc.createElement("body");
        fragment.innerHTML = str;
        return fragment.childNodes[0];
      }

      /**
       * This is about the same
       * var html = new DOMParser().parseFromString(str, 'text/html');
       * return html.body.firstChild;
       *
       * @method toElement
       * @param {String} str
       */
      function toElement(str) {
        str = str.trim();
        if (HAS_TEMPLATE_SUPPORT) {
          // avoid restrictions on content for things like `<tr><th>Hi</th></tr>` which
          // createContextualFragment doesn't support
          // <template> support not available in IE
          return createFragmentFromTemplate(str);
        } else if (HAS_RANGE_SUPPORT) {
          return createFragmentFromRange(str);
        }

        return createFragmentFromWrap(str);
      }

      /**
       * Returns true if two node's names are the same.
       *
       * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
       *       nodeName and different namespace URIs.
       *
       * @param {Element} a
       * @param {Element} b The target element
       * @return {boolean}
       */
      function compareNodeNames(fromEl, toEl) {
        var fromNodeName = fromEl.nodeName;
        var toNodeName = toEl.nodeName;

        if (fromNodeName === toNodeName) {
          return true;
        }

        if (
          toEl.actualize &&
          fromNodeName.charCodeAt(0) < 91 /* from tag name is upper case */ &&
          toNodeName.charCodeAt(0) > 90 /* target tag name is lower case */
        ) {
          // If the target element is a virtual DOM node then we may need to normalize the tag name
          // before comparing. Normal HTML elements that are in the "http://www.w3.org/1999/xhtml"
          // are converted to upper case
          return fromNodeName === toNodeName.toUpperCase();
        } else {
          return false;
        }
      }

      /**
       * Create an element, optionally with a known namespace URI.
       *
       * @param {string} name the element name, e.g. 'div' or 'svg'
       * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
       * its `xmlns` attribute or its inferred namespace.
       *
       * @return {Element}
       */
      function createElementNS(name, namespaceURI) {
        return !namespaceURI || namespaceURI === NS_XHTML
          ? doc.createElement(name)
          : doc.createElementNS(namespaceURI, name);
      }

      /**
       * Copies the children of one DOM element to another DOM element
       */
      function moveChildren(fromEl, toEl) {
        var curChild = fromEl.firstChild;
        while (curChild) {
          var nextChild = curChild.nextSibling;
          toEl.appendChild(curChild);
          curChild = nextChild;
        }
        return toEl;
      }

      function syncBooleanAttrProp(fromEl, toEl, name) {
        if (fromEl[name] !== toEl[name]) {
          fromEl[name] = toEl[name];
          if (fromEl[name]) {
            fromEl.setAttribute(name, "");
          } else {
            fromEl.removeAttribute(name);
          }
        }
      }

      var specialElHandlers = {
        OPTION: function (fromEl, toEl) {
          var parentNode = fromEl.parentNode;
          if (parentNode) {
            var parentName = parentNode.nodeName.toUpperCase();
            if (parentName === "OPTGROUP") {
              parentNode = parentNode.parentNode;
              parentName = parentNode && parentNode.nodeName.toUpperCase();
            }
            if (
              parentName === "SELECT" &&
              !parentNode.hasAttribute("multiple")
            ) {
              if (fromEl.hasAttribute("selected") && !toEl.selected) {
                // Workaround for MS Edge bug where the 'selected' attribute can only be
                // removed if set to a non-empty value:
                // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12087679/
                fromEl.setAttribute("selected", "selected");
                fromEl.removeAttribute("selected");
              }
              // We have to reset select element's selectedIndex to -1, otherwise setting
              // fromEl.selected using the syncBooleanAttrProp below has no effect.
              // The correct selectedIndex will be set in the SELECT special handler below.
              parentNode.selectedIndex = -1;
            }
          }
          syncBooleanAttrProp(fromEl, toEl, "selected");
        },
        /**
         * The "value" attribute is special for the <input> element since it sets
         * the initial value. Changing the "value" attribute without changing the
         * "value" property will have no effect since it is only used to the set the
         * initial value.  Similar for the "checked" attribute, and "disabled".
         */
        INPUT: function (fromEl, toEl) {
          syncBooleanAttrProp(fromEl, toEl, "checked");
          syncBooleanAttrProp(fromEl, toEl, "disabled");

          if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
          }

          if (!toEl.hasAttribute("value")) {
            fromEl.removeAttribute("value");
          }
        },

        TEXTAREA: function (fromEl, toEl) {
          var newValue = toEl.value;
          if (fromEl.value !== newValue) {
            fromEl.value = newValue;
          }

          var firstChild = fromEl.firstChild;
          if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (
              oldValue == newValue ||
              (!newValue && oldValue == fromEl.placeholder)
            ) {
              return;
            }

            firstChild.nodeValue = newValue;
          }
        },
        SELECT: function (fromEl, toEl) {
          if (!toEl.hasAttribute("multiple")) {
            var selectedIndex = -1;
            var i = 0;
            // We have to loop through children of fromEl, not toEl since nodes can be moved
            // from toEl to fromEl directly when morphing.
            // At the time this special handler is invoked, all children have already been morphed
            // and appended to / removed from fromEl, so using fromEl here is safe and correct.
            var curChild = fromEl.firstChild;
            var optgroup;
            var nodeName;
            while (curChild) {
              nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
              if (nodeName === "OPTGROUP") {
                optgroup = curChild;
                curChild = optgroup.firstChild;
              } else {
                if (nodeName === "OPTION") {
                  if (curChild.hasAttribute("selected")) {
                    selectedIndex = i;
                    break;
                  }
                  i++;
                }
                curChild = curChild.nextSibling;
                if (!curChild && optgroup) {
                  curChild = optgroup.nextSibling;
                  optgroup = null;
                }
              }
            }

            fromEl.selectedIndex = selectedIndex;
          }
        },
      };

      var ELEMENT_NODE = 1;
      var DOCUMENT_FRAGMENT_NODE$1 = 11;
      var TEXT_NODE = 3;
      var COMMENT_NODE = 8;

      function noop() {}

      function defaultGetNodeKey(node) {
        if (node) {
          return (node.getAttribute && node.getAttribute("id")) || node.id;
        }
      }

      function morphdomFactory(morphAttrs) {
        return function morphdom(fromNode, toNode, options) {
          if (!options) {
            options = {};
          }

          if (typeof toNode === "string") {
            if (
              fromNode.nodeName === "#document" ||
              fromNode.nodeName === "HTML"
            ) {
              var toNodeHtml = toNode;
              toNode = doc.createElement("html");
              toNode.innerHTML = toNodeHtml;
            } else {
              toNode = toElement(toNode);
            }
          }

          var getNodeKey = options.getNodeKey || defaultGetNodeKey;
          var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
          var onNodeAdded = options.onNodeAdded || noop;
          var onBeforeElUpdated = options.onBeforeElUpdated || noop;
          var onElUpdated = options.onElUpdated || noop;
          var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
          var onNodeDiscarded = options.onNodeDiscarded || noop;
          var onBeforeElChildrenUpdated =
            options.onBeforeElChildrenUpdated || noop;
          var childrenOnly = options.childrenOnly === true;

          // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
          var fromNodesLookup = Object.create(null);
          var keyedRemovalList = [];

          function addKeyedRemoval(key) {
            keyedRemovalList.push(key);
          }

          function walkDiscardedChildNodes(node, skipKeyedNodes) {
            if (node.nodeType === ELEMENT_NODE) {
              var curChild = node.firstChild;
              while (curChild) {
                var key = undefined;

                if (skipKeyedNodes && (key = getNodeKey(curChild))) {
                  // If we are skipping keyed nodes then we add the key
                  // to a list so that it can be handled at the very end.
                  addKeyedRemoval(key);
                } else {
                  // Only report the node as discarded if it is not keyed. We do this because
                  // at the end we loop through all keyed elements that were unmatched
                  // and then discard them in one final pass.
                  onNodeDiscarded(curChild);
                  if (curChild.firstChild) {
                    walkDiscardedChildNodes(curChild, skipKeyedNodes);
                  }
                }

                curChild = curChild.nextSibling;
              }
            }
          }

          /**
           * Removes a DOM node out of the original DOM
           *
           * @param  {Node} node The node to remove
           * @param  {Node} parentNode The nodes parent
           * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
           * @return {undefined}
           */
          function removeNode(node, parentNode, skipKeyedNodes) {
            if (onBeforeNodeDiscarded(node) === false) {
              return;
            }

            if (parentNode) {
              parentNode.removeChild(node);
            }

            onNodeDiscarded(node);
            walkDiscardedChildNodes(node, skipKeyedNodes);
          }

          // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
          // function indexTree(root) {
          //     var treeWalker = document.createTreeWalker(
          //         root,
          //         NodeFilter.SHOW_ELEMENT);
          //
          //     var el;
          //     while((el = treeWalker.nextNode())) {
          //         var key = getNodeKey(el);
          //         if (key) {
          //             fromNodesLookup[key] = el;
          //         }
          //     }
          // }

          // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
          //
          // function indexTree(node) {
          //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
          //     var el;
          //     while((el = nodeIterator.nextNode())) {
          //         var key = getNodeKey(el);
          //         if (key) {
          //             fromNodesLookup[key] = el;
          //         }
          //     }
          // }

          function indexTree(node) {
            if (
              node.nodeType === ELEMENT_NODE ||
              node.nodeType === DOCUMENT_FRAGMENT_NODE$1
            ) {
              var curChild = node.firstChild;
              while (curChild) {
                var key = getNodeKey(curChild);
                if (key) {
                  fromNodesLookup[key] = curChild;
                }

                // Walk recursively
                indexTree(curChild);

                curChild = curChild.nextSibling;
              }
            }
          }

          indexTree(fromNode);

          function handleNodeAdded(el) {
            onNodeAdded(el);

            var curChild = el.firstChild;
            while (curChild) {
              var nextSibling = curChild.nextSibling;

              var key = getNodeKey(curChild);
              if (key) {
                var unmatchedFromEl = fromNodesLookup[key];
                if (
                  unmatchedFromEl &&
                  compareNodeNames(curChild, unmatchedFromEl)
                ) {
                  curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
                  morphEl(unmatchedFromEl, curChild);
                }
              }

              handleNodeAdded(curChild);
              curChild = nextSibling;
            }
          }

          function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
            // We have processed all of the "to nodes". If curFromNodeChild is
            // non-null then we still have some from nodes left over that need
            // to be removed
            while (curFromNodeChild) {
              var fromNextSibling = curFromNodeChild.nextSibling;
              if ((curFromNodeKey = getNodeKey(curFromNodeChild))) {
                // Since the node is keyed it might be matched up later so we defer
                // the actual removal to later
                addKeyedRemoval(curFromNodeKey);
              } else {
                // NOTE: we skip nested keyed nodes from being removed since there is
                //       still a chance they will be matched up later
                removeNode(
                  curFromNodeChild,
                  fromEl,
                  true /* skip keyed nodes */
                );
              }
              curFromNodeChild = fromNextSibling;
            }
          }

          function morphEl(fromEl, toEl, childrenOnly) {
            var toElKey = getNodeKey(toEl);

            if (toElKey) {
              // If an element with an ID is being morphed then it will be in the final
              // DOM so clear it out of the saved elements collection
              delete fromNodesLookup[toElKey];
            }

            if (!childrenOnly) {
              // optional
              if (onBeforeElUpdated(fromEl, toEl) === false) {
                return;
              }

              // update attributes on original DOM element first
              morphAttrs(fromEl, toEl);
              // optional
              onElUpdated(fromEl);

              if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                return;
              }
            }

            if (fromEl.nodeName !== "TEXTAREA") {
              morphChildren(fromEl, toEl);
            } else {
              specialElHandlers.TEXTAREA(fromEl, toEl);
            }
          }

          function morphChildren(fromEl, toEl) {
            var curToNodeChild = toEl.firstChild;
            var curFromNodeChild = fromEl.firstChild;
            var curToNodeKey;
            var curFromNodeKey;

            var fromNextSibling;
            var toNextSibling;
            var matchingFromEl;

            // walk the children
            outer: while (curToNodeChild) {
              toNextSibling = curToNodeChild.nextSibling;
              curToNodeKey = getNodeKey(curToNodeChild);

              // walk the fromNode children all the way through
              while (curFromNodeChild) {
                fromNextSibling = curFromNodeChild.nextSibling;

                if (
                  curToNodeChild.isSameNode &&
                  curToNodeChild.isSameNode(curFromNodeChild)
                ) {
                  curToNodeChild = toNextSibling;
                  curFromNodeChild = fromNextSibling;
                  continue outer;
                }

                curFromNodeKey = getNodeKey(curFromNodeChild);

                var curFromNodeType = curFromNodeChild.nodeType;

                // this means if the curFromNodeChild doesnt have a match with the curToNodeChild
                var isCompatible = undefined;

                if (curFromNodeType === curToNodeChild.nodeType) {
                  if (curFromNodeType === ELEMENT_NODE) {
                    // Both nodes being compared are Element nodes

                    if (curToNodeKey) {
                      // The target node has a key so we want to match it up with the correct element
                      // in the original DOM tree
                      if (curToNodeKey !== curFromNodeKey) {
                        // The current element in the original DOM tree does not have a matching key so
                        // let's check our lookup to see if there is a matching element in the original
                        // DOM tree
                        if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                          if (fromNextSibling === matchingFromEl) {
                            // Special case for single element removals. To avoid removing the original
                            // DOM node out of the tree (since that can break CSS transitions, etc.),
                            // we will instead discard the current node and wait until the next
                            // iteration to properly match up the keyed target element with its matching
                            // element in the original tree
                            isCompatible = false;
                          } else {
                            // We found a matching keyed element somewhere in the original DOM tree.
                            // Let's move the original DOM node into the current position and morph
                            // it.

                            // NOTE: We use insertBefore instead of replaceChild because we want to go through
                            // the `removeNode()` function for the node that is being discarded so that
                            // all lifecycle hooks are correctly invoked
                            fromEl.insertBefore(
                              matchingFromEl,
                              curFromNodeChild
                            );

                            // fromNextSibling = curFromNodeChild.nextSibling;

                            if (curFromNodeKey) {
                              // Since the node is keyed it might be matched up later so we defer
                              // the actual removal to later
                              addKeyedRemoval(curFromNodeKey);
                            } else {
                              // NOTE: we skip nested keyed nodes from being removed since there is
                              //       still a chance they will be matched up later
                              removeNode(
                                curFromNodeChild,
                                fromEl,
                                true /* skip keyed nodes */
                              );
                            }

                            curFromNodeChild = matchingFromEl;
                          }
                        } else {
                          // The nodes are not compatible since the "to" node has a key and there
                          // is no matching keyed node in the source tree
                          isCompatible = false;
                        }
                      }
                    } else if (curFromNodeKey) {
                      // The original has a key
                      isCompatible = false;
                    }

                    isCompatible =
                      isCompatible !== false &&
                      compareNodeNames(curFromNodeChild, curToNodeChild);
                    if (isCompatible) {
                      // We found compatible DOM elements so transform
                      // the current "from" node to match the current
                      // target DOM node.
                      // MORPH
                      morphEl(curFromNodeChild, curToNodeChild);
                    }
                  } else if (
                    curFromNodeType === TEXT_NODE ||
                    curFromNodeType == COMMENT_NODE
                  ) {
                    // Both nodes being compared are Text or Comment nodes
                    isCompatible = true;
                    // Simply update nodeValue on the original node to
                    // change the text value
                    if (
                      curFromNodeChild.nodeValue !== curToNodeChild.nodeValue
                    ) {
                      curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                    }
                  }
                }

                if (isCompatible) {
                  // Advance both the "to" child and the "from" child since we found a match
                  // Nothing else to do as we already recursively called morphChildren above
                  curToNodeChild = toNextSibling;
                  curFromNodeChild = fromNextSibling;
                  continue outer;
                }

                // No compatible match so remove the old node from the DOM and continue trying to find a
                // match in the original DOM. However, we only do this if the from node is not keyed
                // since it is possible that a keyed node might match up with a node somewhere else in the
                // target tree and we don't want to discard it just yet since it still might find a
                // home in the final DOM tree. After everything is done we will remove any keyed nodes
                // that didn't find a home
                if (curFromNodeKey) {
                  // Since the node is keyed it might be matched up later so we defer
                  // the actual removal to later
                  addKeyedRemoval(curFromNodeKey);
                } else {
                  // NOTE: we skip nested keyed nodes from being removed since there is
                  //       still a chance they will be matched up later
                  removeNode(
                    curFromNodeChild,
                    fromEl,
                    true /* skip keyed nodes */
                  );
                }

                curFromNodeChild = fromNextSibling;
              } // END: while(curFromNodeChild) {}

              // If we got this far then we did not find a candidate match for
              // our "to node" and we exhausted all of the children "from"
              // nodes. Therefore, we will just append the current "to" node
              // to the end
              if (
                curToNodeKey &&
                (matchingFromEl = fromNodesLookup[curToNodeKey]) &&
                compareNodeNames(matchingFromEl, curToNodeChild)
              ) {
                fromEl.appendChild(matchingFromEl);
                // MORPH
                morphEl(matchingFromEl, curToNodeChild);
              } else {
                var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
                if (onBeforeNodeAddedResult !== false) {
                  if (onBeforeNodeAddedResult) {
                    curToNodeChild = onBeforeNodeAddedResult;
                  }

                  if (curToNodeChild.actualize) {
                    curToNodeChild = curToNodeChild.actualize(
                      fromEl.ownerDocument || doc
                    );
                  }
                  fromEl.appendChild(curToNodeChild);
                  handleNodeAdded(curToNodeChild);
                }
              }

              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
            }

            cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);

            var specialElHandler = specialElHandlers[fromEl.nodeName];
            if (specialElHandler) {
              specialElHandler(fromEl, toEl);
            }
          } // END: morphChildren(...)

          var morphedNode = fromNode;
          var morphedNodeType = morphedNode.nodeType;
          var toNodeType = toNode.nodeType;

          if (!childrenOnly) {
            // Handle the case where we are given two DOM nodes that are not
            // compatible (e.g. <div> --> <span> or <div> --> TEXT)
            if (morphedNodeType === ELEMENT_NODE) {
              if (toNodeType === ELEMENT_NODE) {
                if (!compareNodeNames(fromNode, toNode)) {
                  onNodeDiscarded(fromNode);
                  morphedNode = moveChildren(
                    fromNode,
                    createElementNS(toNode.nodeName, toNode.namespaceURI)
                  );
                }
              } else {
                // Going from an element node to a text node
                morphedNode = toNode;
              }
            } else if (
              morphedNodeType === TEXT_NODE ||
              morphedNodeType === COMMENT_NODE
            ) {
              // Text or comment node
              if (toNodeType === morphedNodeType) {
                if (morphedNode.nodeValue !== toNode.nodeValue) {
                  morphedNode.nodeValue = toNode.nodeValue;
                }

                return morphedNode;
              } else {
                // Text node to something else
                morphedNode = toNode;
              }
            }
          }

          if (morphedNode === toNode) {
            // The "to node" was not compatible with the "from node" so we had to
            // toss out the "from node" and use the "to node"
            onNodeDiscarded(fromNode);
          } else {
            if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
              return;
            }

            morphEl(morphedNode, toNode, childrenOnly);

            // We now need to loop over any keyed nodes that might need to be
            // removed. We only do the removal if we know that the keyed node
            // never found a match. When a keyed node is matched up we remove
            // it out of fromNodesLookup and we use fromNodesLookup to determine
            // if a keyed node has been matched up or not
            if (keyedRemovalList) {
              for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
                var elToRemove = fromNodesLookup[keyedRemovalList[i]];
                if (elToRemove) {
                  removeNode(elToRemove, elToRemove.parentNode, false);
                }
              }
            }
          }

          if (
            !childrenOnly &&
            morphedNode !== fromNode &&
            fromNode.parentNode
          ) {
            if (morphedNode.actualize) {
              morphedNode = morphedNode.actualize(
                fromNode.ownerDocument || doc
              );
            }
            // If we had to swap out the from node with a new node because the old
            // node was not compatible with the target node then we need to
            // replace the old DOM node in the original DOM tree. This is only
            // possible if the original DOM node was part of a DOM tree which
            // we know is the case if it has a parent node.
            fromNode.parentNode.replaceChild(morphedNode, fromNode);
          }

          return morphedNode;
        };
      }

      var morphdom = morphdomFactory(morphAttrs);

      module.exports = morphdom;

      /***/
    },

    /***/ 362: /***/ function (
      __unusedmodule,
      __webpack_exports__,
      __webpack_require__
    ) {
      "use strict";
      __webpack_require__.r(__webpack_exports__);

      // CONCATENATED MODULE: ./src/constants.ts
      var CONSECUTIVE_RELOADS = "consecutive-reloads";
      var MAX_RELOADS = 10;
      var RELOAD_JITTER = [1000, 3000];
      var FAILSAFE_JITTER = 30000;
      var PHX_VIEW = "data-phx-view";
      var PHX_EVENT_CLASSES = [
        "phx-click-loading",
        "phx-change-loading",
        "phx-submit-loading",
        "phx-keydown-loading",
        "phx-keyup-loading",
        "phx-blur-loading",
        "phx-focus-loading",
      ];
      var PHX_COMPONENT = "data-phx-component";
      var PHX_LIVE_LINK = "data-phx-link";
      var PHX_LINK_STATE = "data-phx-link-state";
      var PHX_REF = "data-phx-ref";
      var PHX_SKIP = "data-phx-skip";
      var PHX_REMOVE = "data-phx-remove";
      var PHX_PAGE_LOADING = "page-loading";
      var PHX_CONNECTED_CLASS = "phx-connected";
      var PHX_DISCONNECTED_CLASS = "phx-disconnected";
      var PHX_NO_FEEDBACK_CLASS = "phx-no-feedback";
      var PHX_ERROR_CLASS = "phx-error";
      var PHX_PARENT_ID = "data-phx-parent-id";
      var PHX_VIEW_SELECTOR = "[" + PHX_VIEW + "]";
      var PHX_MAIN = "data-phx-main";
      var PHX_ROOT_ID = "data-phx-root-id";
      var PHX_TRIGGER_ACTION = "trigger-action";
      var PHX_FEEDBACK_FOR = "feedback-for";
      var PHX_HAS_FOCUSED = "phx-has-focused";
      var FOCUSABLE_INPUTS = [
        "text",
        "textarea",
        "number",
        "email",
        "password",
        "search",
        "tel",
        "url",
        "date",
        "time",
      ];
      var CHECKABLE_INPUTS = ["checkbox", "radio"];
      var PHX_HAS_SUBMITTED = "phx-has-submitted";
      var PHX_SESSION = "data-phx-session";
      var PHX_STATIC = "data-phx-static";
      var PHX_READONLY = "data-phx-readonly";
      var PHX_DISABLED = "data-phx-disabled";
      var PHX_DISABLE_WITH = "disable-with";
      var PHX_DISABLE_WITH_RESTORE = "data-phx-disable-with-restore";
      var PHX_HOOK = "hook";
      var PHX_DEBOUNCE = "debounce";
      var PHX_THROTTLE = "throttle";
      var PHX_CHANGE_EVENT = "phx-change";
      var PHX_UPDATE = "update";
      var PHX_KEY = "key";
      var PHX_PRIVATE = "phxPrivate";
      var PHX_AUTO_RECOVER = "auto-recover";
      var PHX_LV_DEBUG = "phx:live-socket:debug";
      var PHX_LV_PROFILE = "phx:live-socket:profiling";
      var PHX_LV_LATENCY_SIM = "phx:live-socket:latency-sim";
      var LOADER_TIMEOUT = 1;
      var BEFORE_UNLOAD_LOADER_TIMEOUT = 200;
      var BINDING_PREFIX = "phx-";
      var PUSH_TIMEOUT = 30000;
      var LINK_HEADER = "x-requested-with";
      var DEBOUNCE_BLUR = "debounce-blur";
      var DEBOUNCE_TIMER = "debounce-timer";
      var DEBOUNCE_BLUR_TIMER = "debounce-blur-timer";
      var DEBOUNCE_PREV_KEY = "debounce-prev-key";
      var DEFAULTS = {
        debounce: 300,
        throttle: 300,
      };
      // Rendered
      var DYNAMICS = "d";
      var STATIC = "s";
      var COMPONENTS = "c";

      // CONCATENATED MODULE: ./src/browser.ts

      var Browser = {
        canPushState: function () {
          return typeof history.pushState !== "undefined";
        },
        dropLocal: function (namespace, subkey) {
          return window.localStorage.removeItem(
            this.localKey(namespace, subkey)
          );
        },
        updateLocal: function (namespace, subkey, initial, func) {
          var current = this.getLocal(namespace, subkey);
          var key = this.localKey(namespace, subkey);
          var newVal = current === null ? initial : func(current);
          window.localStorage.setItem(key, JSON.stringify(newVal));
          return newVal;
        },
        getLocal: function (namespace, subkey) {
          return JSON.parse(
            window.localStorage.getItem(this.localKey(namespace, subkey))
          );
        },
        fetchPage: function (href, callback) {
          var req = new XMLHttpRequest();
          req.open("GET", href, true);
          req.timeout = PUSH_TIMEOUT;
          req.setRequestHeader("content-type", "text/html");
          req.setRequestHeader(
            "cache-control",
            "max-age=0, no-cache, no-store, must-revalidate, post-check=0, pre-check=0"
          );
          req.setRequestHeader(LINK_HEADER, "live-link");
          req.onerror = function () {
            return callback(400);
          };
          req.ontimeout = function () {
            return callback(504);
          };
          req.onreadystatechange = function () {
            if (req.readyState !== 4) {
              return;
            }
            if (req.getResponseHeader(LINK_HEADER) !== "live-link") {
              return callback(400);
            }
            if (req.status !== 200) {
              return callback(req.status);
            }
            callback(200, req.responseText);
          };
          req.send();
        },
        pushState: function (kind, meta, to) {
          if (this.canPushState()) {
            if (to !== window.location.href) {
              history[kind + "State"](meta, "", to || null); // IE will coerce undefined to string
              var hashEl = this.getHashTargetEl(window.location.hash);
              if (hashEl) {
                hashEl.scrollIntoView();
              } else if (meta.type === "redirect") {
                window.scroll(0, 0);
              }
            }
          } else {
            this.redirect(to);
          }
        },
        setCookie: function (name, value) {
          document.cookie = name + "=" + value;
        },
        getCookie: function (name) {
          return document.cookie.replace(
            new RegExp("(?:(?:^|.*;s*)" + name + "s*=s*([^;]*).*$)|^.*$"),
            "$1"
          );
        },
        redirect: function (toURL, flash) {
          if (flash) {
            Browser.setCookie(
              "__phoenix_flash__",
              flash + "; max-age=60000; path=/"
            );
          }
          window.location = toURL;
        },
        localKey: function (namespace, subkey) {
          return namespace + "-" + subkey;
        },
        getHashTargetEl: function (hash) {
          if (hash.toString() === "") {
            return;
          }
          return (
            document.getElementById(hash) ||
            document.querySelector('a[name="' + hash.substring(1) + '"]')
          );
        },
      };

      // CONCATENATED MODULE: ./src/util.ts
      var __values =
        (undefined && undefined.__values) ||
        function (o) {
          var s = typeof Symbol === "function" && Symbol.iterator,
            m = s && o[s],
            i = 0;
          if (m) return m.call(o);
          if (o && typeof o.length === "number")
            return {
              next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
              },
            };
          throw new TypeError(
            s ? "Object is not iterable." : "Symbol.iterator is not defined."
          );
        };
      var __read =
        (undefined && undefined.__read) ||
        function (o, n) {
          var m = typeof Symbol === "function" && o[Symbol.iterator];
          if (!m) return o;
          var i = m.call(o),
            r,
            ar = [],
            e;
          try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
              ar.push(r.value);
          } catch (error) {
            e = { error: error };
          } finally {
            try {
              if (r && !r.done && (m = i["return"])) m.call(i);
            } finally {
              if (e) throw e.error;
            }
          }
          return ar;
        };

      var logError = function (msg, obj) {
        console.error && console.error(msg, obj);
        return undefined;
      };
      // wraps value in closure or returns closure
      var closure = function (val) {
        return typeof val === "function"
          ? val
          : function () {
              return val;
            };
      };
      var clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
      };
      function detectDuplicateIds() {
        var ids = new Set();
        var elems = document.querySelectorAll("*[id]");
        for (var i = 0, len = elems.length; i < len; i++) {
          if (ids.has(elems[i].id)) {
            console.error(
              "Multiple IDs detected: " +
                elems[i].id +
                ". Ensure unique element ids."
            );
          } else {
            ids.add(elems[i].id);
          }
        }
      }
      var maybe = function (el, callback) {
        return el && callback(el);
      };
      var isObject = function (obj) {
        return (
          obj !== null && typeof obj === "object" && !(obj instanceof Array)
        );
      };
      var isEqualObj = function (obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
      };
      var isEmpty = function (obj) {
        return Object.keys(obj).length == 0;
      };
      var serializeForm = function (form, meta) {
        var e_1, _a;
        if (meta === void 0) {
          meta = {};
        }
        var formData = new FormData(form);
        var params = new URLSearchParams();
        try {
          for (
            var _b = __values(formData.entries()), _c = _b.next();
            !_c.done;
            _c = _b.next()
          ) {
            var _d = __read(_c.value, 2),
              key = _d[0],
              val = _d[1];
            params.append(key, val.toString());
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        for (var metaKey in meta) {
          params.append(metaKey, meta[metaKey]);
        }
        return params.toString();
      };
      var closestPhxBinding = function (el, binding, borderEl) {
        do {
          if (el.matches("[" + binding + "]")) {
            return el;
          }
          el = el.parentElement || el.parentNode;
        } while (
          el !== null &&
          el.nodeType === 1 &&
          !(
            (borderEl && borderEl.isSameNode(el)) ||
            el.matches(PHX_VIEW_SELECTOR)
          )
        );
        return null;
      };

      // EXTERNAL MODULE: ./node_modules/morphdom/dist/morphdom.js
      var morphdom = __webpack_require__(340);
      var morphdom_default = /*#__PURE__*/ __webpack_require__.n(morphdom);

      // CONCATENATED MODULE: ./src/dom.ts
      var dom_read =
        (undefined && undefined.__read) ||
        function (o, n) {
          var m = typeof Symbol === "function" && o[Symbol.iterator];
          if (!m) return o;
          var i = m.call(o),
            r,
            ar = [],
            e;
          try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
              ar.push(r.value);
          } catch (error) {
            e = { error: error };
          } finally {
            try {
              if (r && !r.done && (m = i["return"])) m.call(i);
            } finally {
              if (e) throw e.error;
            }
          }
          return ar;
        };
      var __spread =
        (undefined && undefined.__spread) ||
        function () {
          for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(dom_read(arguments[i]));
          return ar;
        };

      var DOM = {
        byId: function (id) {
          return (
            document.getElementById(id) || logError("no id found for " + id)
          );
        },
        removeClass: function (el, className) {
          el.classList.remove(className);
          if (el.classList.length === 0) {
            el.removeAttribute("class");
          }
        },
        all: function (node, query) {
          return Array.from(node.querySelectorAll(query));
        },
        each: function (node, query, callback) {
          this.all(node, query).forEach(callback);
        },
        findFirstComponentNode: function (node, cid) {
          return node.querySelector("[" + PHX_COMPONENT + '="' + cid + '"]');
        },
        findComponentNodeList: function (node, cid) {
          return this.all(node, "[" + PHX_COMPONENT + '="' + cid + '"]');
        },
        findPhxChildrenInFragment: function (html, parentId) {
          var template = document.createElement("template");
          template.innerHTML = html;
          return this.findPhxChildren(template.content, parentId);
        },
        isPhxUpdate: function (el, phxUpdate, updateTypes) {
          return (
            el.getAttribute &&
            updateTypes.indexOf(el.getAttribute(phxUpdate)) >= 0
          );
        },
        findPhxChildren: function (el, parentId) {
          return this.all(
            el,
            PHX_VIEW_SELECTOR + "[" + PHX_PARENT_ID + '="' + parentId + '"]'
          );
        },
        findParentCIDs: function (node, cids) {
          var _this = this;
          var initial = new Set(cids);
          return cids.reduce(function (acc, cid) {
            var selector =
              "[" + PHX_COMPONENT + '="' + cid + '"] [' + PHX_COMPONENT + "]";
            _this
              .all(node, selector)
              .map(function (el) {
                return parseInt(el.getAttribute(PHX_COMPONENT));
              })
              .forEach(function (childCID) {
                return acc.delete(childCID);
              });
            return acc;
          }, initial);
        },
        private: function (el, key) {
          return el[PHX_PRIVATE] && el[PHX_PRIVATE][key];
        },
        deletePrivate: function (el, key) {
          el[PHX_PRIVATE] && delete el[PHX_PRIVATE][key];
        },
        putPrivate: function (el, key, value) {
          if (!el[PHX_PRIVATE]) {
            el[PHX_PRIVATE] = {};
          }
          el[PHX_PRIVATE][key] = value;
        },
        copyPrivates: function (target, source) {
          if (source[PHX_PRIVATE]) {
            target[PHX_PRIVATE] = clone(source[PHX_PRIVATE]);
          }
        },
        putTitle: function (str) {
          var titleEl = document.querySelector("title");
          var _a = titleEl.dataset,
            prefix = _a.prefix,
            suffix = _a.suffix;
          document.title = "" + (prefix || "") + str + (suffix || "");
        },
        debounce: function (
          el,
          event,
          phxDebounce,
          defaultDebounce,
          phxThrottle,
          defaultThrottle,
          callback
        ) {
          var _this = this;
          var debounce = el.getAttribute(phxDebounce);
          var throttle = el.getAttribute(phxThrottle);
          if (debounce === "") {
            debounce = defaultDebounce;
          }
          if (throttle === "") {
            throttle = defaultThrottle;
          }
          var value = debounce || throttle;
          switch (value) {
            case null: {
              return callback();
            }
            case "blur": {
              if (this.private(el, DEBOUNCE_BLUR)) {
                return;
              }
              el.addEventListener("blur", function () {
                return callback();
              });
              this.putPrivate(el, DEBOUNCE_BLUR, value);
              return;
            }
            default: {
              var timeout = parseInt(value);
              if (isNaN(timeout)) {
                return logError("invalid throttle/debounce value: " + value);
              }
              if (throttle && event.type === "keydown") {
                var prevKey = this.private(el, DEBOUNCE_PREV_KEY);
                this.putPrivate(el, DEBOUNCE_PREV_KEY, event.key);
                if (prevKey !== event.key) {
                  return callback();
                }
              }
              if (this.private(el, DEBOUNCE_TIMER)) {
                return;
              }
              var clearTimer_1 = function (e) {
                if (
                  throttle &&
                  e.type === PHX_CHANGE_EVENT &&
                  e.detail.triggeredBy.name === el.name
                ) {
                  return;
                }
                clearTimeout(_this.private(el, DEBOUNCE_TIMER));
                _this.deletePrivate(el, DEBOUNCE_TIMER);
              };
              var debounceCallback_1 = function () {
                if (el.form) {
                  el.form.removeEventListener(PHX_CHANGE_EVENT, clearTimer_1);
                  el.form.removeEventListener("submit", clearTimer_1);
                }
                el.removeEventListener(
                  "blur",
                  _this.private(el, DEBOUNCE_BLUR_TIMER)
                );
                _this.deletePrivate(el, DEBOUNCE_BLUR_TIMER);
                _this.deletePrivate(el, DEBOUNCE_TIMER);
                if (!throttle) {
                  callback();
                }
              };
              var blurCallback = function () {
                clearTimeout(_this.private(el, DEBOUNCE_TIMER));
                debounceCallback_1();
              };
              this.putPrivate(
                el,
                DEBOUNCE_TIMER,
                setTimeout(debounceCallback_1, timeout)
              );
              el.addEventListener("blur", blurCallback);
              this.putPrivate(el, DEBOUNCE_BLUR_TIMER, blurCallback);
              if (el.form) {
                el.form.addEventListener(PHX_CHANGE_EVENT, clearTimer_1);
                el.form.addEventListener("submit", clearTimer_1);
              }
              if (throttle) {
                callback();
              }
            }
          }
        },
        discardError: function (container, el, phxFeedbackFor) {
          var field = el.getAttribute && el.getAttribute(phxFeedbackFor);
          var input = field && container.querySelector("#" + field);
          if (!input) {
            return;
          }
          if (
            !(
              this.private(input, PHX_HAS_FOCUSED) ||
              this.private(input.form, PHX_HAS_SUBMITTED)
            )
          ) {
            el.classList.add(PHX_NO_FEEDBACK_CLASS);
          }
        },
        isPhxChild: function (node) {
          return node.getAttribute && node.getAttribute(PHX_PARENT_ID);
        },
        dispatchEvent: function (target, eventString, detail) {
          if (detail === void 0) {
            detail = {};
          }
          var event = new CustomEvent(eventString, {
            bubbles: true,
            cancelable: true,
            detail: detail,
          });
          target.dispatchEvent(event);
        },
        cloneNode: function (node, html) {
          if (typeof html === "undefined") {
            return node.cloneNode(true);
          } else {
            var cloned = node.cloneNode(false);
            cloned.innerHTML = html;
            return cloned;
          }
        },
        mergeAttrs: function (target, source, exclude) {
          if (exclude === void 0) {
            exclude = [];
          }
          var sourceAttrs = source.attributes;
          for (var i = sourceAttrs.length - 1; i >= 0; i--) {
            var name_1 = sourceAttrs[i].name;
            if (exclude.indexOf(name_1) < 0) {
              target.setAttribute(name_1, source.getAttribute(name_1));
            }
          }
          var targetAttrs = target.attributes;
          for (var i = targetAttrs.length - 1; i >= 0; i--) {
            var name_2 = targetAttrs[i].name;
            if (!source.hasAttribute(name_2)) {
              target.removeAttribute(name_2);
            }
          }
        },
        mergeFocusedInput: function (target, source) {
          // skip selects because FF will reset highlighted index for any setAttribute
          if (!(target instanceof HTMLSelectElement)) {
            DOM.mergeAttrs(target, source, ["value"]);
          }
          if (source.readOnly) {
            target.setAttribute("readonly", "true");
          } else {
            target.removeAttribute("readonly");
          }
        },
        restoreFocus: function (focused, selectionStart, selectionEnd) {
          if (!DOM.isTextualInput(focused)) {
            return;
          }
          var wasFocused = focused.matches(":focus");
          if (focused.readOnly) {
            focused.blur();
          }
          if (!wasFocused) {
            focused.focus();
          }
          if (
            (focused.setSelectionRange && focused.type === "text") ||
            focused.type === "textarea"
          ) {
            focused.setSelectionRange(selectionStart, selectionEnd);
          }
        },
        isFormInput: function (el) {
          return /^(?:input|select|textarea)$/i.test(el.tagName);
        },
        syncAttrsToProps: function (el) {
          if (
            el instanceof HTMLInputElement &&
            CHECKABLE_INPUTS.indexOf(el.type.toLocaleLowerCase()) >= 0
          ) {
            el.checked = el.getAttribute("checked") !== null;
          }
        },
        isTextualInput: function (el) {
          return FOCUSABLE_INPUTS.indexOf(el.type) >= 0;
        },
        isNowTriggerFormExternal: function (el, phxTriggerExternal) {
          return (
            el.getAttribute && el.getAttribute(phxTriggerExternal) !== null
          );
        },
        undoRefs: function (ref, container) {
          var _this = this;
          DOM.each(container, "[" + PHX_REF + "]", function (el) {
            return _this.syncPendingRef(ref, el, el);
          });
        },
        syncPendingRef: function (ref, fromEl, toEl) {
          var fromRefAttr = fromEl.getAttribute && fromEl.getAttribute(PHX_REF);
          if (fromRefAttr === null) {
            return true;
          }
          var fromRef = parseInt(fromRefAttr);
          if (ref !== null && ref >= fromRef) {
            [fromEl, toEl].forEach(function (el) {
              // remove refs
              el.removeAttribute(PHX_REF);
              // retore inputs
              if (el.getAttribute(PHX_READONLY) !== null) {
                el.readOnly = false;
                el.removeAttribute(PHX_READONLY);
              }
              if (el.getAttribute(PHX_DISABLED) !== null) {
                el.disabled = false;
                el.removeAttribute(PHX_DISABLED);
              }
              // remove classes
              PHX_EVENT_CLASSES.forEach(function (className) {
                return DOM.removeClass(el, className);
              });
              // restore disables
              var disableRestore = el.getAttribute(PHX_DISABLE_WITH_RESTORE);
              if (disableRestore !== null) {
                el.innerText = disableRestore;
                el.removeAttribute(PHX_DISABLE_WITH_RESTORE);
              }
            });
            return true;
          } else {
            PHX_EVENT_CLASSES.forEach(function (className) {
              fromEl.classList.contains(className) &&
                toEl.classList.add(className);
            });
            toEl.setAttribute(PHX_REF, fromEl.getAttribute(PHX_REF));
            return !(DOM.isFormInput(fromEl) || /submit/i.test(fromEl.type));
          }
        },
      };
      var dom_DOMPatch = /** @class */ (function () {
        function DOMPatch(view, container, id, html, targetCID, ref) {
          this.view = view;
          this.liveSocket = view.liveSocket;
          this.container = container;
          this.id = id;
          this.rootID = view.root.id;
          this.html = html;
          this.targetCID = targetCID;
          this.ref = ref;
          this.cidPatch = typeof this.targetCID === "number";
          this.callbacks = {
            beforeadded: [],
            beforeupdated: [],
            beforediscarded: [],
            beforephxChildAdded: [],
            afteradded: [],
            afterupdated: [],
            afterdiscarded: [],
            afterphxChildAdded: [],
          };
        }
        DOMPatch.prototype.before = function (kind, callback) {
          this.callbacks["before" + kind].push(callback);
        };
        DOMPatch.prototype.after = function (kind, callback) {
          this.callbacks["after" + kind].push(callback);
        };
        DOMPatch.prototype.trackBefore = function (kind) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
          }
          this.callbacks["before" + kind].forEach(function (callback) {
            return callback.apply(void 0, __spread(args));
          });
        };
        DOMPatch.prototype.trackAfter = function (kind) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
          }
          this.callbacks["after" + kind].forEach(function (callback) {
            return callback.apply(void 0, __spread(args));
          });
        };
        DOMPatch.prototype.markPrunableContentForRemoval = function () {
          DOM.each(
            this.container,
            "[phx-update=append] > *, [phx-update=prepend] > *",
            function (el) {
              el.setAttribute(PHX_REMOVE, "");
            }
          );
        };
        DOMPatch.prototype.perform = function () {
          var _this = this;
          var _a = this,
            view = _a.view,
            liveSocket = _a.liveSocket,
            container = _a.container,
            html = _a.html;
          var targetContainer = this.isCIDPatch()
            ? this.targetCIDContainer()
            : container;
          if (this.isCIDPatch() && !targetContainer) {
            return;
          }
          var focused = liveSocket.getActiveElement();
          var selectionStart = focused.selectionStart,
            selectionEnd = focused.selectionEnd;
          var phxUpdate = liveSocket.binding(PHX_UPDATE);
          var phxFeedbackFor = liveSocket.binding(PHX_FEEDBACK_FOR);
          var phxTriggerExternal = liveSocket.binding(PHX_TRIGGER_ACTION);
          var added = [];
          var updates = [];
          var appendPrependUpdates = [];
          var diffHTML = liveSocket.time(
            "premorph container prep",
            function () {
              return _this.buildDiffHTML(
                container,
                html,
                phxUpdate,
                targetContainer
              );
            }
          );
          this.trackBefore("added", container);
          this.trackBefore("updated", container, container);
          liveSocket.time("morphdom", function () {
            morphdom_default()(targetContainer, diffHTML, {
              childrenOnly:
                targetContainer.getAttribute(PHX_COMPONENT) === null,
              onBeforeNodeAdded: function (el) {
                //input handling
                DOM.discardError(targetContainer, el, phxFeedbackFor);
                _this.trackBefore("added", el);
                return el;
              },
              onNodeAdded: function (el) {
                if (DOM.isNowTriggerFormExternal(el, phxTriggerExternal)) {
                  el.submit();
                }
                // nested view handling
                if (DOM.isPhxChild(el) && view.ownsElement(el)) {
                  _this.trackAfter("phxChildAdded", el);
                }
                added.push(el);
                return el;
              },
              onNodeDiscarded: function (el) {
                _this.trackAfter("discarded", el);
              },
              onBeforeNodeDiscarded: function (el) {
                if (el.getAttribute && el.getAttribute(PHX_REMOVE) !== null) {
                  return true;
                }
                if (
                  DOM.isPhxUpdate(el.parentNode, phxUpdate, [
                    "append",
                    "prepend",
                  ])
                ) {
                  return false;
                }
                if (_this.skipCIDSibling(el)) {
                  return false;
                }
                _this.trackBefore("discarded", el);
                // nested view handling
                if (DOM.isPhxChild(el)) {
                  liveSocket.destroyViewByEl(el);
                  return true;
                }
              },
              onElUpdated: function (el) {
                if (DOM.isNowTriggerFormExternal(el, phxTriggerExternal)) {
                  el.submit();
                }
                updates.push(el);
              },
              onBeforeElUpdated: function (fromEl, toEl) {
                if (_this.skipCIDSibling(toEl)) {
                  return false;
                }
                if (fromEl.getAttribute(phxUpdate) === "ignore") {
                  _this.trackBefore("updated", fromEl, toEl);
                  DOM.mergeAttrs(fromEl, toEl);
                  updates.push(fromEl);
                  return false;
                }
                if (
                  fromEl.type === "number" &&
                  fromEl.validity &&
                  fromEl.validity.badInput
                ) {
                  return false;
                }
                if (!DOM.syncPendingRef(_this.ref, fromEl, toEl)) {
                  return false;
                }
                // nested view handling
                if (DOM.isPhxChild(toEl)) {
                  var prevStatic = fromEl.getAttribute(PHX_STATIC);
                  DOM.mergeAttrs(fromEl, toEl);
                  fromEl.setAttribute(PHX_STATIC, prevStatic);
                  fromEl.setAttribute(PHX_ROOT_ID, _this.rootID);
                  return false;
                }
                // input handling
                DOM.copyPrivates(toEl, fromEl);
                DOM.discardError(targetContainer, toEl, phxFeedbackFor);
                var isFocusedFormEl =
                  focused &&
                  fromEl.isSameNode(focused) &&
                  DOM.isFormInput(fromEl);
                if (
                  isFocusedFormEl &&
                  !_this.forceFocusedSelectUpdate(fromEl, toEl)
                ) {
                  _this.trackBefore("updated", fromEl, toEl);
                  DOM.mergeFocusedInput(fromEl, toEl);
                  DOM.syncAttrsToProps(fromEl);
                  updates.push(fromEl);
                  return false;
                } else {
                  // we optimize append/prepend operations in two ways:
                  //   1) By tracking the previously appended ids. If the ids don't
                  //     change b/w patches, we know that we are going to re-arrange
                  //     the same appendPrependUpdates so we can skip the post-morph
                  //     append/prepend ops.
                  //   2) for appends, we can skip post-morph re-arranging if the
                  //     new content contains only new ids, because it will simply
                  //     be appended to the container
                  if (DOM.isPhxUpdate(toEl, phxUpdate, ["append", "prepend"])) {
                    var isAppend = toEl.getAttribute(phxUpdate) === "append";
                    var idsBefore_1 = Array.from(fromEl.children).map(function (
                      child
                    ) {
                      return child.id;
                    });
                    var newIds = Array.from(toEl.children).map(function (
                      child
                    ) {
                      return child.id;
                    });
                    var isOnlyNewIds =
                      isAppend &&
                      !newIds.find(function (id) {
                        return idsBefore_1.indexOf(id) >= 0;
                      });
                    if (!isOnlyNewIds) {
                      appendPrependUpdates.push([toEl.id, idsBefore_1]);
                    }
                  }
                  DOM.syncAttrsToProps(toEl);
                  _this.trackBefore("updated", fromEl, toEl);
                  return true;
                }
              },
            });
          });
          if (liveSocket.isDebugEnabled()) {
            detectDuplicateIds();
          }
          if (appendPrependUpdates.length > 0) {
            liveSocket.time(
              "post-morph append/prepend restoration",
              function () {
                appendPrependUpdates.forEach(function (_a) {
                  var _b = dom_read(_a, 2),
                    containerID = _b[0],
                    idsBefore = _b[1];
                  var _c;
                  var el = DOM.byId(containerID);
                  var isAppend =
                    ((_c = el) === null || _c === void 0
                      ? void 0
                      : _c.getAttribute(phxUpdate)) === "append";
                  if (isAppend) {
                    idsBefore.reverse().forEach(function (id) {
                      maybe(document.getElementById(id), function (child) {
                        return el.insertBefore(child, el.firstChild);
                      });
                    });
                  } else {
                    idsBefore.forEach(function (id) {
                      maybe(document.getElementById(id), function (child) {
                        return el.appendChild(child);
                      });
                    });
                  }
                });
              }
            );
          }
          liveSocket.silenceEvents(function () {
            return DOM.restoreFocus(focused, selectionStart, selectionEnd);
          });
          DOM.dispatchEvent(document, "phx:update");
          added.forEach(function (el) {
            return _this.trackAfter("added", el);
          });
          updates.forEach(function (el) {
            return _this.trackAfter("updated", el);
          });
          return true;
        };
        DOMPatch.prototype.forceFocusedSelectUpdate = function (fromEl, toEl) {
          return fromEl.multiple === true || fromEl.innerHTML != toEl.innerHTML;
        };
        DOMPatch.prototype.isCIDPatch = function () {
          return this.cidPatch;
        };
        DOMPatch.prototype.skipCIDSibling = function (el) {
          return (
            el.nodeType === Node.ELEMENT_NODE &&
            el.getAttribute(PHX_SKIP) !== null
          );
        };
        DOMPatch.prototype.targetCIDContainer = function () {
          if (!this.isCIDPatch()) {
            return;
          }
          var _a = dom_read(
              DOM.findComponentNodeList(this.container, this.targetCID)
            ),
            first = _a[0],
            rest = _a.slice(1);
          if (rest.length === 0) {
            return first;
          } else {
            return first && first.parentNode;
          }
        };
        // builds HTML for morphdom patch
        // - for full patches of LiveView or a component with a single
        //   root node, simply returns the HTML
        // - for patches of a component with multiple root nodes, the
        //   parent node becomes the target container and non-component
        //   siblings are marked as skip.
        DOMPatch.prototype.buildDiffHTML = function (
          container,
          html,
          phxUpdate,
          targetContainer
        ) {
          var _this = this;
          var isCIDPatch = this.isCIDPatch();
          var isCIDWithSingleRoot =
            isCIDPatch &&
            targetContainer.getAttribute(PHX_COMPONENT) ===
              this.targetCID.toString();
          if (!isCIDPatch || isCIDWithSingleRoot) {
            return html;
          } else {
            // component patch with multiple CID roots
            var diffContainer_1 = null;
            var template = document.createElement("template");
            diffContainer_1 = DOM.cloneNode(targetContainer);
            var _a = dom_read(
                DOM.findComponentNodeList(diffContainer_1, this.targetCID)
              ),
              firstComponent_1 = _a[0],
              rest = _a.slice(1);
            template.innerHTML = html;
            rest.forEach(function (el) {
              return el.remove();
            });
            Array.from(diffContainer_1.childNodes).forEach(function (child) {
              if (
                child.nodeType === Node.ELEMENT_NODE &&
                child.getAttribute(PHX_COMPONENT) !== _this.targetCID.toString()
              ) {
                child.setAttribute(PHX_SKIP, "");
                child.innerHTML = "";
              }
            });
            Array.from(template.content.childNodes).forEach(function (el) {
              return diffContainer_1.insertBefore(el, firstComponent_1);
            });
            firstComponent_1.remove();
            return diffContainer_1.outerHTML;
          }
        };
        return DOMPatch;
      })();

      // CONCATENATED MODULE: ./src/rendered.ts

      var rendered_Rendered = /** @class */ (function () {
        function Rendered(viewId, rendered) {
          this.viewId = viewId;
          this.replaceRendered(rendered);
        }
        Rendered.prototype.parentViewId = function () {
          return this.viewId;
        };
        Rendered.prototype.toString = function (onlyCids) {
          return this.recursiveToString(
            this.rendered,
            this.rendered[COMPONENTS],
            onlyCids
          );
        };
        Rendered.prototype.recursiveToString = function (
          rendered,
          components,
          onlyCids
        ) {
          if (components === void 0) {
            components = rendered[COMPONENTS] || {};
          }
          onlyCids = onlyCids ? new Set(onlyCids) : null;
          var output = {
            buffer: "",
            components: components,
            onlyCids: onlyCids,
          };
          this.toOutputBuffer(rendered, output);
          return output.buffer;
        };
        Rendered.prototype.componentCIDs = function (diff) {
          return Object.keys(diff[COMPONENTS] || {}).map(function (i) {
            return parseInt(i);
          });
        };
        Rendered.prototype.isComponentOnlyDiff = function (diff) {
          if (!diff[COMPONENTS]) {
            return false;
          }
          return (
            Object.keys(diff).filter(function (k) {
              return k !== "title" && k !== COMPONENTS;
            }).length === 0
          );
        };
        Rendered.prototype.mergeDiff = function (diff) {
          if (!diff[COMPONENTS] && this.isNewFingerprint(diff)) {
            this.replaceRendered(diff);
          } else {
            this.recursiveMerge(this.rendered, diff);
          }
        };
        Rendered.prototype.recursiveMerge = function (target, source) {
          var _this = this;
          Object.keys(source).forEach(function (key) {
            var val = source[key];
            var targetVal = target[key];
            if (isObject(val) && isObject(targetVal)) {
              if (targetVal[DYNAMICS] && !val[DYNAMICS]) {
                delete targetVal[DYNAMICS];
              }
              _this.recursiveMerge(targetVal, val);
            } else {
              target[key] = val;
            }
          });
        };
        Rendered.prototype.componentToString = function (cid) {
          return this.recursiveCIDToString(this.rendered[COMPONENTS], cid);
        };
        Rendered.prototype.pruneCIDs = function (cids) {
          var _this = this;
          cids.forEach(function (cid) {
            return delete _this.rendered[COMPONENTS][cid];
          });
        };
        // private
        Rendered.prototype.get = function () {
          return this.rendered;
        };
        Rendered.prototype.replaceRendered = function (rendered) {
          this.rendered = rendered;
          this.rendered[COMPONENTS] = this.rendered[COMPONENTS] || {};
        };
        Rendered.prototype.isNewFingerprint = function (diff) {
          if (diff === void 0) {
            diff = {};
          }
          return !!diff[STATIC];
        };
        Rendered.prototype.toOutputBuffer = function (rendered, output) {
          if (rendered[DYNAMICS]) {
            return this.comprehensionToBuffer(rendered, output);
          }
          var _a = STATIC,
            statics = rendered[_a];
          output.buffer += statics[0];
          for (var i = 1; i < statics.length; i++) {
            this.dynamicToBuffer(rendered[i - 1], output);
            output.buffer += statics[i];
          }
        };
        Rendered.prototype.comprehensionToBuffer = function (rendered, output) {
          var _a = DYNAMICS,
            dynamics = rendered[_a],
            _b = STATIC,
            statics = rendered[_b];
          for (var d = 0; d < dynamics.length; d++) {
            var dynamic = dynamics[d];
            output.buffer += statics[0];
            for (var i = 1; i < statics.length; i++) {
              this.dynamicToBuffer(dynamic[i - 1], output);
              output.buffer += statics[i];
            }
          }
        };
        Rendered.prototype.dynamicToBuffer = function (rendered, output) {
          if (typeof rendered === "number") {
            output.buffer += this.recursiveCIDToString(
              output.components,
              rendered,
              output.onlyCids
            );
          } else if (isObject(rendered)) {
            this.toOutputBuffer(rendered, output);
          } else {
            output.buffer += rendered;
          }
        };
        Rendered.prototype.recursiveCIDToString = function (
          components,
          cid,
          onlyCids
        ) {
          var _this = this;
          var component =
            components[cid] ||
            logError("no component for CID " + cid, components);
          var template = document.createElement("template");
          template.innerHTML = this.recursiveToString(
            component,
            components,
            onlyCids
          );
          var container = template.content;
          var skip = onlyCids && !onlyCids.has(cid);
          Array.from(container.children).forEach(function (child, i) {
            if (child.nodeType === Node.ELEMENT_NODE) {
              child.setAttribute(PHX_COMPONENT, cid);
              if (!child.id) {
                child.id = _this.parentViewId() + "-" + cid + "-" + i;
              }
              if (skip) {
                child.setAttribute(PHX_SKIP, "");
                child.innerHTML = "";
              }
            } else {
              if (child.nodeValue.trim() !== "") {
                logError(
                  "only HTML element tags are allowed at the root of components.\n\n" +
                    ('got: "' + child.nodeValue.trim() + '"\n\n') +
                    "within:\n",
                  template.innerHTML.trim()
                );
                var span = document.createElement("span");
                span.innerText = child.nodeValue;
                span.setAttribute(PHX_COMPONENT, cid);
                child.replaceWith(span);
              } else {
                child.remove();
              }
            }
          });
          return template.innerHTML;
        };
        return Rendered;
      })();

      // CONCATENATED MODULE: ./src/view.ts
      var view_read =
        (undefined && undefined.__read) ||
        function (o, n) {
          var m = typeof Symbol === "function" && o[Symbol.iterator];
          if (!m) return o;
          var i = m.call(o),
            r,
            ar = [],
            e;
          try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
              ar.push(r.value);
          } catch (error) {
            e = { error: error };
          } finally {
            try {
              if (r && !r.done && (m = i["return"])) m.call(i);
            } finally {
              if (e) throw e.error;
            }
          }
          return ar;
        };
      var view_spread =
        (undefined && undefined.__spread) ||
        function () {
          for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(view_read(arguments[i]));
          return ar;
        };

      var view_View = /** @class */ (function () {
        function View(el, liveSocket, parentView, href, flash) {
          var _this = this;
          this.liveSocket = liveSocket;
          this.flash = flash;
          this.parent = parentView;
          this.root = parentView ? parentView.root : this;
          this.el = el;
          this.id = this.el.id;
          this.view = this.el.getAttribute(PHX_VIEW);
          this.ref = 0;
          this.childJoins = 0;
          this.loaderTimer = null;
          this.pendingDiffs = [];
          this.href = href;
          this.joinCount = this.parent ? this.parent.joinCount - 1 : 0;
          this.joinPending = true;
          this.destroyed = false;
          this.joinCallback = function () {};
          this.stopCallback = function () {};
          this.pendingJoinOps = this.parent ? null : [];
          this.viewHooks = {};
          this.children = this.parent ? null : {};
          this.root.children[this.id] = {};
          this.channel = this.liveSocket.channel("lv:" + this.id, function () {
            return {
              url: _this.href,
              params: _this.liveSocket.params(_this.view),
              session: _this.getSession(),
              static: _this.getStatic(),
              flash: _this.flash,
              joins: _this.joinCount,
            };
          });
          this.showLoader(this.liveSocket.loaderTimeout);
          this.bindChannel();
        }
        View.prototype.isMain = function () {
          return this.liveSocket.main === this;
        };
        View.prototype.name = function () {
          return this.view;
        };
        View.prototype.isConnected = function () {
          return this.channel.canPush();
        };
        View.prototype.getSession = function () {
          return this.el.getAttribute(PHX_SESSION);
        };
        View.prototype.getStatic = function () {
          var val = this.el.getAttribute(PHX_STATIC);
          return val === "" ? null : val;
        };
        View.prototype.destroy = function (callback) {
          var _this = this;
          if (callback === void 0) {
            callback = function () {};
          }
          this.destroyAllChildren();
          this.destroyed = true;
          delete this.root.children[this.id];
          if (this.parent) {
            delete this.root.children[this.parent.id][this.id];
          }
          clearTimeout(this.loaderTimer);
          var onFinished = function () {
            callback();
            for (var id in _this.viewHooks) {
              _this.destroyHook(_this.viewHooks[id]);
            }
          };
          this.log("destroyed", function () {
            return ["the child has been removed from the parent"];
          });
          this.channel
            .leave()
            .receive("ok", onFinished)
            .receive("error", onFinished)
            .receive("timeout", onFinished);
        };
        View.prototype.setContainerClasses = function () {
          var _a;
          var classes = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i] = arguments[_i];
          }
          this.el.classList.remove(
            PHX_CONNECTED_CLASS,
            PHX_DISCONNECTED_CLASS,
            PHX_ERROR_CLASS
          );
          (_a = this.el.classList).add.apply(_a, view_spread(classes));
        };
        View.prototype.isLoading = function () {
          return this.el.classList.contains(PHX_DISCONNECTED_CLASS);
        };
        View.prototype.showLoader = function (timeout) {
          var _this = this;
          clearTimeout(this.loaderTimer);
          if (timeout) {
            this.loaderTimer = window.setTimeout(function () {
              return _this.showLoader();
            }, timeout);
          } else {
            for (var id in this.viewHooks) {
              this.viewHooks[id].__trigger__("disconnected");
            }
            this.setContainerClasses(PHX_DISCONNECTED_CLASS);
          }
        };
        View.prototype.hideLoader = function () {
          clearTimeout(this.loaderTimer);
          this.setContainerClasses(PHX_CONNECTED_CLASS);
        };
        View.prototype.triggerReconnected = function () {
          for (var id in this.viewHooks) {
            this.viewHooks[id].__trigger__("reconnected");
          }
        };
        View.prototype.log = function (kind, msgCallback) {
          this.liveSocket.log(this, kind, msgCallback);
        };
        View.prototype.onJoin = function (resp) {
          var _this = this;
          var rendered = resp.rendered;
          this.joinCount++;
          this.childJoins = 0;
          this.joinPending = true;
          this.flash = null;
          this.log("join", function () {
            return ["", rendered];
          });
          if (rendered.title) {
            DOM.putTitle(rendered.title);
          }
          Browser.dropLocal(this.name(), CONSECUTIVE_RELOADS);
          this.rendered = new rendered_Rendered(this.id, rendered);
          var html = this.renderContainer(null, "join");
          this.dropPendingRefs();
          var forms = this.formsForRecovery(html);
          if (this.joinCount > 1 && forms.length > 0) {
            forms.forEach(function (form, i) {
              _this.pushFormRecovery(form, function (resp) {
                if (i === forms.length - 1) {
                  _this.onJoinComplete(resp, html);
                }
              });
            });
          } else {
            this.onJoinComplete(resp, html);
          }
        };
        View.prototype.dropPendingRefs = function () {
          DOM.each(this.el, "[" + PHX_REF + "]", function (el) {
            return el.removeAttribute(PHX_REF);
          });
        };
        View.prototype.onJoinComplete = function (_a, html) {
          var _this = this;
          var live_patch = _a.live_patch;
          if (
            this.joinCount > 1 ||
            (this.parent && !this.parent.isJoinPending())
          ) {
            return this.applyJoinPatch(live_patch, html);
          }
          var newChildren = DOM.findPhxChildrenInFragment(html, this.id).filter(
            function (c) {
              return _this.joinChild(c);
            }
          );
          if (newChildren.length === 0) {
            if (this.parent) {
              this.root.pendingJoinOps.push([
                this,
                function () {
                  return _this.applyJoinPatch(live_patch, html);
                },
              ]);
              this.parent.ackJoin(this);
            } else {
              this.onAllChildJoinsComplete();
              this.applyJoinPatch(live_patch, html);
            }
          } else {
            this.root.pendingJoinOps.push([
              this,
              function () {
                return _this.applyJoinPatch(live_patch, html);
              },
            ]);
          }
        };
        View.prototype.attachTrueDocEl = function () {
          this.el = DOM.byId(this.id);
          this.el.setAttribute(PHX_ROOT_ID, this.root.id);
        };
        View.prototype.applyJoinPatch = function (live_patch, html) {
          var _this = this;
          this.attachTrueDocEl();
          var patch = new dom_DOMPatch(this, this.el, this.id, html, null);
          patch.markPrunableContentForRemoval();
          this.joinPending = false;
          this.performPatch(patch);
          this.joinNewChildren();
          DOM.each(this.el, "[" + this.binding(PHX_HOOK) + "]", function (
            hookEl
          ) {
            var hook = _this.addHook(hookEl);
            if (hook) {
              hook.__trigger__("mounted");
            }
          });
          this.applyPendingUpdates();
          if (live_patch) {
            var kind = live_patch.kind,
              to = live_patch.to;
            this.liveSocket.historyPatch(to, kind);
          }
          this.hideLoader();
          if (this.joinCount > 1) {
            this.triggerReconnected();
          }
          this.stopCallback();
        };
        View.prototype.performPatch = function (patch) {
          var _this = this;
          var destroyedCIDs = [];
          var phxChildrenAdded = false;
          var updatedHookIds = new Set();
          patch.after("added", function (el) {
            var newHook = _this.addHook(el);
            if (newHook) {
              newHook.__trigger__("mounted");
            }
          });
          patch.after("phxChildAdded", function () {
            return (phxChildrenAdded = true);
          });
          patch.before("updated", function (fromEl, toEl) {
            var hook = _this.getHook(fromEl);
            var isIgnored =
              hook &&
              fromEl.getAttribute(_this.binding(PHX_UPDATE)) === "ignore";
            if (
              hook &&
              !fromEl.isEqualNode(toEl) &&
              !(isIgnored && isEqualObj(fromEl.dataset, toEl.dataset))
            ) {
              updatedHookIds.add(fromEl.id);
              hook.__trigger__("beforeUpdate");
            }
          });
          patch.after("updated", function (el) {
            var hook = _this.getHook(el);
            if (hook && updatedHookIds.has(el.id)) {
              hook.__trigger__("updated");
            }
          });
          patch.before("discarded", function (el) {
            var hook = _this.getHook(el);
            if (hook) {
              hook.__trigger__("beforeDestroy");
            }
          });
          patch.after("discarded", function (el) {
            var cid = _this.componentID(el);
            if (typeof cid === "number" && destroyedCIDs.indexOf(cid) === -1) {
              destroyedCIDs.push(cid);
            }
            var hook = _this.getHook(el);
            hook && _this.destroyHook(hook);
          });
          patch.perform();
          this.maybePushComponentsDestroyed(destroyedCIDs);
          return phxChildrenAdded;
        };
        View.prototype.joinNewChildren = function () {
          var _this = this;
          DOM.findPhxChildren(this.el, this.id).forEach(function (el) {
            return _this.joinChild(el);
          });
        };
        View.prototype.getChildById = function (id) {
          return this.root.children[this.id][id];
        };
        View.prototype.getDescendentByEl = function (el) {
          if (el.id === this.id) {
            return this;
          } else {
            return this.children[el.getAttribute(PHX_PARENT_ID)][el.id];
          }
        };
        View.prototype.destroyDescendent = function (id) {
          var _this = this;
          Object.keys(this.root.children).forEach(function (parentId) {
            Object.keys(_this.root.children[parentId]).forEach(function (
              childId
            ) {
              if (childId === id) {
                return _this.root.children[parentId][childId].destroy();
              }
            });
          });
        };
        View.prototype.joinChild = function (el) {
          var child = this.getChildById(el.id);
          if (!child) {
            var view = new View(el, this.liveSocket, this);
            this.root.children[this.id][view.id] = view;
            view.join();
            this.childJoins++;
            return true;
          }
        };
        View.prototype.isJoinPending = function () {
          return this.joinPending;
        };
        View.prototype.ackJoin = function (_child) {
          this.childJoins--;
          if (this.childJoins === 0) {
            if (this.parent) {
              this.parent.ackJoin(this);
            } else {
              this.onAllChildJoinsComplete();
            }
          }
        };
        View.prototype.onAllChildJoinsComplete = function () {
          this.joinCallback();
          this.pendingJoinOps.forEach(function (_a) {
            var _b = view_read(_a, 2),
              view = _b[0],
              op = _b[1];
            if (!view.isDestroyed()) {
              op();
            }
          });
          this.pendingJoinOps = [];
        };
        View.prototype.update = function (diff, cidAck, ref) {
          var _this = this;
          if (isEmpty(diff) && ref === null) {
            return;
          }
          if (diff.title) {
            DOM.putTitle(diff.title);
          }
          if (this.isJoinPending() || this.liveSocket.hasPendingLink()) {
            return this.pendingDiffs.push({
              diff: diff,
              cid: cidAck,
              ref: ref,
            });
          }
          this.log("update", function () {
            return ["", diff];
          });
          this.rendered.mergeDiff(diff);
          var phxChildrenAdded = false;
          // when we don't have an acknowledgement CID and the diff only contains
          // component diffs, then walk components and patch only the parent component
          // containers found in the diff. Otherwise, patch entire LV container.
          if (typeof cidAck === "number") {
            this.liveSocket.time("component ack patch complete", function () {
              if (_this.componentPatch(diff[COMPONENTS][cidAck], cidAck, ref)) {
                phxChildrenAdded = true;
              }
            });
          } else if (this.rendered.isComponentOnlyDiff(diff)) {
            this.liveSocket.time("component patch complete", function () {
              var parentCids = DOM.findParentCIDs(
                _this.el,
                _this.rendered.componentCIDs(diff)
              );
              parentCids.forEach(function (parentCID) {
                if (
                  _this.componentPatch(
                    diff[COMPONENTS][parentCID],
                    parentCID,
                    ref
                  )
                ) {
                  phxChildrenAdded = true;
                }
              });
            });
          } else if (!isEmpty(diff)) {
            this.liveSocket.time("full patch complete", function () {
              var html = _this.renderContainer(diff, "update");
              var patch = new dom_DOMPatch(
                _this,
                _this.el,
                _this.id,
                html,
                null,
                ref
              );
              phxChildrenAdded = _this.performPatch(patch);
            });
          }
          DOM.undoRefs(ref, this.el);
          if (phxChildrenAdded) {
            this.joinNewChildren();
          }
        };
        View.prototype.renderContainer = function (diff, kind) {
          var _this = this;
          return this.liveSocket.time(
            "toString diff (" + kind + ")",
            function () {
              var tag = _this.el.tagName;
              var cids = diff ? _this.rendered.componentCIDs(diff) : null;
              var html = _this.rendered.toString(cids);
              return "<" + tag + ">" + html + "</" + tag + ">";
            }
          );
        };
        View.prototype.componentPatch = function (diff, cid, ref) {
          if (isEmpty(diff)) return false;
          var html = this.rendered.componentToString(cid);
          var patch = new dom_DOMPatch(this, this.el, this.id, html, cid, ref);
          return this.performPatch(patch);
        };
        View.prototype.getHook = function (el) {
          return this.viewHooks[ViewHook.elementID(el)];
        };
        View.prototype.addHook = function (el) {
          if (ViewHook.elementID(el) || !el.getAttribute) {
            return;
          }
          var hookName = el.getAttribute(this.binding(PHX_HOOK));
          if (hookName && !this.ownsElement(el)) {
            return;
          }
          var callbacks = this.liveSocket.getHookCallbacks(hookName);
          if (callbacks) {
            var hook = new ViewHook(this, el, callbacks);
            this.viewHooks[ViewHook.elementID(hook.el)] = hook;
            return hook;
          } else if (hookName !== null) {
            logError('unknown hook found for "' + hookName + '"', el);
          }
        };
        View.prototype.destroyHook = function (hook) {
          hook.__trigger__("destroyed");
          delete this.viewHooks[ViewHook.elementID(hook.el)];
        };
        View.prototype.applyPendingUpdates = function () {
          var _this = this;
          this.pendingDiffs.forEach(function (_a) {
            var diff = _a.diff,
              cid = _a.cid,
              ref = _a.ref;
            return _this.update(diff, cid, ref);
          });
          this.pendingDiffs = [];
        };
        View.prototype.onChannel = function (event, cb) {
          var _this = this;
          this.liveSocket.onChannel(this.channel, event, function (resp) {
            if (_this.isJoinPending()) {
              _this.root.pendingJoinOps.push([
                _this,
                function () {
                  return cb(resp);
                },
              ]);
            } else {
              cb(resp);
            }
          });
        };
        View.prototype.bindChannel = function () {
          var _this = this;
          this.onChannel("diff", function (diff) {
            return _this.update(diff);
          });
          this.onChannel("redirect", function (_a) {
            var to = _a.to,
              flash = _a.flash;
            return _this.onRedirect({ to: to, flash: flash });
          });
          this.onChannel("live_patch", function (redir) {
            return _this.onLivePatch(redir);
          });
          this.onChannel("live_redirect", function (redir) {
            return _this.onLiveRedirect(redir);
          });
          this.onChannel("session", function (_a) {
            var token = _a.token;
            return _this.el.setAttribute(PHX_SESSION, token);
          });
          this.channel.onError(function (reason) {
            return _this.onError(reason);
          });
          this.channel.onClose(function () {
            return _this.onError({ reason: "closed" });
          });
        };
        View.prototype.destroyAllChildren = function () {
          var _this = this;
          Object.keys(this.root.children[this.id]).forEach(function (id) {
            _this.getChildById(id).destroy();
          });
        };
        View.prototype.onLiveRedirect = function (redir) {
          var to = redir.to,
            kind = redir.kind,
            flash = redir.flash;
          var url = this.expandURL(to);
          this.liveSocket.historyRedirect(url, kind, flash);
        };
        View.prototype.onLivePatch = function (redir) {
          var to = redir.to,
            kind = redir.kind;
          this.href = this.expandURL(to);
          this.liveSocket.historyPatch(to, kind);
        };
        View.prototype.expandURL = function (to) {
          return to.startsWith("/")
            ? window.location.protocol + "//" + window.location.host + to
            : to;
        };
        View.prototype.onRedirect = function (_a) {
          var to = _a.to,
            flash = _a.flash;
          this.liveSocket.redirect(to, flash);
        };
        View.prototype.isDestroyed = function () {
          return this.destroyed;
        };
        View.prototype.join = function (callback) {
          var _this = this;
          if (!this.parent) {
            this.stopCallback = this.liveSocket.withPageLoading({
              to: this.href,
              kind: "initial",
            });
          }
          this.joinCallback = function () {
            return callback && callback(_this, _this.joinCount);
          };
          this.liveSocket.wrapPush(function () {
            return _this.channel
              .join()
              .receive("ok", function (data) {
                return _this.onJoin(data);
              })
              .receive("error", function (resp) {
                return _this.onJoinError(resp);
              })
              .receive("timeout", function () {
                return _this.onJoinError({ reason: "timeout" });
              });
          });
        };
        View.prototype.onJoinError = function (resp) {
          if (resp.redirect || resp.live_redirect) {
            this.channel.leave();
          }
          if (resp.redirect) {
            return this.onRedirect(resp.redirect);
          }
          if (resp.live_redirect) {
            return this.onLiveRedirect(resp.live_redirect);
          }
          this.log("error", function () {
            return ["unable to join", resp];
          });
          return this.liveSocket.reloadWithJitter(this);
        };
        View.prototype.onError = function (reason) {
          if (this.isJoinPending()) {
            return this.liveSocket.reloadWithJitter(this);
          }
          this.destroyAllChildren();
          this.log("error", function () {
            return ["view crashed", reason];
          });
          this.liveSocket.onViewError(this);
          document.activeElement.blur();
          if (this.liveSocket.isUnloaded()) {
            this.showLoader(BEFORE_UNLOAD_LOADER_TIMEOUT);
          } else {
            this.displayError();
          }
        };
        View.prototype.displayError = function () {
          if (this.isMain()) {
            DOM.dispatchEvent(window, "phx:page-loading-start", {
              to: this.href,
              kind: "error",
            });
          }
          this.showLoader();
          this.setContainerClasses(PHX_DISCONNECTED_CLASS, PHX_ERROR_CLASS);
        };
        View.prototype.pushWithReply = function (
          refGenerator,
          event,
          payload,
          onReply
        ) {
          var _this = this;
          if (onReply === void 0) {
            onReply = function (_resp) {};
          }
          var _a = view_read(refGenerator ? refGenerator() : [null, []], 2),
            ref = _a[0],
            _b = view_read(_a[1], 1),
            el = _b[0];
          var onLoadingDone = function () {};
          if (el && el.getAttribute(this.binding(PHX_PAGE_LOADING)) !== null) {
            onLoadingDone = this.liveSocket.withPageLoading({
              kind: "element",
              target: el,
            });
          }
          if (typeof payload.cid !== "number") {
            delete payload.cid;
          }
          return this.liveSocket.wrapPush(function () {
            return _this.channel
              .push(event, payload, PUSH_TIMEOUT)
              .receive("ok", function (resp) {
                if (resp.diff || ref !== null) {
                  _this.update(resp.diff || {}, payload.cid, ref);
                }
                if (resp.redirect) {
                  _this.onRedirect(resp.redirect);
                }
                if (resp.live_patch) {
                  _this.onLivePatch(resp.live_patch);
                }
                if (resp.live_redirect) {
                  _this.onLiveRedirect(resp.live_redirect);
                }
                onLoadingDone();
                onReply(resp);
              });
          });
        };
        View.prototype.putRef = function (elements, event) {
          var newRef = this.ref++;
          var disableWith = this.binding(PHX_DISABLE_WITH);
          elements.forEach(function (el) {
            el.classList.add("phx-" + event + "-loading");
            el.setAttribute(PHX_REF, String(newRef));
            var disableText = el.getAttribute(disableWith);
            if (disableText !== null) {
              if (!el.getAttribute(PHX_DISABLE_WITH_RESTORE)) {
                el.setAttribute(PHX_DISABLE_WITH_RESTORE, el.innerText);
              }
              el.innerText = disableText;
            }
          });
          return [newRef, elements];
        };
        View.prototype.componentID = function (el) {
          var cid = el.getAttribute && el.getAttribute(PHX_COMPONENT);
          return cid ? parseInt(cid) : null;
        };
        View.prototype.targetComponentID = function (target, targetCtx) {
          if (target.getAttribute(this.binding("target"))) {
            return this.closestComponentID(targetCtx);
          } else {
            return null;
          }
        };
        View.prototype.closestComponentID = function (targetCtx) {
          var _this = this;
          if (targetCtx) {
            return maybe(
              targetCtx.closest("[" + PHX_COMPONENT + "]"),
              function (el) {
                return _this.ownsElement(el) && _this.componentID(el);
              }
            );
          } else {
            return null;
          }
        };
        View.prototype.pushHookEvent = function (targetCtx, event, payload) {
          this.pushWithReply(null, "event", {
            type: "hook",
            event: event,
            value: payload,
            cid: this.closestComponentID(targetCtx),
          });
        };
        View.prototype.extractMeta = function (el, meta) {
          var prefix = this.binding("value-");
          for (var i = 0; i < el.attributes.length; i++) {
            var name_1 = el.attributes[i].name;
            if (name_1.startsWith(prefix)) {
              meta[name_1.replace(prefix, "")] = el.getAttribute(name_1);
            }
          }
          if (el.value !== undefined) {
            meta.value = el.value;
            if (
              el.tagName === "INPUT" &&
              CHECKABLE_INPUTS.indexOf(el.type) >= 0 &&
              !el.checked
            ) {
              delete meta.value;
            }
          }
          return meta;
        };
        View.prototype.pushEvent = function (
          type,
          el,
          targetCtx,
          phxEvent,
          meta
        ) {
          var _this = this;
          this.pushWithReply(
            function () {
              return _this.putRef([el], type);
            },
            "event",
            {
              type: type,
              event: phxEvent,
              value: this.extractMeta(el, meta),
              cid: this.targetComponentID(el, targetCtx),
            }
          );
        };
        View.prototype.pushKey = function (
          keyElement,
          targetCtx,
          kind,
          phxEvent,
          meta
        ) {
          var _this = this;
          this.pushWithReply(
            function () {
              return _this.putRef([keyElement], kind);
            },
            "event",
            {
              type: kind,
              event: phxEvent,
              value: this.extractMeta(keyElement, meta),
              cid: this.targetComponentID(keyElement, targetCtx),
            }
          );
        };
        View.prototype.pushInput = function (
          inputEl,
          targetCtx,
          phxEvent,
          eventTarget,
          callback
        ) {
          var _this = this;
          DOM.dispatchEvent(inputEl.form, PHX_CHANGE_EVENT, {
            triggeredBy: inputEl,
          });
          this.pushWithReply(
            function () {
              return _this.putRef([inputEl, inputEl.form], "change");
            },
            "event",
            {
              type: "form",
              event: phxEvent,
              value: serializeForm(inputEl.form, { _target: eventTarget.name }),
              cid: this.targetComponentID(inputEl.form, targetCtx),
            },
            callback
          );
        };
        View.prototype.pushFormSubmit = function (
          formEl,
          targetCtx,
          phxEvent,
          onReply
        ) {
          var _this = this;
          var filterIgnored = function (el) {
            return !closestPhxBinding(
              el,
              _this.binding(PHX_UPDATE) + "=ignore",
              el.form
            );
          };
          var refGenerator = function () {
            var disables = DOM.all(
              formEl,
              "[" + _this.binding(PHX_DISABLE_WITH) + "]"
            );
            var buttons = DOM.all(formEl, "button").filter(filterIgnored);
            var inputs = DOM.all(formEl, "input").filter(filterIgnored);
            buttons.forEach(function (button) {
              button.setAttribute(PHX_DISABLED, button.disabled.toString());
              button.disabled = true;
            });
            inputs.forEach(function (input) {
              input.setAttribute(PHX_READONLY, input.readOnly.toString());
              input.readOnly = true;
            });
            formEl.setAttribute(_this.binding(PHX_PAGE_LOADING), "");
            return _this.putRef(
              [formEl].concat(disables).concat(buttons).concat(inputs),
              "submit"
            );
          };
          this.pushWithReply(
            refGenerator,
            "event",
            {
              type: "form",
              event: phxEvent,
              value: serializeForm(formEl),
              cid: this.targetComponentID(formEl, targetCtx),
            },
            onReply
          );
        };
        View.prototype.pushFormRecovery = function (form, callback) {
          var _this = this;
          this.liveSocket.withinOwners(form, function (view, targetCtx) {
            var input = form.elements[0];
            var phxEvent =
              form.getAttribute(_this.binding(PHX_AUTO_RECOVER)) ||
              form.getAttribute(_this.binding("change"));
            view.pushInput(input, targetCtx, phxEvent, input, callback);
          });
        };
        View.prototype.pushLinkPatch = function (href, targetEl, callback) {
          var _this = this;
          if (!this.isLoading()) {
            this.showLoader(this.liveSocket.loaderTimeout);
          }
          var linkRef = this.liveSocket.setPendingLink(href);
          var refGen = targetEl
            ? function () {
                return _this.putRef([targetEl], "click");
              }
            : null;
          this.pushWithReply(refGen, "link", { url: href }, function (resp) {
            if (resp.link_redirect) {
              _this.liveSocket.replaceMain(href, null, callback, linkRef);
            } else if (_this.liveSocket.commitPendingLink(linkRef)) {
              _this.href = href;
              _this.applyPendingUpdates();
              _this.hideLoader();
              _this.triggerReconnected();
              callback && callback();
            }
          }).receive("timeout", function () {
            return _this.liveSocket.redirect(window.location.href);
          });
        };
        View.prototype.formsForRecovery = function (html) {
          var _this = this;
          var phxChange = this.binding("change");
          var template = document.createElement("template");
          template.innerHTML = html;
          return DOM.all(this.el, "form[" + phxChange + "]")
            .filter(function (form) {
              return _this.ownsElement(form);
            })
            .filter(function (form) {
              return (
                form.getAttribute(_this.binding(PHX_AUTO_RECOVER)) !== "ignore"
              );
            })
            .filter(function (form) {
              return template.content.querySelector(
                "form[" + phxChange + '="' + form.getAttribute(phxChange) + '"]'
              );
            });
        };
        View.prototype.maybePushComponentsDestroyed = function (destroyedCIDs) {
          var _this = this;
          var completelyDestroyedCIDs = destroyedCIDs.filter(function (cid) {
            return DOM.findComponentNodeList(_this.el, cid).length === 0;
          });
          if (completelyDestroyedCIDs.length > 0) {
            this.pushWithReply(
              null,
              "cids_destroyed",
              { cids: completelyDestroyedCIDs },
              function () {
                _this.rendered.pruneCIDs(completelyDestroyedCIDs);
              }
            );
          }
        };
        View.prototype.ownsElement = function (el) {
          return (
            el.getAttribute(PHX_PARENT_ID) === this.id ||
            maybe(el.closest(PHX_VIEW_SELECTOR), function (node) {
              return node.id;
            }) === this.id
          );
        };
        View.prototype.submitForm = function (form, targetCtx, phxEvent) {
          var _this = this;
          DOM.putPrivate(form, PHX_HAS_SUBMITTED, true);
          this.liveSocket.blurActiveElement(this);
          this.pushFormSubmit(form, targetCtx, phxEvent, function () {
            _this.liveSocket.restorePreviouslyActiveFocus();
          });
        };
        View.prototype.binding = function (kind) {
          return this.liveSocket.binding(kind);
        };
        return View;
      })();

      var viewHookID = 1;
      var ViewHook = /** @class */ (function () {
        function ViewHook(view, el, callbacks) {
          var _this = this;
          this.__view = view;
          this.__liveSocket = view.liveSocket;
          this.__callbacks = callbacks;
          this.el = el;
          this.viewName = view.name();
          this.el.phxHookId = ViewHook.makeID();
          Object.keys(this.__callbacks).forEach(function (key) {
            _this[key] = _this.__callbacks[key];
          });
        }
        ViewHook.makeID = function () {
          return viewHookID++;
        };
        ViewHook.elementID = function (el) {
          return el.phxHookId;
        };
        ViewHook.prototype.pushEvent = function (event, payload) {
          if (payload === void 0) {
            payload = {};
          }
          this.__view.pushHookEvent(null, event, payload);
        };
        ViewHook.prototype.pushEventTo = function (phxTarget, event, payload) {
          if (payload === void 0) {
            payload = {};
          }
          this.__liveSocket.withinTargets(null, phxTarget, function (
            view,
            targetCtx
          ) {
            view.pushHookEvent(targetCtx, event, payload);
          });
        };
        ViewHook.prototype.__trigger__ = function (kind) {
          var callback = this.__callbacks[kind];
          callback && callback.call(this);
        };
        return ViewHook;
      })();

      // CONCATENATED MODULE: ./src/phoenix_live_view.ts
      /* harmony export (binding) */ __webpack_require__.d(
        __webpack_exports__,
        "debug",
        function () {
          return debug;
        }
      );
      /* harmony export (binding) */ __webpack_require__.d(
        __webpack_exports__,
        "LiveSocket",
        function () {
          return phoenix_live_view_LiveSocket;
        }
      );
      /* harmony export export */ __webpack_require__.d(
        __webpack_exports__,
        "default",
        function () {
          return phoenix_live_view;
        }
      );
      var phoenix_live_view_read =
        (undefined && undefined.__read) ||
        function (o, n) {
          var m = typeof Symbol === "function" && o[Symbol.iterator];
          if (!m) return o;
          var i = m.call(o),
            r,
            ar = [],
            e;
          try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
              ar.push(r.value);
          } catch (error) {
            e = { error: error };
          } finally {
            try {
              if (r && !r.done && (m = i["return"])) m.call(i);
            } finally {
              if (e) throw e.error;
            }
          }
          return ar;
        };
      var phoenix_live_view_values =
        (undefined && undefined.__values) ||
        function (o) {
          var s = typeof Symbol === "function" && Symbol.iterator,
            m = s && o[s],
            i = 0;
          if (m) return m.call(o);
          if (o && typeof o.length === "number")
            return {
              next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
              },
            };
          throw new TypeError(
            s ? "Object is not iterable." : "Symbol.iterator is not defined."
          );
        };

      var debug = function (view, kind, msg, obj) {
        if (view.liveSocket.isDebugEnabled()) {
          console.log(view.id + " " + kind + ": " + msg + " - ", obj);
        }
      };
      /** Initializes the LiveSocket
       *
       *
       * @param {string} endPoint - The string WebSocket endpoint, ie, `"wss://example.com/live"`,
       *                                               `"/live"` (inherited host & protocol)
       * @param {Phoenix.Socket} socket - the required Phoenix Socket class imported from "phoenix". For example:
       *
       *     import {Socket} from "phoenix"
       *     import {LiveSocket} from "phoenix_live_view"
       *     let liveSocket = new LiveSocket("/live", Socket, {...})
       *
       * @param {Object} [opts] - Optional configuration. Outside of keys listed below, all
       * configuration is passed directly to the Phoenix Socket constructor.
       * @param {Function} [opts.defaults] - The optional defaults to use for various bindings,
       * such as `phx-debounce`. Supports the following keys:
       *
       *   - debounce - the millisecond phx-debounce time. Defaults 300
       *   - throttle - the millisecond phx-throttle time. Defaults 300
       *
       * @param {Function} [opts.params] - The optional function for passing connect params.
       * The function receives the viewName associated with a given LiveView. For example:
       *
       *     (viewName) => {view: viewName, token: window.myToken}
       *
       * @param {string} [opts.bindingPrefix] - The optional prefix to use for all phx DOM annotations.
       * Defaults to "phx-".
       * @param {string} [opts.hooks] - The optional object for referencing LiveView hook callbacks.
       * @param {integer} [opts.loaderTimeout] - The optional delay in milliseconds to wait before apply
       * loading states.
       * @param {Function} [opts.viewLogger] - The optional function to log debug information. For example:
       *
       *     (view, kind, msg, obj) => console.log(`${view.id} ${kind}: ${msg} - `, obj)
       */
      var phoenix_live_view_LiveSocket = /** @class */ (function () {
        function LiveSocket(url, phxSocket, opts) {
          var _this = this;
          if (opts === void 0) {
            opts = {
              bindingPrefix: undefined,
              params: undefined,
              viewLogger: undefined,
              defaults: undefined,
              hooks: "",
              loaderTimeout: 0,
            };
          }
          this.unloaded = false;
          if (!phxSocket || phxSocket.constructor.name === "Object") {
            throw new Error(
              '\n      a phoenix Socket must be provided as the second argument to the LiveSocket constructor. For example:\n\n          import {Socket} from "phoenix"\n          import {LiveSocket} from "phoenix_live_view"\n          let liveSocket = new LiveSocket("/live", Socket, {...})\n      '
            );
          }
          this.socket = new phxSocket(url, opts);
          this.bindingPrefix = opts.bindingPrefix || BINDING_PREFIX;
          this.opts = opts;
          this.params = closure(opts.params || {});
          this.viewLogger = opts.viewLogger;
          this.defaults = Object.assign(clone(DEFAULTS), opts.defaults || {});
          this.activeElement = null;
          this.prevActive = null;
          this.silenced = false;
          this.main = null;
          this.linkRef = 0;
          this.roots = {};
          this.href = window.location.href;
          this.pendingLink = null;
          this.currentLocation = clone(window.location);
          this.hooks = opts.hooks || {};
          this.loaderTimeout = opts.loaderTimeout || LOADER_TIMEOUT;
          this.socket.onOpen(function () {
            if (_this.isUnloaded()) {
              _this.destroyAllViews();
              _this.joinRootViews();
            }
            _this.unloaded = false;
          });
          window.addEventListener("unload", function () {
            _this.unloaded = true;
          });
        }
        // public
        LiveSocket.prototype.isProfileEnabled = function () {
          return sessionStorage.getItem(PHX_LV_PROFILE) === "true";
        };
        LiveSocket.prototype.isDebugEnabled = function () {
          return sessionStorage.getItem(PHX_LV_DEBUG) === "true";
        };
        LiveSocket.prototype.enableDebug = function () {
          sessionStorage.setItem(PHX_LV_DEBUG, "true");
        };
        LiveSocket.prototype.enableProfiling = function () {
          sessionStorage.setItem(PHX_LV_PROFILE, "true");
        };
        LiveSocket.prototype.disableDebug = function () {
          sessionStorage.removeItem(PHX_LV_DEBUG);
        };
        LiveSocket.prototype.disableProfiling = function () {
          sessionStorage.removeItem(PHX_LV_PROFILE);
        };
        LiveSocket.prototype.enableLatencySim = function (upperBoundMs) {
          this.enableDebug();
          console.log(
            "latency simulator enabled for the duration of this browser session. Call disableLatencySim() to disable"
          );
          sessionStorage.setItem(PHX_LV_LATENCY_SIM, upperBoundMs);
        };
        LiveSocket.prototype.disableLatencySim = function () {
          sessionStorage.removeItem(PHX_LV_LATENCY_SIM);
        };
        LiveSocket.prototype.getLatencySim = function () {
          var str = sessionStorage.getItem(PHX_LV_LATENCY_SIM);
          return str ? parseInt(str) : null;
        };
        LiveSocket.prototype.getSocket = function () {
          return this.socket;
        };
        LiveSocket.prototype.connect = function () {
          var _this = this;
          var doConnect = function () {
            if (_this.joinRootViews()) {
              _this.bindTopLevelEvents();
              _this.socket.connect();
            }
          };
          if (
            ["complete", "loaded", "interactive"].indexOf(
              document.readyState
            ) >= 0
          ) {
            doConnect();
          } else {
            document.addEventListener("DOMContentLoaded", function () {
              return doConnect();
            });
          }
        };
        LiveSocket.prototype.disconnect = function () {
          this.socket.disconnect();
        };
        // private
        LiveSocket.prototype.time = function (name, func) {
          if (!this.isProfileEnabled() || !console.time) {
            return func();
          }
          console.time(name);
          var result = func();
          console.timeEnd(name);
          return result;
        };
        LiveSocket.prototype.log = function (view, kind, msgCallback) {
          if (this.viewLogger) {
            var _a = phoenix_live_view_read(msgCallback(), 2),
              msg = _a[0],
              obj = _a[1];
            this.viewLogger(view, kind, msg, obj);
          } else if (this.isDebugEnabled()) {
            var _b = phoenix_live_view_read(msgCallback(), 2),
              msg = _b[0],
              obj = _b[1];
            debug(view, kind, msg, obj);
          }
        };
        LiveSocket.prototype.onChannel = function (channel, event, cb) {
          var _this = this;
          channel.on(event, function (data) {
            var latency = _this.getLatencySim();
            if (!latency) {
              cb(data);
            } else {
              console.log(
                "simulating " + latency + "ms of latency from server to client"
              );
              setTimeout(function () {
                return cb(data);
              }, latency);
            }
          });
        };
        LiveSocket.prototype.wrapPush = function (push) {
          var latency = this.getLatencySim();
          if (!latency) {
            return push();
          }
          console.log(
            "simulating " + latency + "ms of latency from client to server"
          );
          var fakePush = {
            receives: [],
            receive: function (kind, cb) {
              this.receives.push([kind, cb]);
            },
          };
          setTimeout(function () {
            fakePush.receives.reduce(function (acc, _a) {
              var _b = phoenix_live_view_read(_a, 2),
                kind = _b[0],
                cb = _b[1];
              return acc.receive(kind, cb);
            }, push());
          }, latency);
          return fakePush;
        };
        LiveSocket.prototype.reloadWithJitter = function (view) {
          var _this = this;
          this.disconnect();
          var _a = phoenix_live_view_read(RELOAD_JITTER, 2),
            minMs = _a[0],
            maxMs = _a[1];
          var afterMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
          var tries = Browser.updateLocal(
            view.name(),
            CONSECUTIVE_RELOADS,
            0,
            function (count) {
              return count + 1;
            }
          );
          this.log(view, "join", function () {
            return ["encountered " + tries + " consecutive reloads"];
          });
          if (tries > MAX_RELOADS) {
            this.log(view, "join", function () {
              return [
                "exceeded " +
                  MAX_RELOADS +
                  " consecutive reloads. Entering failsafe mode",
              ];
            });
            afterMs = FAILSAFE_JITTER;
          }
          setTimeout(function () {
            if (_this.hasPendingLink()) {
              window.location = _this.pendingLink;
            } else {
              window.location.reload();
            }
          }, afterMs);
        };
        LiveSocket.prototype.getHookCallbacks = function (hookName) {
          return this.hooks[hookName];
        };
        LiveSocket.prototype.isUnloaded = function () {
          return this.unloaded;
        };
        LiveSocket.prototype.isConnected = function () {
          return this.socket.isConnected();
        };
        LiveSocket.prototype.getBindingPrefix = function () {
          return this.bindingPrefix;
        };
        LiveSocket.prototype.binding = function (kind) {
          return "" + this.getBindingPrefix() + kind;
        };
        LiveSocket.prototype.channel = function (topic, params) {
          return this.socket.channel(topic, params);
        };
        LiveSocket.prototype.joinRootViews = function () {
          var _this = this;
          var rootsFound = false;
          DOM.each(
            document,
            PHX_VIEW_SELECTOR + ":not([" + PHX_PARENT_ID + "])",
            function (rootEl) {
              var view = _this.joinRootView(rootEl, _this.getHref());
              _this.root = _this.root || view;
              if (rootEl.getAttribute(PHX_MAIN)) {
                _this.main = view;
              }
              rootsFound = true;
            }
          );
          return rootsFound;
        };
        LiveSocket.prototype.redirect = function (to, flash) {
          this.disconnect();
          Browser.redirect(to, flash);
        };
        LiveSocket.prototype.replaceMain = function (
          href,
          flash,
          callback,
          linkRef
        ) {
          var _this = this;
          if (callback === void 0) {
            callback = null;
          }
          if (linkRef === void 0) {
            linkRef = this.setPendingLink(href);
          }
          var mainEl = this.main.el;
          this.main.destroy();
          this.main.showLoader(this.loaderTimeout);
          Browser.fetchPage(href, function (status, html) {
            if (status !== 200) {
              return _this.redirect(href);
            }
            var template = document.createElement("template");
            template.innerHTML = html;
            var el = template.content.childNodes[0];
            if (!el || !_this.isPhxView(el)) {
              return _this.redirect(href);
            }
            _this.joinRootView(el, href, flash, function (newMain, joinCount) {
              if (joinCount !== 1) {
                return;
              }
              if (!_this.commitPendingLink(linkRef)) {
                newMain.destroy();
                return;
              }
              mainEl.replaceWith(newMain.el);
              _this.main = newMain;
              callback && callback();
            });
          });
        };
        LiveSocket.prototype.isPhxView = function (el) {
          return el.getAttribute && el.getAttribute(PHX_VIEW) !== null;
        };
        LiveSocket.prototype.joinRootView = function (
          el,
          href,
          flash,
          callback
        ) {
          var view = new view_View(el, this, null, href, flash);
          this.roots[view.id] = view;
          view.join(callback);
          return view;
        };
        LiveSocket.prototype.owner = function (childEl, callback) {
          var _this = this;
          var view = maybe(childEl.closest(PHX_VIEW_SELECTOR), function (el) {
            return _this.getViewByEl(el);
          });
          if (view) {
            callback(view);
          }
        };
        LiveSocket.prototype.withinTargets = function (
          el,
          phxTarget,
          callback
        ) {
          var _this = this;
          if (/^(0|[1-9](\d?)+)$/.test(phxTarget)) {
            var myselfTarget_1 = el;
            if (!myselfTarget_1) {
              throw new Error(
                "no phx-target's found matching @myself of " + phxTarget
              );
            }
            this.owner(myselfTarget_1, function (view) {
              return callback(view, myselfTarget_1);
            });
          } else {
            var targets = Array.from(document.querySelectorAll(phxTarget));
            if (targets.length === 0) {
              throw new Error(
                "no phx-target's found for selector \"" + phxTarget + '"'
              );
            }
            targets.forEach(function (targetEl) {
              _this.owner(targetEl, function (view) {
                return callback(view, targetEl);
              });
            });
          }
        };
        LiveSocket.prototype.withinOwners = function (childEl, callback) {
          var phxTarget = childEl.getAttribute(this.binding("target"));
          if (phxTarget === null) {
            this.owner(childEl, function (view) {
              return callback(view, childEl);
            });
          } else {
            this.withinTargets(childEl, phxTarget, callback);
          }
        };
        LiveSocket.prototype.getViewByEl = function (el) {
          var rootId = el.getAttribute(PHX_ROOT_ID);
          return this.getRootById(rootId).getDescendentByEl(el);
        };
        LiveSocket.prototype.getRootById = function (id) {
          return this.roots[id];
        };
        LiveSocket.prototype.onViewError = function (view) {
          this.dropActiveElement(view);
        };
        LiveSocket.prototype.destroyAllViews = function () {
          for (var id in this.roots) {
            this.roots[id].destroy();
            delete this.roots[id];
          }
        };
        LiveSocket.prototype.destroyViewByEl = function (el) {
          var root = this.getRootById(el.getAttribute(PHX_ROOT_ID));
          root.destroyDescendent(el.id);
        };
        LiveSocket.prototype.setActiveElement = function (target) {
          var _this = this;
          if (this.activeElement === target) {
            return;
          }
          this.activeElement = target;
          var cancel = function () {
            if (target === _this.activeElement) {
              _this.activeElement = null;
            }
            target.removeEventListener("mouseup", _this);
            target.removeEventListener("touchend", _this);
          };
          target.addEventListener("mouseup", cancel);
          target.addEventListener("touchend", cancel);
        };
        LiveSocket.prototype.getActiveElement = function () {
          if (document.activeElement === document.body) {
            return this.activeElement || document.activeElement;
          } else {
            return document.activeElement;
          }
        };
        LiveSocket.prototype.dropActiveElement = function (view) {
          if (this.prevActive && view.ownsElement(this.prevActive)) {
            this.prevActive = null;
          }
        };
        LiveSocket.prototype.restorePreviouslyActiveFocus = function () {
          var _a;
          if (this.prevActive !== document.body) {
            (_a = this.prevActive) === null || _a === void 0
              ? void 0
              : _a.focus();
          }
        };
        LiveSocket.prototype.blurActiveElement = function () {
          this.prevActive = this.getActiveElement();
          if (this.prevActive !== document.body) {
            this.prevActive.blur();
          }
        };
        LiveSocket.prototype.bindTopLevelEvents = function () {
          var _this = this;
          this.bindClicks();
          this.bindNav();
          this.bindForms();
          this.bind({ keyup: "keyup", keydown: "keydown" }, function (
            e,
            type,
            view,
            target,
            targetCtx,
            phxEvent,
            _phxTarget
          ) {
            var matchKey = target.getAttribute(_this.binding(PHX_KEY));
            if (matchKey && matchKey.toLowerCase() !== e.key.toLowerCase()) {
              return;
            }
            view.pushKey(target, targetCtx, type, phxEvent, {
              altGraphKey: e.altGraphKey,
              altKey: e.altKey,
              code: e.code,
              ctrlKey: e.ctrlKey,
              key: e.key,
              keyIdentifier: e.keyIdentifier,
              keyLocation: e.keyLocation,
              location: e.location,
              metaKey: e.metaKey,
              repeat: e.repeat,
              shiftKey: e.shiftKey,
            });
          });
          this.bind({ blur: "focusout", focus: "focusin" }, function (
            e,
            type,
            view,
            targetEl,
            targetCtx,
            phxEvent,
            phxTarget
          ) {
            if (!phxTarget) {
              view.pushEvent(type, targetEl, targetCtx, phxEvent, {
                type: type,
              });
            }
          });
          this.bind({ blur: "blur", focus: "focus" }, function (
            e,
            type,
            view,
            targetEl,
            targetCtx,
            phxEvent,
            phxTarget
          ) {
            // blur and focus are triggered on document and window. Discard one to avoid dups
            if (
              phxTarget !== null && phxTarget !== void 0
                ? phxTarget
                : phxTarget !== "window"
            ) {
              view.pushEvent(type, targetEl, targetCtx, phxEvent, {
                type: e.type,
              });
            }
          });
        };
        LiveSocket.prototype.setPendingLink = function (href) {
          this.linkRef++;
          this.pendingLink = href;
          return this.linkRef;
        };
        LiveSocket.prototype.commitPendingLink = function (linkRef) {
          if (this.linkRef !== linkRef) {
            return false;
          } else {
            this.href = this.pendingLink;
            this.pendingLink = null;
            return true;
          }
        };
        LiveSocket.prototype.getHref = function () {
          return this.href;
        };
        LiveSocket.prototype.hasPendingLink = function () {
          return !!this.pendingLink;
        };
        LiveSocket.prototype.bind = function (events, callback) {
          var _this = this;
          Object.keys(events).forEach(function (event) {
            var browserEventName = events[event];
            _this.on(browserEventName, function (e) {
              var binding = _this.binding(event);
              var windowBinding = _this.binding("window-" + event);
              var targetPhxEvent =
                e.target.getAttribute && e.target.getAttribute(binding);
              if (targetPhxEvent) {
                _this.debounce(e.target, e, function () {
                  _this.withinOwners(e.target, function (view, targetCtx) {
                    callback(
                      e,
                      event,
                      view,
                      e.target,
                      targetCtx,
                      targetPhxEvent,
                      null
                    );
                  });
                });
              } else {
                DOM.each(document, "[" + windowBinding + "]", function (el) {
                  var phxEvent = el.getAttribute(windowBinding);
                  _this.debounce(el, e, function () {
                    _this.withinOwners(el, function (view, targetCtx) {
                      callback(
                        e,
                        event,
                        view,
                        el,
                        targetCtx,
                        phxEvent,
                        "window"
                      );
                    });
                  });
                });
              }
            });
          });
        };
        LiveSocket.prototype.bindClicks = function () {
          var _this = this;
          [true, false].forEach(function (capture) {
            var click = capture
              ? _this.binding("capture-click")
              : _this.binding("click");
            window.addEventListener(
              "click",
              function (e) {
                var target = null;
                if (capture) {
                  target = e.target.matches("[" + click + "]")
                    ? e.target
                    : e.target.querySelector("[" + click + "]");
                } else {
                  target = closestPhxBinding(e.target, click);
                }
                var phxEvent = target && target.getAttribute(click);
                if (!phxEvent) {
                  return;
                }
                if (target.getAttribute("href") === "#") {
                  e.preventDefault();
                }
                var meta = {
                  altKey: e.altKey,
                  shiftKey: e.shiftKey,
                  ctrlKey: e.ctrlKey,
                  metaKey: e.metaKey,
                  x: e.x || e.clientX,
                  y: e.y || e.clientY,
                  pageX: e.pageX,
                  pageY: e.pageY,
                  screenX: e.screenX,
                  screenY: e.screenY,
                  offsetX: e.offsetX,
                  offsetY: e.offsetY,
                  detail: e.detail || 1,
                };
                _this.debounce(target, e, function () {
                  _this.withinOwners(target, function (view, targetCtx) {
                    view.pushEvent("click", target, targetCtx, phxEvent, meta);
                  });
                });
              },
              capture
            );
          });
        };
        LiveSocket.prototype.bindNav = function () {
          var _this = this;
          if (!Browser.canPushState()) {
            return;
          }
          window.onpopstate = function (event) {
            if (!_this.registerNewLocation(window.location)) {
              return;
            }
            var _a = event.state || {},
              type = _a.type,
              id = _a.id,
              root = _a.root;
            var href = window.location.href;
            if (
              _this.main.isConnected() &&
              type === "patch" &&
              id === _this.main.id
            ) {
              _this.main.pushLinkPatch(href, null);
            } else {
              _this.replaceMain(href, null, function () {
                if (root) {
                  _this.replaceRootHistory();
                }
              });
            }
          };
          window.addEventListener(
            "click",
            function (e) {
              var target = closestPhxBinding(e.target, PHX_LIVE_LINK);
              var type = target && target.getAttribute(PHX_LIVE_LINK);
              var wantsNewTab = e.metaKey || e.ctrlKey || e.button === 1;
              if (!type || !_this.isConnected() || !_this.main || wantsNewTab) {
                return;
              }
              var href = target.href;
              var linkState = target.getAttribute(PHX_LINK_STATE);
              e.preventDefault();
              if (_this.pendingLink === href) {
                return;
              }
              if (type === "patch") {
                _this.pushHistoryPatch(href, linkState, target);
              } else if (type === "redirect") {
                _this.historyRedirect(href, linkState);
              } else {
                throw new Error(
                  "expected " +
                    PHX_LIVE_LINK +
                    ' to be "patch" or "redirect", got: ' +
                    type
                );
              }
            },
            false
          );
        };
        LiveSocket.prototype.withPageLoading = function (info, callback) {
          DOM.dispatchEvent(window, "phx:page-loading-start", info);
          var done = function () {
            return DOM.dispatchEvent(window, "phx:page-loading-stop", info);
          };
          return callback ? callback(done) : done;
        };
        LiveSocket.prototype.pushHistoryPatch = function (
          href,
          linkState,
          targetEl
        ) {
          var _this = this;
          this.withPageLoading({ to: href, kind: "patch" }, function (done) {
            _this.main.pushLinkPatch(href, targetEl, function () {
              _this.historyPatch(href, linkState);
              done();
            });
          });
        };
        LiveSocket.prototype.historyPatch = function (href, linkState) {
          Browser.pushState(
            linkState,
            { type: "patch", id: this.main.id },
            href
          );
          this.registerNewLocation(window.location);
        };
        LiveSocket.prototype.historyRedirect = function (
          href,
          linkState,
          flash
        ) {
          var _this = this;
          this.withPageLoading({ to: href, kind: "redirect" }, function (done) {
            _this.replaceMain(href, flash, function () {
              Browser.pushState(
                linkState,
                { type: "redirect", id: _this.main.id },
                href
              );
              _this.registerNewLocation(window.location);
              done();
            });
          });
        };
        LiveSocket.prototype.replaceRootHistory = function () {
          Browser.pushState("replace", {
            root: true,
            type: "patch",
            id: this.main.id,
          });
        };
        LiveSocket.prototype.registerNewLocation = function (newLocation) {
          var _a = this.currentLocation,
            pathname = _a.pathname,
            search = _a.search;
          if (pathname + search === newLocation.pathname + newLocation.search) {
            return false;
          } else {
            this.currentLocation = clone(newLocation);
            return true;
          }
        };
        LiveSocket.prototype.bindForms = function () {
          var e_1, _a;
          var _this = this;
          var iterations = 0;
          this.on("submit", function (e) {
            var phxEvent = e.target.getAttribute(_this.binding("submit"));
            if (!phxEvent) {
              return;
            }
            e.preventDefault();
            e.target.disabled = true;
            _this.withinOwners(e.target, function (view, targetCtx) {
              return view.submitForm(e.target, targetCtx, phxEvent);
            });
          });
          var _loop_1 = function (type) {
            this_1.on(type, function (e) {
              var input = e.target;
              var phxEvent =
                input.form && input.form.getAttribute(_this.binding("change"));
              if (!phxEvent) {
                return;
              }
              if (
                input.type === "number" &&
                input.validity &&
                input.validity.badInput
              ) {
                return;
              }
              var currentIterations = iterations;
              iterations++;
              var _a = DOM.private(input, "prev-iteration") || {},
                at = _a.at,
                lastType = _a.type;
              // detect dup because some browsers dispatch both "input" and "change"
              if (at === currentIterations - 1 && type !== lastType) {
                return;
              }
              DOM.putPrivate(input, "prev-iteration", {
                at: currentIterations,
                type: type,
              });
              _this.debounce(input, e, function () {
                _this.withinOwners(input.form, function (view, targetCtx) {
                  if (DOM.isTextualInput(input)) {
                    DOM.putPrivate(input, PHX_HAS_FOCUSED, true);
                  } else {
                    _this.setActiveElement(input);
                  }
                  view.pushInput(input, targetCtx, phxEvent, e.target);
                });
              });
            });
          };
          var this_1 = this;
          try {
            for (
              var _b = phoenix_live_view_values(["change", "input"]),
                _c = _b.next();
              !_c.done;
              _c = _b.next()
            ) {
              var type = _c.value;
              _loop_1(type);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        };
        LiveSocket.prototype.debounce = function (el, event, callback) {
          var phxDebounce = this.binding(PHX_DEBOUNCE);
          var phxThrottle = this.binding(PHX_THROTTLE);
          var defaultDebounce = this.defaults.debounce.toString();
          var defaultThrottle = this.defaults.throttle.toString();
          DOM.debounce(
            el,
            event,
            phxDebounce,
            defaultDebounce,
            phxThrottle,
            defaultThrottle,
            callback
          );
        };
        LiveSocket.prototype.silenceEvents = function (callback) {
          this.silenced = true;
          callback();
          this.silenced = false;
        };
        LiveSocket.prototype.on = function (event, callback) {
          var _this = this;
          window.addEventListener(event, function (e) {
            if (!_this.silenced) {
              callback(e);
            }
          });
        };
        return LiveSocket;
      })();

      /* harmony default export */ var phoenix_live_view = phoenix_live_view_LiveSocket;

      /***/
    },

    /******/
  },
  /******/ function (__webpack_require__) {
    // webpackRuntimeModules
    /******/ "use strict" /* webpack/runtime/make namespace object */;
    /******/

    /******/ /******/ !(function () {
      /******/ // define __esModule on exports
      /******/ __webpack_require__.r = function (exports) {
        /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          /******/ Object.defineProperty(exports, Symbol.toStringTag, {
            value: "Module",
          });
          /******/
        }
        /******/ Object.defineProperty(exports, "__esModule", { value: true });
        /******/
      };
      /******/
    })(); /* webpack/runtime/define property getter */
    /******/

    /******/ /******/ !(function () {
      /******/ // define getter function for harmony exports
      /******/ var hasOwnProperty = Object.prototype.hasOwnProperty;
      /******/ __webpack_require__.d = function (exports, name, getter) {
        /******/ if (!hasOwnProperty.call(exports, name)) {
          /******/ Object.defineProperty(exports, name, {
            enumerable: true,
            get: getter,
          });
          /******/
        }
        /******/
      };
      /******/
    })(); /* webpack/runtime/create fake namespace object */
    /******/

    /******/ /******/ !(function () {
      /******/ // create a fake namespace object
      /******/ // mode & 1: value is a module id, require it
      /******/ // mode & 2: merge all properties of value into the ns
      /******/ // mode & 4: return value when already ns object
      /******/ // mode & 8|1: behave like require
      /******/ __webpack_require__.t = function (value, mode) {
        /******/ if (mode & 1) value = this(value);
        /******/ if (mode & 8) return value;
        /******/ if (
          mode & 4 &&
          typeof value === "object" &&
          value &&
          value.__esModule
        )
          return value;
        /******/ var ns = Object.create(null);
        /******/ __webpack_require__.r(ns);
        /******/ Object.defineProperty(ns, "default", {
          enumerable: true,
          value: value,
        });
        /******/ if (mode & 2 && typeof value != "string")
          for (var key in value)
            __webpack_require__.d(
              ns,
              key,
              function (key) {
                return value[key];
              }.bind(null, key)
            );
        /******/ return ns;
        /******/
      };
      /******/
    })(); /* webpack/runtime/compat get default export */
    /******/

    /******/ /******/ !(function () {
      /******/ // getDefaultExport function for compatibility with non-harmony modules
      /******/ __webpack_require__.n = function (module) {
        /******/ var getter =
          module && module.__esModule
            ? /******/ function getDefault() {
                return module["default"];
              }
            : /******/ function getModuleExports() {
                return module;
              };
        /******/ __webpack_require__.d(getter, "a", getter);
        /******/ return getter;
        /******/
      };
      /******/
    })();
    /******/
    /******/
  }
);
