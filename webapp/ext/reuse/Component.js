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
                mimeType: {
                    type: "string",
                    group: "specific",  
                    defaultValue: "MimeType"
                },
                uploadEnabledPath: {
                    type: "string",
                    group: "specific",
                    defaultValue: null
                },
                //if no uploadEnabledPath, then use value uploadEnabled
                uploadEnabled: {
                    type: "boolean",
                    group: "specific",
                    defaultValue: false
                },
                visibleDeletePath: {
                    type: "string",
                    group: "specific",
                    defaultValue: null
                },
                //if no visibleDeletePath, then use value visibleDelete
                visibleDelete: {
                    type: "boolean",
                    group: "specific",
                    defaultValue: false
                },
                uploadButtonInvisiblePath: {
                    type: "string",
                    group: "specific",
                    defaultValue: null
                },
                //if no uploadButtonInvisiblePath, then use value uploadButtonInvisible
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
                visibility: {
                    type: "string",
                    group: "specific",
                    defaultValue: true
                },
                attributes: {
                    type: "array",
                    group: "specific",
                    defaultValue: null
                }
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
                        type: ViewType.XML,
                        preprocessors: {
                            xml: {
                                bindingContexts: {
                                    meta: oMetaModel.getMetaContext(oBindingContext.getPath()),
                                    props: oRootControl.getBindingContext("props")
                                },
                                models: {
                                    meta: oMetaModel,
                                    props: oPropModel
                                }
                            }
                        }
                    });
                }).catch(function(){
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
            var sVisiblePath = this.getVisibility();
            var bVisible = oModel.getProperty(sVisiblePath, oBindingContext);

            oExtensionAPI.setSectionHidden(bVisible);
        },

        /**
         * Load files then component is visible
         * @param {boolean} bStIsAreaVisible 
         */
        setStIsAreaVisible: function(bStIsAreaVisible){
            var oComponent = this;
            var oRootControl = this.getRootControl();
            var iLength = oRootControl && oRootControl.getItems().length;

            if(bStIsAreaVisible !== this.getStIsAreaVisible()){
                this.setProperty("stIsAreaVisible", bStIsAreaVisible);
            }

            if(bStIsAreaVisible === true && iLength === 0){
                this._contentPromise && this._contentPromise.then(function(oView){
                    oRootControl.addItem(oView);

                    //temporary solution to the problem for runAsOwner
                    oView.fireEvent("afterInit", {
                        component: oComponent
                    });
                });
            }
        },

        /**
         * define visibility of component
         * @param {sap.ui.model.Context} oContext object page context
         */
        _getVisibility: function(oContext){
            var sVisiblePath = this.getVisibility();
            var oModel = oContext.getModel();

            return oModel.getProperty(sVisiblePath, oContext);
        }
    });

});