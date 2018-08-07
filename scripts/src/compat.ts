/// <reference path="../index.d.ts" />
(function(window) {
  var Buffer;
  const TextDecoder: {new (encoding: string): TextDecoder} = window['TextDecoder'];
  const TextEncoder: {new (encoding: string): TextEncoder} = window['TextEncoder'];
  class BufferBase extends Uint8Array {
    static isBuffer(object: any) {
      return object instanceof Buffer;
    }
    slice(start = 0, end = this.length) {
      return new Buffer(this.buffer.slice(start, end));
    }
    write(index: number, val: number) {
      this[index] = val;
    }
    copy(from: Uint8Array, offset = 0, start = 0, end = from.length) {
      const copylen = end - start + offset;
      for(var i=offset; i<copylen; i++)
        this[offset] = from[start + i];
    }
  }
  if (TextDecoder && TextEncoder) {
    class BufferImpl extends BufferBase {
      toString(encoding?: string, start = 0, end = this.length) {
        const decoder = new TextDecoder(encoding);
        if (start > 0 || end < this.length)
          return decoder.decode(this.slice(start, end));
        return decoder.decode(this);
      }
    }
    ((Buffer = BufferImpl) as any)['from'] = function(data, encoding = "utf8") {
      const encoder = new TextEncoder(encoding);
      const encoded = encoder.encode(data);
      const buffer = new Buffer(encoded.length);
      buffer.copy(encoded);
      return buffer;
    };
  } else {
    class BufferImpl extends BufferBase {
      toString(encoding?: string, start = 0, end = this.length) {
        var str = "";
        for(var i=start; i<end; i++)
          str += String.fromCharCode(this[i]);
        return str;
      }
    }
    ((Buffer = BufferImpl) as any)['from'] = function(data, encoding = "utf8") {
      if (encoding === "utf8") {
        data = "" + data;
        const len = data.length;
        const buff = new Buffer(len);
        for(var i=0; i<len; i++)
          buff[i] = data.charCodeAt(i) & 0xFF;
        console.log(buff);
        return buff;
      } else
        return new Buffer(data);
    };
  }
  window['Buffer'] = Buffer;
  window['global'] = window;
})(window);
