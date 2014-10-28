@include Path

class PathResolver {
    private _root:String;
    private _parent:PathResolver;
    
    constructor(root:String, parent?:PathResolver) {
        this._root = root;
        this._parent = parent;
    }
    
    public resolve(test:Function):Path {
        
    }
    
};

@main PathResolver