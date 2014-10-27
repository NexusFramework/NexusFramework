class Virtual {
    public static method(obj:Object, name:String) {
        throw new Error("Virtual method `" + name + "` in `" + (typeof obj) + "`");
    }
    public static property(obj:Object, name:String) {
        throw new Error("Virtual property `" + name + "` in `" + (typeof obj) + "`");
    }
}

@main Virtual