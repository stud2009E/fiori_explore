sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/ViewType",
    "sap/suite/ui/generic/template/extensionAPI/ReuseComponentSupport",
    "sap/m/VBox",
    "./TemplateUtils"
], function(
    UIComponent,
    View,
    ViewType,
    ReuseComponentSupport,
    VBox,
    TemplateUtils
){
    "use strict";

    return UIComponent.extend("z.feat.exp.ext.reuse.Component", {
        metadata: {
            manifest: "json",
            properties: {
                //standard properties
                uiMode: {
                    type: "string",
                    group: "standard"
                },
                semanticObject: {
                    type: "string",
                    group: "standard"
                },
                stIsAreaVisible: {
                    type: "boolean",
                    group: "standard"
                },

                // specific
                viewName: {
                    type: "string",
                    group: "specific",
                    defaultValue: "z.feat.exp.ext.reuse.Attachment"
                },
                navProperty: {
                    type: "string",
                    group: "specific",
                    defaultValue: ""
                },
                documentId: {
                    type: "string",
                    group: "specific",
                    defaultValue: "DocumentId"
                },
                fileName: {
                    type: "string",
                    group: "specific",
                    defaultValue: "FileName"
                },
                //string[]:Example mimeType ["image/png", "image/jpeg"]
                mimeType: {
                    type: "array",
                    group: "specific",  
                    defaultValue: "MimeType"
                },
                //if no uploadEnabledPath, then use value uploadEnabled
                uploadEnabled: {
                    type: "boolean",
                    group: "specific",
                    defaultValue: false
                },
                visibleDelete: {
                    type: "boolean",
                    group: "specific",
                    defaultValue: false
                },
                uploadButtonInvisible: {
                    type: "boolean",
                    group: "specific",
                    defaultValue: true
                },
                extensionAPI: {
                    type: "sap.suite.ui.generic.template.ObjectPage.extensionAPI.ExtensionAPI",
                    group: "specific",
                    defaultValue: null
                },
                hidden: {
                    type: "boolean",
                    group: "specific",
                    defaultValue: true
                },
                //Example: [{path: "prop1"}, {path: "prop2"}] 
                attributes: {
                    type: "array",
                    group: "specific",
                    defaultValue: null
                }
            },

            events: {
                change: {}
            }
        },

        init: function(){
            ReuseComponentSupport.mixInto(this, "props", true);
            
            (UIComponent.prototype.init || jQuery.noop).apply(this, arguments);
        },

        /**
         * create component content
         * @returns {sap.m.VBox}
         */
        createContent: function(){
            return new VBox(this.createId("content"));  
        },

        /**
         * handle initialization hook of reuse component 
         * @param {sap.ui.model.Model} oModel object page main model
         * @param {sap.ui.model.Context} oBindingContext current context of object page
         * @param {sap.suite.ui.generic.template.ObjectPage.extensionAPI.ExtensionAPI} oExtensionAPI extension api of object page
         */
        stStart: function(oModel, oBindingContext, oExtensionAPI){
            var oComponent = this;
            var oMetaModel = oModel.getMetaModel();
            var oRootControl = this.getRootControl();
            var oPropModel = this.getComponentModel();

            //remember to use in controller
            this.setProperty("extensionAPI", oExtensionAPI);
            
            //update visibility because of async events
            this.setHidden(this.getHidden());

            oRootControl.setModel(oPropModel, "props");
            oRootControl.bindElement({
                model: "props",
                path: "/"
            });

            this._contentPromise = oMetaModel.loaded()
                .then(function(){
                    return View.create({
                        async: true,
                        viewName: oComponent.getViewName(),
                        viewData: {
                            component: oComponent
                        },
                        type: ViewType.XML,
                        preprocessors: {
                            xml: {
                                bindingContexts: {
                                    props: oRootControl.getBindingContext("props")
                                },
                                models: {
                                    meta: oMetaModel,
                                    props: oPropModel
                                }
                            }
                        }
                    });
                }).catch(function(oError){
                    console.log(oError);
                    //TODO log error message
                });
        },

        /**
         * refresh component when context of object page is changed
         * @param {sap.ui.model.odata.v2.ODataModel} oModel 
         * @param {sap.ui.model.Context} oBindingContext 
         * @param {object} oExtensionAPI 
         */
        stRefresh(oModel, oBindingContext, oExtensionAPI){
            //
        },

        /**
         * hide upload button
         * @param {boolean} bHidden 
         * @param {boolean} bSuppressInvalidate 
         */
        setUploadButtonInvisible: function(bHidden, bSuppressInvalidate){
            var bOldValue = this.getProperty("uploadButtonInvisible");
            this.setProperty("uploadButtonInvisible", bHidden, bSuppressInvalidate);

            this._fireChangeEvent(bHidden, bOldValue, "uploadButtonInvisible"); 
        },

        /**
         * set visibility of delete
         * @param {boolean} bVisible 
         * @param {boolean} bSuppressInvalidate 
         */
        setVisibleDelete: function(bVisible, bSuppressInvalidate){
            var bOldValue = this.getProperty("visibleDelete");
            this.setProperty("visibleDelete", bVisible, bSuppressInvalidate);

            this._fireChangeEvent(bVisible, bOldValue, "visibleDelete"); 
        },

        /**
         * enable file upload
         * @param {boolean} bEnabled 
         * @param {boolean} bSuppressInvalidate 
         */
        setUploadEnabled: function(bEnabled, bSuppressInvalidate){
            var bOldValue = this.getProperty("uploadEnabled");
            
            this.setProperty("uploadEnabled", bEnabled, bSuppressInvalidate);
            this._fireChangeEvent(bEnabled, bOldValue, "uploadEnabled"); 
        },


        /**
         * fire event if new value is not equal to old
         * @param {boolean} bNewValue new value
         * @param {boolean} bOldValue old value
         * @param {string} sProperty property name
         */
        _fireChangeEvent: function(bNewValue, bOldValue, sProperty){
            if(typeof bNewValue === "boolean" && bOldValue !== bNewValue){    
                this.fireEvent("change", {
                    property: sProperty,
                    value: bNewValue
                });
            }
        },

        /**
         * 
         * @param {boolean} bHidden 
         */
        setHidden:function(bHidden, bSuppressInvalidate){
            var oExtensionAPI = this.getExtensionAPI();
            if(typeof bHidden === "boolean" && oExtensionAPI){ 
                oExtensionAPI.setSectionHidden(bHidden);
            }

            this.setProperty("hidden", bHidden, bSuppressInvalidate);
        },

        /**
         * Load files then component is visible (lazy load)
         * @param {boolean} bStIsAreaVisible 
         */
        setStIsAreaVisible: function(bStIsAreaVisible){
            var oRootControl = this.getRootControl();
            var iLength = oRootControl && oRootControl.getItems().length;

            if(bStIsAreaVisible !== this.getStIsAreaVisible()){
                this.setProperty("stIsAreaVisible", bStIsAreaVisible);
            }

            if(bStIsAreaVisible === true && iLength === 0){
                this._contentPromise && this._contentPromise.then(function(oView){
                    oRootControl.addItem(oView);
                });
            }
        }
    });

});