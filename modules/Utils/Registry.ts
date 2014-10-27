@nodereq weakmap:WeakMap

@include RegistryEntry

class Registry<E extends RegistryEntry> {
    private _parent:Registry;
    private _cache:WeakMap<String, E> = new WeakMap();
    constructor(parent:Registry) {
        this._parent = parent;
    }
    
    public _resolve(name:String):E {
        throw new Error("Virtual method `RegistryEntry._resolve`");
    }
    
    public resolve(name:String):RegistryEntry {
        var resolved:E = this._cache.get(name);
        if(!resolved) {
            if(resolved = this._resolve(name)) {
                var self = this;
                resolved.on("unload", function() {
                    delete self._cache.delete(name);
                });
                return this._cache.set(name, resolved);
            }

            if(!resolved && this._parent)
                resolved = this._parent.resolve(name);
        }
        
        if(!resolved)
            throw new Error("Cannot resolve", name, typeof this);
        return resolved;
    }
    
}

@main Registry