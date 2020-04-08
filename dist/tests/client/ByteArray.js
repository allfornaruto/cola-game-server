"use strict";
//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Endian class contains values that denote the byte order used to represent multibyte numbers.
 * The byte order is either bigEndian (most significant byte first) or littleEndian (least significant byte first).
 * @version Egret 2.4
 * @platform Web,Native
 * @language en_US
 */
/**
 * Endian 类中包含一些值，它们表示用于表示多字节数字的字节顺序。
 * 字节顺序为 bigEndian（最高有效字节位于最前）或 littleEndian（最低有效字节位于最前）。
 * @version Egret 2.4
 * @platform Web,Native
 * @language zh_CN
 */
class Endian {
}
exports.Endian = Endian;
/**
 * Indicates the least significant byte of the multibyte number appears first in the sequence of bytes.
 * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte). The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
 * @version Egret 2.4
 * @platform Web,Native
 * @language en_US
 */
/**
 * 表示多字节数字的最低有效字节位于字节序列的最前面。
 * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
 * @version Egret 2.4
 * @platform Web,Native
 * @language zh_CN
 */
Endian.LITTLE_ENDIAN = 'littleEndian';
/**
 * Indicates the most significant byte of the multibyte number appears first in the sequence of bytes.
 * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).  The most significant byte is 0x12. The least significant byte is 0x78. (For the equivalent decimal number, 305419896, the most significant digit is 3, and the least significant digit is 6).
 * @version Egret 2.4
 * @platform Web,Native
 * @language en_US
 */
/**
 * 表示多字节数字的最高有效字节位于字节序列的最前面。
 * 十六进制数字 0x12345678 包含 4 个字节（每个字节包含 2 个十六进制数字）。最高有效字节为 0x12。最低有效字节为 0x78。（对于等效的十进制数字 305419896，最高有效数字是 3，最低有效数字是 6）。
 * @version Egret 2.4
 * @platform Web,Native
 * @language zh_CN
 */
Endian.BIG_ENDIAN = 'bigEndian';
/**
 * The ByteArray class provides methods and attributes for optimized reading and writing as well as dealing with binary data.
 * Note: The ByteArray class is applied to the advanced developers who need to access data at the byte layer.
 * @version Egret 2.4
 * @platform Web,Native
 * @includeExample egret/utils/ByteArray.ts
 * @language en_US
 */
/**
 * ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性。
 * 注意：ByteArray 类适用于需要在字节层访问数据的高级开发人员。
 * @version Egret 2.4
 * @platform Web,Native
 * @includeExample egret/utils/ByteArray.ts
 * @language zh_CN
 */
class ByteArray {
    /**
     * @version Egret 2.4
     * @platform Web,Native
     */
    constructor(buffer, bufferExtSize = 0) {
        /**
         * @private
         */
        this.bufferExtSize = 0; // Buffer expansion size
        /**
         * @private
         */
        this.EOF_byte = -1;
        /**
         * @private
         */
        this.EOF_code_point = -1;
        if (bufferExtSize < 0) {
            bufferExtSize = 0;
        }
        this.bufferExtSize = bufferExtSize;
        let bytes, wpos = 0;
        if (buffer) { // 有数据，则可写字节数从字节尾开始
            let uint8;
            if (buffer instanceof Uint8Array) {
                uint8 = buffer;
                wpos = buffer.length;
            }
            else {
                wpos = buffer.byteLength;
                uint8 = new Uint8Array(buffer);
            }
            if (bufferExtSize === 0) {
                bytes = new Uint8Array(wpos);
            }
            else {
                let multi = (wpos / bufferExtSize | 0) + 1;
                bytes = new Uint8Array(multi * bufferExtSize);
            }
            bytes.set(uint8);
        }
        else {
            bytes = new Uint8Array(bufferExtSize);
        }
        this.write_position = wpos;
        this._position = 0;
        this._bytes = bytes;
        this.data = new DataView(bytes.buffer);
        this.endian = Endian.BIG_ENDIAN;
    }
    /**
     * Changes or reads the byte order; egret.EndianConst.BIG_ENDIAN or egret.EndianConst.LITTLE_EndianConst.
     * @default egret.EndianConst.BIG_ENDIAN
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 更改或读取数据的字节顺序；egret.EndianConst.BIG_ENDIAN 或 egret.EndianConst.LITTLE_ENDIAN。
     * @default egret.EndianConst.BIG_ENDIAN
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    get endian() {
        return this.$endian === 0 /* LITTLE_ENDIAN */ ? Endian.LITTLE_ENDIAN : Endian.BIG_ENDIAN;
    }
    set endian(value) {
        this.$endian = value === Endian.LITTLE_ENDIAN ? 0 /* LITTLE_ENDIAN */ : 1 /* BIG_ENDIAN */;
    }
    /**
     * @deprecated
     * @version Egret 2.4
     * @platform Web,Native
     */
    setArrayBuffer(buffer) {
    }
    /**
     * 可读的剩余字节数
     *
     * @returns
     *
     * @memberOf ByteArray
     */
    get readAvailable() {
        return this.write_position - this._position;
    }
    get buffer() {
        return this.data.buffer.slice(0, this.write_position);
    }
    get rawBuffer() {
        return this.data.buffer;
    }
    /**
     * @private
     */
    set buffer(value) {
        let wpos = value.byteLength;
        let uint8 = new Uint8Array(value);
        let bufferExtSize = this.bufferExtSize;
        let bytes;
        if (bufferExtSize === 0) {
            bytes = new Uint8Array(wpos);
        }
        else {
            let multi = (wpos / bufferExtSize | 0) + 1;
            bytes = new Uint8Array(multi * bufferExtSize);
        }
        bytes.set(uint8);
        this.write_position = wpos;
        this._bytes = bytes;
        this.data = new DataView(bytes.buffer);
    }
    get bytes() {
        return this._bytes;
    }
    /**
     * @private
     * @version Egret 2.4
     * @platform Web,Native
     */
    get dataView() {
        return this.data;
    }
    /**
     * @private
     */
    set dataView(value) {
        this.buffer = value.buffer;
    }
    /**
     * @private
     */
    get bufferOffset() {
        return this.data.byteOffset;
    }
    /**
     * The current position of the file pointer (in bytes) to move or return to the ByteArray object. The next time you start reading reading method call in this position, or will start writing in this position next time call a write method.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将文件指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中。下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
        if (value > this.write_position) {
            this.write_position = value;
        }
    }
    /**
     * The length of the ByteArray object (in bytes).
              * If the length is set to be larger than the current length, the right-side zero padding byte array.
              * If the length is set smaller than the current length, the byte array is truncated.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * ByteArray 对象的长度（以字节为单位）。
     * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧。
     * 如果将长度设置为小于当前长度的值，将会截断该字节数组。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    get length() {
        return this.write_position;
    }
    set length(value) {
        this.write_position = value;
        if (this.data.byteLength > value) {
            this._position = value;
        }
        this._validateBuffer(value);
    }
    _validateBuffer(value) {
        if (this.data.byteLength < value) {
            let be = this.bufferExtSize;
            let tmp;
            if (be === 0) {
                tmp = new Uint8Array(value);
            }
            else {
                let nLen = ((value / be >> 0) + 1) * be;
                tmp = new Uint8Array(nLen);
            }
            tmp.set(this._bytes);
            this._bytes = tmp;
            this.data = new DataView(tmp.buffer);
        }
    }
    /**
     * The number of bytes that can be read from the current position of the byte array to the end of the array data.
     * When you access a ByteArray object, the bytesAvailable property in conjunction with the read methods each use to make sure you are reading valid data.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 可从字节数组的当前位置到数组末尾读取的数据的字节数。
     * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    get bytesAvailable() {
        return this.data.byteLength - this._position;
    }
    /**
     * Clears the contents of the byte array and resets the length and position properties to 0.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 清除字节数组的内容，并将 length 和 position 属性重置为 0。
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    clear() {
        let buffer = new ArrayBuffer(this.bufferExtSize);
        this.data = new DataView(buffer);
        this._bytes = new Uint8Array(buffer);
        this._position = 0;
        this.write_position = 0;
    }
    /**
     * Read a Boolean value from the byte stream. Read a simple byte. If the byte is non-zero, it returns true; otherwise, it returns false.
     * @return If the byte is non-zero, it returns true; otherwise, it returns false.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取布尔值。读取单个字节，如果字节非零，则返回 true，否则返回 false
     * @return 如果字节不为零，则返回 true，否则返回 false
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readBoolean() {
        if (this.validate(1 /* SIZE_OF_BOOLEAN */))
            return !!this._bytes[this.position++];
    }
    /**
     * Read signed bytes from the byte stream.
     * @return An integer ranging from -128 to 127
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取带符号的字节
     * @return 介于 -128 和 127 之间的整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readByte() {
        if (this.validate(1 /* SIZE_OF_INT8 */))
            return this.data.getInt8(this.position++);
    }
    /**
     * Read data byte number specified by the length parameter from the byte stream. Starting from the position specified by offset, read bytes into the ByteArray object specified by the bytes parameter, and write bytes into the target ByteArray
     * @param bytes ByteArray object that data is read into
     * @param offset Offset (position) in bytes. Read data should be written from this position
     * @param length Byte number to be read Default value 0 indicates reading all available data
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取 length 参数指定的数据字节数。从 offset 指定的位置开始，将字节读入 bytes 参数指定的 ByteArray 对象中，并将字节写入目标 ByteArray 中
     * @param bytes 要将数据读入的 ByteArray 对象
     * @param offset bytes 中的偏移（位置），应从该位置写入读取的数据
     * @param length 要读取的字节数。默认值 0 导致读取所有可用的数据
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readBytes(bytes, offset = 0, length = 0) {
        if (!bytes) { // 由于bytes不返回，所以new新的无意义
            return;
        }
        let pos = this._position;
        let available = this.write_position - pos;
        if (available < 0) {
            throw new Error('1025');
            // return;
        }
        if (length === 0) {
            length = available;
        }
        else if (length > available) {
            throw new Error('1025');
            // return;
        }
        bytes.validateBuffer(offset + length);
        bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
        this.position += length;
    }
    /**
     * Read an IEEE 754 double-precision (64 bit) floating point number from the byte stream
     * @return Double-precision (64 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个 IEEE 754 双精度（64 位）浮点数
     * @return 双精度（64 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readDouble() {
        if (this.validate(8 /* SIZE_OF_FLOAT64 */)) {
            let value = this.data.getFloat64(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 8 /* SIZE_OF_FLOAT64 */;
            return value;
        }
    }
    /**
     * Read an IEEE 754 single-precision (32 bit) floating point number from the byte stream
     * @return Single-precision (32 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个 IEEE 754 单精度（32 位）浮点数
     * @return 单精度（32 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readFloat() {
        if (this.validate(4 /* SIZE_OF_FLOAT32 */)) {
            let value = this.data.getFloat32(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_FLOAT32 */;
            return value;
        }
    }
    /**
     * Read a 32-bit signed integer from the byte stream.
     * @return A 32-bit signed integer ranging from -2147483648 to 2147483647
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个带符号的 32 位整数
     * @return 介于 -2147483648 和 2147483647 之间的 32 位带符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readInt() {
        if (this.validate(4 /* SIZE_OF_INT32 */)) {
            let value = this.data.getInt32(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_INT32 */;
            return value;
        }
    }
    /**
     * Read a 16-bit signed integer from the byte stream.
     * @return A 16-bit signed integer ranging from -32768 to 32767
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个带符号的 16 位整数
     * @return 介于 -32768 和 32767 之间的 16 位带符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readShort() {
        if (this.validate(2 /* SIZE_OF_INT16 */)) {
            let value = this.data.getInt16(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_INT16 */;
            return value;
        }
    }
    /**
     * Read unsigned bytes from the byte stream.
     * @return A 32-bit unsigned integer ranging from 0 to 255
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取无符号的字节
     * @return 介于 0 和 255 之间的 32 位无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readUnsignedByte() {
        if (this.validate(1 /* SIZE_OF_UINT8 */))
            return this._bytes[this.position++];
    }
    /**
     * Read a 32-bit unsigned integer from the byte stream.
     * @return A 32-bit unsigned integer ranging from 0 to 4294967295
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个无符号的 32 位整数
     * @return 介于 0 和 4294967295 之间的 32 位无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readUnsignedInt() {
        if (this.validate(4 /* SIZE_OF_UINT32 */)) {
            let value = this.data.getUint32(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_UINT32 */;
            return value;
        }
    }
    /**
     * Read a 16-bit unsigned integer from the byte stream.
     * @return A 16-bit unsigned integer ranging from 0 to 65535
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个无符号的 16 位整数
     * @return 介于 0 和 65535 之间的 16 位无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readUnsignedShort() {
        if (this.validate(2 /* SIZE_OF_UINT16 */)) {
            let value = this.data.getUint16(this._position, this.$endian === 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
            return value;
        }
    }
    /**
     * Read a UTF-8 character string from the byte stream Assume that the prefix of the character string is a short unsigned integer (use byte to express length)
     * @return UTF-8 character string
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个 UTF-8 字符串。假定字符串的前缀是无符号的短整型（以字节表示长度）
     * @return UTF-8 编码的字符串
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readUTF() {
        let length = this.readUnsignedShort();
        if (length > 0) {
            return this.readUTFBytes(length);
        }
        else {
            return '';
        }
    }
    /**
     * Read a UTF-8 byte sequence specified by the length parameter from the byte stream, and then return a character string
     * @param Specify a short unsigned integer of the UTF-8 byte length
     * @return A character string consists of UTF-8 bytes of the specified length
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 从字节流中读取一个由 length 参数指定的 UTF-8 字节序列，并返回一个字符串
     * @param length 指明 UTF-8 字节长度的无符号短整型数
     * @return 由指定长度的 UTF-8 字节组成的字符串
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    readUTFBytes(length) {
        if (!this.validate(length)) {
            return;
        }
        let data = this.data;
        let bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
        this.position += length;
        return this.decodeUTF8(bytes);
    }
    /**
     * Write a Boolean value. A single byte is written according to the value parameter. If the value is true, write 1; if the value is false, write 0.
     * @param value A Boolean value determining which byte is written. If the value is true, write 1; if the value is false, write 0.
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
     * @param value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeBoolean(value) {
        this.validateBuffer(1 /* SIZE_OF_BOOLEAN */);
        this._bytes[this.position++] = +value;
    }
    /**
     * Write a byte into the byte stream
     * The low 8 bits of the parameter are used. The high 24 bits are ignored.
     * @param value A 32-bit integer. The low 8 bits will be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个字节
     * 使用参数的低 8 位。忽略高 24 位
     * @param value 一个 32 位整数。低 8 位将被写入字节流
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeByte(value) {
        this.validateBuffer(1 /* SIZE_OF_INT8 */);
        this._bytes[this.position++] = value & 0xff;
    }
    /**
     * Write the byte sequence that includes length bytes in the specified byte array, bytes, (starting at the byte specified by offset, using a zero-based index), into the byte stream
     * If the length parameter is omitted, the default length value 0 is used and the entire buffer starting at offset is written. If the offset parameter is also omitted, the entire buffer is written
     * If the offset or length parameter is out of range, they are clamped to the beginning and end of the bytes array.
     * @param bytes ByteArray Object
     * @param offset A zero-based index specifying the position into the array to begin writing
     * @param length An unsigned integer specifying how far into the buffer to write
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将指定字节数组 bytes（起始偏移量为 offset，从零开始的索引）中包含 length 个字节的字节序列写入字节流
     * 如果省略 length 参数，则使用默认长度 0；该方法将从 offset 开始写入整个缓冲区。如果还省略了 offset 参数，则写入整个缓冲区
     * 如果 offset 或 length 超出范围，它们将被锁定到 bytes 数组的开头和结尾
     * @param bytes ByteArray 对象
     * @param offset 从 0 开始的索引，表示在数组中开始写入的位置
     * @param length 一个无符号整数，表示在缓冲区中的写入范围
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeBytes(bytes, offset = 0, length = 0) {
        let writeLength;
        if (offset < 0) {
            return;
        }
        if (length < 0) {
            return;
        }
        else if (length === 0) {
            writeLength = bytes.length - offset;
        }
        else {
            writeLength = Math.min(bytes.length - offset, length);
        }
        if (writeLength > 0) {
            this.validateBuffer(writeLength);
            this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
            this.position = this._position + writeLength;
        }
    }
    /**
     * Write an IEEE 754 double-precision (64 bit) floating point number into the byte stream
     * @param value Double-precision (64 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个 IEEE 754 双精度（64 位）浮点数
     * @param value 双精度（64 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeDouble(value) {
        this.validateBuffer(8 /* SIZE_OF_FLOAT64 */);
        this.data.setFloat64(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 8 /* SIZE_OF_FLOAT64 */;
    }
    /**
     * Write an IEEE 754 single-precision (32 bit) floating point number into the byte stream
     * @param value Single-precision (32 bit) floating point number
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个 IEEE 754 单精度（32 位）浮点数
     * @param value 单精度（32 位）浮点数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeFloat(value) {
        this.validateBuffer(4 /* SIZE_OF_FLOAT32 */);
        this.data.setFloat32(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_FLOAT32 */;
    }
    /**
     * Write a 32-bit signed integer into the byte stream
     * @param value An integer to be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个带符号的 32 位整数
     * @param value 要写入字节流的整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeInt(value) {
        this.validateBuffer(4 /* SIZE_OF_INT32 */);
        this.data.setInt32(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_INT32 */;
    }
    /**
     * Write a 16-bit integer into the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
     * @param value A 32-bit integer. Its low 16 bits will be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个 16 位整数。使用参数的低 16 位。忽略高 16 位
     * @param value 32 位整数，该整数的低 16 位将被写入字节流
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeShort(value) {
        this.validateBuffer(2 /* SIZE_OF_INT16 */);
        this.data.setInt16(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_INT16 */;
    }
    /**
     * Write a 32-bit unsigned integer into the byte stream
     * @param value An unsigned integer to be written into the byte stream
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个无符号的 32 位整数
     * @param value 要写入字节流的无符号整数
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeUnsignedInt(value) {
        this.validateBuffer(4 /* SIZE_OF_UINT32 */);
        this.data.setUint32(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_UINT32 */;
    }
    /**
     * Write a 16-bit unsigned integer into the byte stream
     * @param value An unsigned integer to be written into the byte stream
     * @version Egret 2.5
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 在字节流中写入一个无符号的 16 位整数
     * @param value 要写入字节流的无符号整数
     * @version Egret 2.5
     * @platform Web,Native
     * @language zh_CN
     */
    writeUnsignedShort(value) {
        this.validateBuffer(2 /* SIZE_OF_UINT16 */);
        this.data.setUint16(this._position, value, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_UINT16 */;
    }
    /**
     * Write a UTF-8 string into the byte stream. The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string
     * @param value Character string value to be written
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将 UTF-8 字符串写入字节流。先写入以字节表示的 UTF-8 字符串长度（作为 16 位整数），然后写入表示字符串字符的字节
     * @param value 要写入的字符串值
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeUTF(value) {
        let utf8bytes = this.encodeUTF8(value);
        let length = utf8bytes.length;
        this.validateBuffer(2 /* SIZE_OF_UINT16 */ + length);
        this.data.setUint16(this._position, length, this.$endian === 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_UINT16 */;
        this._writeUint8Array(utf8bytes, false);
    }
    /**
     * Write a UTF-8 string into the byte stream. Similar to the writeUTF() method, but the writeUTFBytes() method does not prefix the string with a 16-bit length word
     * @param value Character string value to be written
     * @version Egret 2.4
     * @platform Web,Native
     * @language en_US
     */
    /**
     * 将 UTF-8 字符串写入字节流。类似于 writeUTF() 方法，但 writeUTFBytes() 不使用 16 位长度的词为字符串添加前缀
     * @param value 要写入的字符串值
     * @version Egret 2.4
     * @platform Web,Native
     * @language zh_CN
     */
    writeUTFBytes(value) {
        this._writeUint8Array(this.encodeUTF8(value));
    }
    /**
     *
     * @returns
     * @version Egret 2.4
     * @platform Web,Native
     */
    toString() {
        return '[ByteArray] length:' + this.length + ', bytesAvailable:' + this.bytesAvailable;
    }
    /**
     * @private
     * 将 Uint8Array 写入字节流
     * @param bytes 要写入的Uint8Array
     * @param validateBuffer
     */
    _writeUint8Array(bytes, validateBuffer = true) {
        let pos = this._position;
        let npos = pos + bytes.length;
        if (validateBuffer) {
            this.validateBuffer(npos);
        }
        this.bytes.set(bytes, pos);
        this.position = npos;
    }
    /**
     * @param len
     * @returns
     * @version Egret 2.4
     * @platform Web,Native
     * @private
     */
    validate(len) {
        let bl = this._bytes.length;
        if (bl > 0 && this._position + len <= bl) {
            return true;
        }
        else {
            console.error(1025);
        }
    }
    /**********************/
    /*  PRIVATE METHODS   */
    /**********************/
    /**
     * @private
     * @param len
     * @param needReplace
     */
    validateBuffer(len) {
        this.write_position = len > this.write_position ? len : this.write_position;
        len += this._position;
        this._validateBuffer(len);
    }
    /**
     * @private
     * UTF-8 Encoding/Decoding
     */
    encodeUTF8(str) {
        let pos = 0;
        let codePoints = this.stringToCodePoints(str);
        let outputBytes = [];
        while (codePoints.length > pos) {
            let code_point = codePoints[pos++];
            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            }
            else {
                let count, offset;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                }
                else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                }
                else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
                }
                outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                while (count > 0) {
                    let temp = this.div(code_point, Math.pow(64, count - 1));
                    outputBytes.push(0x80 + (temp % 64));
                    count -= 1;
                }
            }
        }
        return new Uint8Array(outputBytes);
    }
    /**
     * @private
     *
     * @param data
     * @returns
     */
    decodeUTF8(data) {
        let fatal = false;
        let pos = 0;
        let result = '';
        let code_point;
        let utf8_code_point = 0;
        let utf8_bytes_needed = 0;
        let utf8_bytes_seen = 0;
        let utf8_lower_boundary = 0;
        while (data.length > pos) {
            let _byte = data[pos++];
            if (_byte === this.EOF_byte) {
                if (utf8_bytes_needed !== 0) {
                    code_point = this.decoderError(fatal);
                }
                else {
                    code_point = this.EOF_code_point;
                }
            }
            else {
                if (utf8_bytes_needed === 0) {
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    }
                    else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        }
                        else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        }
                        else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        }
                        else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                }
                else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                }
                else {
                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                    if (utf8_bytes_seen !== utf8_bytes_needed) {
                        code_point = null;
                    }
                    else {
                        let cp = utf8_code_point;
                        let lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        }
                        else {
                            code_point = this.decoderError(fatal, _byte);
                        }
                    }
                }
            }
            // Decode string
            if (code_point !== null && code_point !== this.EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0)
                        result += String.fromCharCode(code_point);
                }
                else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }
        return result;
    }
    /**
     * @private
     *
     * @param code_point
     */
    encoderError(code_point) {
        console.error(1026, code_point);
    }
    /**
     * @private
     *
     * @param fatal
     * @param opt_code_point
     * @returns
     */
    decoderError(fatal, opt_code_point) {
        if (fatal) {
            console.error(1027);
        }
        return opt_code_point || 0xFFFD;
    }
    /**
     * @private
     *
     * @param  a
     * @param min
     * @param max
     */
    inRange(a, min, max) {
        return min <= a && a <= max;
    }
    /**
     * @private
     *
     * @param n
     * @param d
     */
    div(n, d) {
        return Math.floor(n / d);
    }
    /**
     * @private
     *
     * @param string
     */
    stringToCodePoints(str) {
        /** @type {Array.<number>} */
        let cps = [];
        // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
        let i = 0, n = str.length;
        while (i < str.length) {
            let c = str.charCodeAt(i);
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            }
            else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            }
            else { // (inRange(c, 0xD800, 0xDBFF))
                if (i === n - 1) {
                    cps.push(0xFFFD);
                }
                else {
                    let d = str.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        let a = c & 0x3FF;
                        let b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    }
                    else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    }
}
exports.ByteArray = ByteArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnl0ZUFycmF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdHMvY2xpZW50L0J5dGVBcnJheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsc0ZBQXNGO0FBQ3RGLEVBQUU7QUFDRixpREFBaUQ7QUFDakQsd0JBQXdCO0FBQ3hCLHNFQUFzRTtBQUN0RSwrRUFBK0U7QUFDL0UsRUFBRTtBQUNGLHVFQUF1RTtBQUN2RSxzRUFBc0U7QUFDdEUsMEVBQTBFO0FBQzFFLDRFQUE0RTtBQUM1RSw2RUFBNkU7QUFDN0UsOENBQThDO0FBQzlDLDZFQUE2RTtBQUM3RSw4RUFBOEU7QUFDOUUsRUFBRTtBQUNGLCtFQUErRTtBQUMvRSxnRkFBZ0Y7QUFDaEYsMkVBQTJFO0FBQzNFLGdGQUFnRjtBQUNoRixnRkFBZ0Y7QUFDaEYsOEVBQThFO0FBQzlFLDZFQUE2RTtBQUM3RSx3RUFBd0U7QUFDeEUsZ0ZBQWdGO0FBQ2hGLHNEQUFzRDtBQUN0RCxFQUFFO0FBQ0Ysc0ZBQXNGOztBQUdsRjs7Ozs7O0dBTUc7QUFDSDs7Ozs7O0dBTUc7QUFDSCxNQUFhLE1BQU07O0FBQW5CLHdCQWlDQztBQWhDRzs7Ozs7O0dBTUc7QUFDSDs7Ozs7O0dBTUc7QUFDVyxvQkFBYSxHQUFXLGNBQWMsQ0FBQztBQUVyRDs7Ozs7O0dBTUc7QUFDSDs7Ozs7O0dBTUc7QUFDVyxpQkFBVSxHQUFXLFdBQVcsQ0FBQztBQTZCbkQ7Ozs7Ozs7R0FPRztBQUNIOzs7Ozs7O0dBT0c7QUFDSCxNQUFhLFNBQVM7SUFnRGxCOzs7T0FHRztJQUNILFlBQVksTUFBaUMsRUFBRSxhQUFhLEdBQUcsQ0FBQztRQWxEaEU7O1dBRUc7UUFDTyxrQkFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtRQXErQnJEOztXQUVHO1FBQ0ssYUFBUSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzlCOztXQUVHO1FBQ0ssbUJBQWMsR0FBVyxDQUFDLENBQUMsQ0FBQztRQTU3QmhDLElBQUks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