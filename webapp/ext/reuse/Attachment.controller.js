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
			var oComponent = this.getOwnerComponent();
			var oUploadCollection = this.byId("attachments");
			var oBinding = oUploadCollection.getBinding("items");

			if(oBinding){
				oBinding.attachDataReceived(this.updateUploadCollectionItems, this);
			}
			
			oUploadCollection.addEventDelegate({
				onAfterRendering: this.updateUploadCollectionItems.bind(this)
			});

			oComponent.attachChange(this.updateUploader, this);
		},

		/**
		 * get owner component 
		 * temporary solution to the problem for runAsOwner method in xml template
		 * @returns {sap.ui.core.Component} component
		 */
		getOwnerComponent: function(){
			var oView = this.getView();
			var oViewData = oView.getViewData();

			return oViewData.component;
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
				});
			}).then(function(){
				oSource.getBinding("items").refresh();
			}).finally(function(){
				MessageUtil.handleTransientMessages(null, "");
			});;
		},

		/**
		 * handle context change event
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onModelContextChange: function(oEvent){
			this.updateUploader();
		},

		/**
		 * update upload collection
		 */
		updateUploader: function(){
			var oComponent = this.getOwnerComponent();
			var oUploadCollection = this.byId("attachments");
			var bInvisible = oComponent.getUploadButtonInvisible();
			
			oUploadCollection.setUploadButtonInvisible(bInvisible);

			this.updateUploadCollectionItems();
			this.updateUploadUri();
		},

		/**
		 * update upload collection items 
		 */
		updateUploadCollectionItems: function(){
			var oComponent = this.getOwnerComponent();
			var oUploadCollection = this.byId("attachments");
			var bDeleteVisible = oComponent.getVisibleDelete();

			$.each(oUploadCollection.getItems(), function(i, oItem){
				oItem.setVisibleDelete(bDeleteVisible);
			});
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
			var sTargetUri = oComponent.getNavProperty();
			var sNavigationPath = oBindingContext.getPath(sTargetUri);
			
			oUploadCollection.setUploadUrl(sNavigationPath);
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
				var sContextUrl = oBindingContext.getPath("$value");
				oUploadCollectionItem.setUrl(sContextUrl);
			}

			oUploadCollectionItem.download(true);
		}
	});

});