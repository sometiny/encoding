(function() {
	var _SPEC = {};
	_SPEC.S1 = "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM-_.!~*'()"; /*for URIComponent*/
	_SPEC.S2 = "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM-_.!~*'();/?:@&=+$,#"; /*for URI*/
	var hex_map2num = {'0' : 0, '1' : 1, '2' : 2, '3' : 3, '4' : 4, '5' : 5, '6' : 6, '7' : 7, '8' : 8, '9' : 9, 'a' : 10, 'b' : 11, 'c' : 12, 'd' : 13, 'e' : 14, 'f' : 15 };
	var hex_map2char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	//unicode to utf8
	var utoutf8 = function(u) {
		var a, b, c, d;
		if (u <= 0x7f) return u;
		else if (u <= 0x07FF) {
			a = 0xc0 | (u >> 6);
			b = 0x80 | (u & 0x3f);
			return (a << 8) | b;
		} else if (u <= 0xFFFF) {
			a = 0xe0 | (u >> 12);
			b = 0x80 | ((u >> 6) & 0x3f);
			c = 0x80 | (u & 0x3f);
			return (a << 16) | (b << 8) | c;
		} else if (u <= 0x10FFFF) {
			a = 0xf0 | (u >> 18);
			b = 0x80 | ((u >> 12) & 0x3f);
			c = 0x80 | ((u >> 6) & 0x3f);
			d = 0x80 | (u & 0x3f);
			var ret = (a << 24) | (b << 16) | (c << 8) | d;
			if (ret < 0) ret += 0x100000000;
			return ret;
		} else return 0;
	};

	//utf8 to unicode
	var utf8tou = function(u) {
		var a, b, c, d;
		if (u <= 0x7f) return u;
		else if (u <= 0xdfbf) {
			a = (u >> 8) & 0x1f;
			b = u & 0x3f;
			return (a << 6) | b;
		} else if (u <= 0xefbfbf) {
			a = (u >> 16) & 0xf;
			b = (u >> 8) & 0x3f;
			c = u & 0x3f;
			return (a << 12) | (b << 6) | c;
		} else if (u <= 0xf48fbfbf) {
			a = (u >>> 24) & 0x7;
			b = (u >> 16) & 0x3f;
			c = (u >> 8) & 0x3f;
			d = u & 0x3f;
			return (a << 18) | (b << 12) | (c << 6) | d;
		} else return 0;
	};
	var bytestoword = function(u, i) {
		var c = u[i],
			ret = [1, c];
		if (c <= 0x7f) ret[1] = c;
		else if (c <= 0xDF) {
			ret[1] = (c << 8) | u[i + 1];
			ret[0] = 2;
		} else if (c <= 0xEF) {
			ret[1] = (c << 16) | (u[i + 1] << 8) | u[i + 2];
			ret[0] = 3;
		} else if (c <= 0xF7) {
			ret[1] = (c << 24) | (u[i + 1] << 16) | (u[i + 2] << 8) | u[i + 3];
			ret[0] = 4;
		}
		return ret;
	};
	var $enc = {};
	$enc.encodeURIComponent = function(string, enc) {
		return $enc.encode(string, enc, "S1");
	};
	$enc.encodeURI = function(string, enc) {
		return $enc.encode(string, enc, "S2");
	};
	$enc.decode = function(string, enc) {
		enc = (enc || "utf-8").toUpperCase();
		var $encoding = $enc[enc == "UTF-8" ? "utf8" : "gbk"];
		var i = 0,
			c, ret = [],
			_len = string.length;
		while (i < _len) {
			c = string.substr(i, 1);
			if (c == "%" && /^%([0-9a-z]{2})$/i.test(string.substr(i, 3))) {
				ret.push(parseInt("0x" + string.substr(i + 1, 2)));
				i += 2;
			} else {
				ret.push(string.charCodeAt(i));
			}
			i++;
		}
		return $encoding.getString(ret);
	};
	$enc.encode = function(string, enc, t) {
		enc = (enc || "utf-8").toUpperCase();
		t = (t || "S1").toUpperCase();
		var ret = "",
			i = 0,
			c, chr, bytes = $enc[enc == "UTF-8" ? "utf8" : "gbk"].getWordArray(string),
			_len = bytes.length;
		while (i < _len) {
			c = bytes[i++];
			if (c <= 0x7f) {
				chr = String.fromCharCode(c);
				if (_SPEC[t].indexOf(chr) >= 0) ret += chr;
				else ret += "%" + $enc.hex.stringify([c]);
			} else {
				var hex = c.toString(16);
				if (hex.length % 2 != 0) hex = "0" + hex;
				ret += hex.replace(/([0-9a-z]{2})/ig, "%$1");
			}
		}
		return ret;
	};
	$enc.decodeURI = $enc.decodeURIComponent = $enc.decode;
	$enc.hex = $enc.hex || (function() {
		var $hex = {};
		$hex.parse = function(src) {
			if (src.length % 2 != 0 || /[^0-9a-z]/i.test(src)) {
				throw new Exception(0xb0a2, "encoding.hex.parse", "invalid input src.");
			}
			var i = 0,
				ret = [],
				_len = src.length, l, h;
			while (i < _len - 1) {
				h = src.charAt(i);
				l = src.charAt(i + 1);
				ret.push((hex_map2num[h] << 4) | hex_map2num[l]);
				i += 2;
			}
			return ret;
		};
		$hex.stringify = function(bytes) {
			var ret = [],
				c, v, i = 0,
				_len = bytes.length;
			while (i < _len) {
				v = bytes[i++];
				if (v > 255) {
					throw new Exception(0xb0a3, "encoding.hex.stringify", "invalid input array, item value is bigger than 255.");
				}
				ret.push(hex_map2char[(v >> 4) & 0xf]);
				ret.push(hex_map2char[v & 0xf]);
			}
			return ret.join('');
		};
		return $hex;
	})();
	$enc.utf8 = $enc.utf8 || (function() {
		var $utf8 = {};
		$utf8.getWordArray = function(u) {
			if (u.length <= 0) return [];
			var i = 0,
				c, ret = [];
			while (i < u.length) {
				c = u.charCodeAt(i);
				if (c < 0x7f) ret.push(c);
				else {
					ret.push(utoutf8(c));
				}
				i++;
			}
			return ret;
		};
		$utf8.bytesToWords = function(u) {
			if (u.length <= 0) return [];
			var i = 0,
				c, ret = [];
			while (i < u.length) {
				var word = bytestoword(u, i);
				ret.push(word[1]);
				i += word[0];
			}
			return ret;
		};
		$utf8.getByteArray = function(u) {
			var _len = u.length;
			if (_len <= 0) return [];
			var i = 0,
				c, ret = [];
			while (i < _len) {
				c = u.charCodeAt(i);
				if (c < 0x7f) ret.push(c);
				else {
					var word = utoutf8(c);
					if (word > 0xffffff) {
						ret.push(u >>> 24, (u >> 16) & 0xff, (u >> 8) & 0xff, u & 0xff);
					} else if (word > 0xffff) {
						ret.push(word >> 16, (word >> 8) & 0xff, word & 0xff);
					} else if (word > 0xff) {
						ret.push(word >> 8, word & 0xff);
					}
				}
				i++;
			}
			return ret;
		};
		$utf8.toString = function(u) {
			var _len = u.length;
			if (_len <= 0) return "";
			var i = 0,
				c, ret = "";
			while (i < _len) {
				if (u[i] < 0x7f) ret += String.fromCharCode(u[i]);
				else {
					ret += String.fromCharCode(utf8tou(u[i]));
				}
				i++;
			}
			return ret;
		};
		$utf8.getString = function(u) {
			var _len = u.length;
			if (_len <= 0) return [];
			var i = 0,
				c, ret = "";
			while (i < _len) {
				var word = bytestoword(u, i);
				ret += String.fromCharCode(utf8tou(word[1]));
				i += word[0];
			}
			return ret;
		};
		return $utf8;
	})();
	$enc.unicode = $enc.unicode || (function() {
		var $unicode = {};
		$unicode.getWordArray = function(u) {
			var _len = u.length;
			if (_len <= 0) return [];
			var i = 0,
				c, ret = [];
			while (i < _len) {
				ret.push(u.charCodeAt(i++));
			}
			return ret;
		};
		$unicode.getByteArray = function(u) {
			var _len = u.length;
			if (_len <= 0) return [];
			var i = 0,
				c, ret = [];
			while (i < _len) {
				c = u.charCodeAt(i++);
				ret.push(c & 0xff);
				ret.push((c >> 8) & 0xff); /*Little-Endian*/
			}
			return ret;
		};
		$unicode.bytesToWords = function(u) {
			var _len = u.length;
			if (_len <= 0) return [];
			var i = 0,
				c, ret = [];
			while (i < _len - 1) {
				ret.push((u[i + 1] << 8) | u[i]); /*Little-Endian*/
				i += 2;
			}
			return ret;
		};
		$unicode.toString = function(u) {
			var _len = u.length;
			if (_len <= 0) return "";
			var i = 0,
				c, ret = "";
			while (i < _len) {
				ret += String.fromCharCode(u[i++]);
			}
			return ret;
		};
		$unicode.getString = function(u) {
			var _len = u.length;
			if (_len <= 0) return "";
			var i = 0,
				c, ret = "";
			while (i < _len - 1) {
				ret += String.fromCharCode((u[i + 1] << 8) | u[i]); /*Little-Endian*/
				i += 2;
			}
			return ret;
		};
		return $unicode;
	})();

	module.exports = $enc;
})();