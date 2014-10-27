@include PathResolver

function PageModule(uri, resolver:PathResolver) {
}

PageModule.prototype.getErrorCode = function() {
	return this.error.code;
}

PageModule.prototype.getErrorMessage = function() {
	return this.error.message;
}

@main PageModule