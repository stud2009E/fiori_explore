sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/UploadCollectionParameter",
	"sap/ui/generic/app/util/MessageUtil"
], function (
	Controller,
	UploadCollectionParameter,
	MessageUtil
) {
	
	"use strict";

	return Controller.extend("z.feat.exp.ext.reuse.controller.Attachment", {

		onInit: function(){
			var oView = this.getView();
			oView.attachAfterInit(this.onAfterInit, this);
		},

		/**
		 * handle after init event
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onAfterInit: function(oEvent){
			this._component = oEvent.getParameter("component");

			this.updateUploadUri();
			this.setupUploader();
		},

		/**
		 * get owner component 
		 * temporary solution to the problem for runAsOwner method in xml template
		 * @returns {sap.ui.core.Component} component
		 */
		getOwnerComponent: function(){
			return this._component;
		},


		/**
		 * get extension api of object page 
		 * @returns {sap.suite.ui.generic.template.ObjectPage.extensionAPI.ExtensionAPI}
		 */
		getExtensionApi: function(){
			var oComponent = this.getOwnerComponent();
			return oComponent.getExtensionAPI();
		},

		/**
		 * 
		 * @param {strig} sName model name 
		 */
		getModel: function(sName){
			var oComponent = this.getOwnerComponent();
			return oComponent && oComponent.getModel(sName);
		},

		/**
		 * Handle event of delete file
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onFileDeleted: function(oEvent){
			var oSource = oEvent.getSource();
			var oModel = this.getModel();
			var oItem = oEvent.getParameter("item");
			var oCtx = oItem.getBindingContext();
			var oExtApi = this.getExtensionApi();
			
			oExtApi && oExtApi.securedExecution(function(){
				return new Promise(function(resolve, reject){
					oModel.remove(oCtx.getPath() + "/$value",{
						success: resolve,
						error: reject
					});
				}).then(function(){
					oSource.getBinding("items").refresh();
				}).finally(function(){
					MessageUtil.handleTransientMessages(null, "");
				});
			});
		},
		
		/**
		 * Setup uploader uploadEnabled and uploadButtonInvisible
		 */
		setupUploader: function(){
			var oUpload = this.byId("attachments");
			var oComponent = this.getOwnerComponent();

			var sInvisiblePath = oComponent.getUploadButtonInvisiblePath();
			var bInvisible = oComponent.getUploadButtonInvisible();
			if(sInvisiblePath){
				oUpload.bindProperty("uploadButtonInvisible", {
					path: sInvisiblePath,
					formatter: function(bInvisible){
						return !!bInvisible;
					}
				});
			}else{
				oUpload.setUploadButtonInvisible(bInvisible);
			}

			var sEnablePath = oComponent.getUploadEnabledPath();
			var bEnabled = oComponent.getUploadEnabled();
			if(sEnablePath){
				oUpload.bindProperty("uploadEnabled", {
					path: sEnablePath,
					formatter: function(bEnabled){
						return !!bEnabled;
					}
				});
			}else{
				oUpload.setUploadEnabled(bEnabled);
			}
		},

		/**
		 * setup upload uri for upload collection
		 */
		updateUploadUri: function(){
			var oComponent = this.getOwnerComponent();
			var oUploadCollection = this.byId("attachments");
			var oBindingContext = this.getView().getBindingContext();

			if(!oBindingContext){
				return;
			}
			var oModel = oBindingContext.getModel();
			var sServiceUri = oModel.sServiceUrl;
			var sTargetUri = oComponent.getNavProperty();
			var sTargetUploadNavigationPath = oBindingContext.getPath(sTargetUri);
			
			oUploadCollection.setUploadUrl(sServiceUri + sTargetUploadNavigationPath);
		},

		/**
		 * handle context change event
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onModelContextChange: function(oEvent){

		},

		/**
		 * Handle event before upload. Add required headers.
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onBeforeUploadAttachment: function(oEvent){
			var oParameters = oEvent.getParameters();
			var oHeaderParameterSlug = new UploadCollectionParameter({
				name: "slug",
				value: encodeURIComponent(oEvent.getParameter("fileName"))
			});
			oParameters.addHeaderParameter(oHeaderParameterSlug);
			
			var oModel = this.getView().getModel();
			var sSecurityToken = oModel.getSecurityToken();
			var oHeaderSecurityToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: sSecurityToken
			});

			oParameters.addHeaderParameter(oHeaderSecurityToken);
		},

		/**
		 * Handle event after upload finished to show loaded item
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onCompleteUploadAttachment: function(oEvent){
			var oSource = oEvent.getSource();
			oSource.getBinding("items").refresh();
		},

		/**
		 * Load file
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onDownloadLinkPress: function(oEvent){
			var oUploadCollectionItem = oEvent.getSource();

			if(!oUploadCollectionItem.getUrl()){
				var oBindingContext = oUploadCollectionItem.getBindingContext();
				var oModel = oBindingContext.getModel();
				var sServiceUrl = oModel.sServiceUrl;
				var sContextUrl = oBindingContext.getPath("$value");
				var sItemUrl = sServiceUrl + sContextUrl;
				oUploadCollectionItem.setUrl(sItemUrl);
			}

			oUploadCollectionItem.download(true);
		}
	});

});