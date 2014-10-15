function PageModule(uri) {
}

PageModule.prototype.getErrorCode = function() {
	return this.error.code;
}

PageModule.prototype.getErrorMessage = function() {
	return this.error.message;
}
