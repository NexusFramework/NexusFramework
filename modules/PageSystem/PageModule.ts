@include PathResolver
@reference PageError

@target ES5

class PageModule {
    private _error:PageError;
    constructor(uri, resolver:PathResolver) {
    }
    
    get error():PageError {
        return this._error;
    }
}

@main PageModule