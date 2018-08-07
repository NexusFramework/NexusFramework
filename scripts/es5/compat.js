var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../index.d.ts" />
(function (window) {
    var Buffer;
    var TextDecoder = window['TextDecoder'];
    var TextEncoder = window['TextEncoder'];
    var BufferBase = /** @class */ (function (_super) {
        __extends(BufferBase, _super);
        function BufferBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BufferBase.isBuffer = function (object) {
            return object instanceof Buffer;
        };
        BufferBase.prototype.slice = function (start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = this.length; }
            return new Buffer(this.buffer.slice(start, end));
        };
        BufferBase.prototype.write = function (index, val) {
            this[index] = val;
        };
        BufferBase.prototype.copy = function (from, offset, start, end) {
            if (offset === void 0) { offset = 0; }
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = from.length; }
            var copylen = end - start + offset;
            for (var i = offset; i < copylen; i++)
                this[offset] = from[start + i];
        };
        return BufferBase;
    }(Uint8Array));
    if (TextDecoder && TextEncoder) {
        var BufferImpl = /** @class */ (function (_super) {
            __extends(BufferImpl, _super);
            function BufferImpl() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BufferImpl.prototype.toString = function (encoding, start, end) {
                if (start === void 0) { start = 0; }
                if (end === void 0) { end = this.length; }
                var decoder = new TextDecoder(encoding);
                if (start > 0 || end < this.length)
                    return decoder.decode(this.slice(start, end));
                return decoder.decode(this);
            };
            return BufferImpl;
        }(BufferBase));
        (Buffer = BufferImpl)['from'] = function (data, encoding) {
            if (encoding === void 0) { encoding = "utf8"; }
            var encoder = new TextEncoder(encoding);
            var encoded = encoder.encode(data);
            var buffer = new Buffer(encoded.length);
            buffer.copy(encoded);
            return buffer;
        };
    }
    else {
        var BufferImpl = /** @class */ (function (_super) {
            __extends(BufferImpl, _super);
            function BufferImpl() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            BufferImpl.prototype.toString = function (encoding, start, end) {
                if (start === void 0) { start = 0; }
                if (end === void 0) { end = this.length; }
                var str = "";
                for (var i = start; i < end; i++)
                    str += String.fromCharCode(this[i]);
                return str;
            };
            return BufferImpl;
        }(BufferBase));
        (Buffer = BufferImpl)['from'] = function (data, encoding) {
            if (encoding === void 0) { encoding = "utf8"; }
            if (encoding === "utf8") {
                data = "" + data;
                var len = data.length;
                var buff = new Buffer(len);
                for (var i = 0; i < len; i++)
                    buff[i] = data.charCodeAt(i) & 0xFF;
                console.log(buff);
                return buff;
            }
            else
                return new Buffer(data);
        };
    }
    window['Buffer'] = Buffer;
    window['global'] = window;
})(window);
//# sourceMappingURL=compat.js.map