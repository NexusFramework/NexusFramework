@include DelegateEntry
@include Virtual

@target ES5

class RegistryEntry extends DelegateEntry {
    
    private _name:String;
    private _path:String;
    private _initialized:boolean = false;
    constructor(name:String, path:String) {
        this._name = name;
        this._path = path;
        var self = this;
        setTimeout(function() {
            self._init(function() {
                self._initialized = true;
                self.emit("initialized");
            });
        }, 0);
    }
    
    public _init(done:Function) {
        Virtual.method(this, "_init");
    }
    
    get name() {
        return this._name;
    }
    
    get path() {
        return this._path;
    }
    
}

@main RegistryEntry