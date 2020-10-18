sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangement/Arrangement",
	"./WelcomeTest"
], function (
	Opa5,
	Arrangement
){
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "z.feat.exp.view.",
		autoWait: true
	});

});
