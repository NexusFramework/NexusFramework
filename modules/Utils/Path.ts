@nodereq path
require("string.prototype.startswith");

@target ES5

class Path {
    private static _dataDir = path.normalize(
                process.env.PERSISTENT_DATA_DIR
                || path.resolve("/"));
    private _root:String;
    private _persistent:boolean;
    public constructor(root:String, dontNormalize:boolean) {
        this._root = dontNormalize ? root : path.normalize(root);
        this._persistent = this._root.startsWith(Path._dataDir);
        this._static = process.env.STATIC_HTTP_ROOT && !this._persistent;
    }
    
    public resolve(_path:String, forceRelative:boolean) {
        var resolved = path.resolve(this._root, _path);
        resolved = path.normalize(resolved);
        
        if(forceRelative && !resolved.startsWith(this._root))
            throw new Error("Tried to use path outside of root");
        
        return new Path(resolved, true);
    }
    
    /*
    static paths are not modified at runtime.
    */
    get static() {
        return this._static;
    }
    
    /*
    persistent paths have data that persists modifications across runtimes.
    */
    get persistent() {
        return this._persistent;
    }
    
}

@main Path