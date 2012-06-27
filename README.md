# unicode lookup table

loads http://unicode.org/Public/UNIDATA/UnicodeData.txt into [nodejs](http://nodejs.org).

## install

```bash
# debian
sudo apt-get install unicode-data # optional
# gentoo
sudo emerge unicode-data # optional

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