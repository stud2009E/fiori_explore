jQuery.sap.require("sap/ui/generic/app/util/MessageUtil");
var MessageUtil = sap.ui.require("sap/ui/generic/app/util/MessageUtil");

sap.ui.controller("z.feat.exp.ext.controller.ObjectPageExt", {
	onInit: function () {
		
		this.extensionAPI.attachPageDataLoaded(this.onPageDataLoaded, this);

	},

	onPageDataLoaded: function(oCtxWrapping){
		//here goes your code
	},

	getResourceBundle: function () {
		return this.getOwnerComponent().getModel("i18n").getResourceBundle();
	},
	
	/**
	 * get i18n text
	 */ 
	i18n: function(){
		var oBundle = this.getResourceBundle();
		return oBundle.getText.apply(oBundle, arguments);
	},
	
	/**
	 * handle backend transient messages
	 */
	handleMessage: function(){
		var oView = this.getView();
		var that = this;
		
		function getMessageDialogForView(oThisView, sName, oFragmentController) {
			var sViewId = oThisView.getId();
			var	oFragment;
			
			if(!that[sName]){
				oFragment = sap.ui.xmlfragment(sViewId, sName, oFragmentController);
				oThisView.addDependent(oFragment);
				
				that[sName] = oFragment;
			}else{
				oFragment = that[sName];
			}
			
			return oFragment;
		}
		
		MessageUtil.handleTransientMessages(getMessageDialogForView.bind(null, oView));
	}

});