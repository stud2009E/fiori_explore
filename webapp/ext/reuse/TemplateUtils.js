sap.ui.define([], function(){
    "use strict";

    /**
     * construct simple xml binding for data field
     * @param {string} propertyName 
     * @returns {string} xml binding
     */
    function simplePath(propertyName){
        return propertyName ? "{"+ propertyName +"}" : "";
    }


    /**
     * construct simple xml binding for label
     * @param {string} propertyName property name
     * @returns {string} xml binding 
     */
    function simplePathLabel(propertyName){
        return propertyName ? "{"+ propertyName +"/#@sap:label}" : "";
    }

    return {
        simplePath: simplePath,
        simplePathLabel: simplePathLabel
    };

}, true);