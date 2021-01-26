# encoding
提供unicode、utf-8、hex编码的支持。

# 用法
```
const encoding = require('encoding');
console.log(encoding.hex.parse('abcdef1234')); //[ 171, 205, 239, 18, 52 ]
console.log(encoding.hex.stringify([ 171, 205, 239, 18, 52 ])) //abcdef1234


console.log(encoding.utf8.getBytesArray('用法12345678')); //[ 231, 148, 168, 230, 179, 149, 49, 50, 51, 52, 53, 54, 55, 56 ]
console.log(encoding.utf8.getString([ 231, 148, 168, 230, 179, 149, 49, 50, 51, 52, 53, 54, 55, 56 ])) //用法12345678

```
