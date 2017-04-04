# unicode lookup table

provides data from http://unicode.org/Public/UNIDATA/UnicodeData.txt for [nodejs](http://nodejs.org).

[![Build Status](https://secure.travis-ci.org/dodo/node-unicodetable.png)](http://travis-ci.org/dodo/node-unicodetable)


## install

```bash
npm install unicode
```

## example

```bash
master//node-unicodetable » node
> require('unicode/category/So')["♥".charCodeAt(0)]
{ value: '2665',
  name: 'BLACK HEART SUIT',
  category: 'So',
  class: '0',
  bidirectional_category: 'ON',
  mapping: '',
  decimal_digit_value: '',
  digit_value: '',
  numeric_value: '',
  mirrored: 'N',
  unicode_name: '',
  comment: '',
  uppercase_mapping: '',
  lowercase_mapping: '',
  titlecase_mapping: '',
  symbol: '♥' }
```
