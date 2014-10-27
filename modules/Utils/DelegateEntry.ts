@nodereq events
@include Virtual

class DelegateEntry extends events.EventEmitter {
    
    private _loaded:boolean = false;
    constructor() {}
    
    private load() {
        var self = this;
        self.emit("load");
        this._load(function() {
            self._loaded = true;
            self.emit("loaded");
        });
    }
    
    public unload() {
        self.emit("unload");
        this._load(function() {
            self._loaded = false;
            self.emit("unloaded");
        });
    }

    public _unload(done:Function) {
        Virtual.method(this, "_unload");
    }

    public _load(done:Function) {
        Virtual.method(this, "_load");
    }
    
}

@main DelegateEntry