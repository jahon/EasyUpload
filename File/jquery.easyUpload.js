/*!
* 基于HTML5的图片上传
* Version：0.1.0
* Date：2013/07/12
* Author: Jahon
*/

; (function (window, $) {

    var easyUpload = function (el, options) {
        "use strict";
        var that = this, i;
        that.target = typeof el == 'object' ? el : $(el);
        that.options = {
            form: $('form')[0],
            url: '',    //post url,
            type: 'binary',/*binary|base64|form*/
            //中断上传
            onAbort: null,
            onError: null,
            onLoadStart: null,
            onLoad: null,
            onLoadEnd: null,
            //进度显示
            onProgress: null,
            onPreview: null
        }
        for (i in options) that.options[i] = options[i];

        window.URL = window.URL || window.webkitURL;
        XMLHttpRequest.prototype.sendAsBinary = function (datastr) {
            function byteValue(x) {
                return x.charCodeAt(0) & 0xff;
            }
            var ords = Array.prototype.map.call(datastr, byteValue);
            var ui8a = new Uint8Array(ords);
            //发送二进制
            this.send(ui8a);
        }
    }

    easyUpload.prototype = {
        /* Public methods*/
        preview: function () {
            if (this.options.onPreview) this.options.onPreview(this._temp)
        },
        _temp: [],
        //开始上传文件
        upload: function () {
            var that = this, files = that._getFiles(that.target.get(0).files);
            that._sendFiles();
            return files;
        },
        _getFiles: function (files) {
            this._temp = [];
            if (!files) {
                alert('没选择文件。。');
            } else {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var imageType = /image.*/;

                    if (!file.type.match(imageType)) {
                        alert('选择格式不正确。')
                        continue;
                    }
                    console.log(window.URL);
                    var src = window.URL.createObjectURL(file);
                    window.URL.revokeObjectURL(this.src);
                    file.src = src;

                    this._temp.push(file);
                }
                this.preview();
            }
            return this._temp;
        },
        //执行上传
        _sendFiles: function () {
            for (var i = 0; i < this._temp.length; i++) this._fileUpload('', this._temp[i]);
        },
        _fileUpload: function (img, file) {
            var that = this,
                xhr = new XMLHttpRequest(),
                reader = new FileReader(),
                formData = new FormData();
            that.xhr = xhr;
            xhr.open("POST", that.options.url + (that.options.url.indexOf('?') < 0 ? '?' : '&') + 's-params=' + that.options.type, true);
            formData.append(file.name, file);

            //捕捉事件
            reader.onerror = function (evt) {
                console.log(evt);
                console.log('error');
                switch (evt.target.error.code) {
                    case evt.target.error.NOT_FOUND_ERR:
                        alert('File Not Found!');
                        break;
                    case evt.target.error.NOT_READABLE_ERR:
                        alert('File is not readable');
                        break;
                    case evt.target.error.ABORT_ERR:
                        break; // noop
                    default:
                        alert('An error occurred reading this file.');
                };
                if (that.options.onError) that.options.onError.call(that);
            };
            reader.onprogress = function (evt) {
                if (evt.lengthComputable) {
                    var percentLoaded = Math.round((evt.loaded * 100) / evt.total);
                    if (that.options.onProgress) that.options.onProgress(that, percentLoaded);
                }
            };
            reader.onabort = function (evt) {
                console.log('abort');
                reader.abort();
                if (that.options.onAbort) that.options.onAbort.call(that);
            };
            reader.onloadstart = function (evt) {
                console.log('loadStart');
                if (that.options.onLoadStart) that.options.onLoadStart.call(that);
            };
            reader.onload = function (evt) {
                xhr.sendAsBinary(evt.target.result);
                if (that.options.onLoad) that.options.onLoad.call(that);
            };
            reader.onloadend = function (evt) {
                console.log('loadEnd---------');
                if (that.options.onLoadEnd) that.options.onLoadEnd.call(that);
            };
            switch (that.options.type) {
                case 'form': xhr.send(formData); break;
                case 'base64': reader.readAsDataURL(file); break;
                case 'binary': reader.readAsBinaryString(file); break;
                default: reader.readAsText(file); break;
            }
            return that;
        }
    }
    if (typeof exports !== 'undefined') exports.easyUpload = easyUpload;
    window.easyUpload = easyUpload;
})(window, jQuery);
