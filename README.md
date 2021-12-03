# word-translate README

### 使用方法
选中需要提取的国际化文案，在右键菜单中选中’提取国际化文案‘的选项

### 默认配置
```json
"i18n-word-extract.i18nMethod": {
  "type": "string",
  "default": "intl.formatMessage({ id: '%s', defaultMessage: '%ss' })",
  "description": "国际化方法"
},
"i18n-word-extract.fileName": {
  "type": "string",
  "default": "",
  "description": "生成的国际化文件名(为空的时候取当前文件名)"
},
"i18n-word-extract.localesPath": {
  "type": "string",
  "default": "src/locales/zh-CN",
  "description": "国际化文件目录"
},
"i18n-word-extract.quotationMarkReplace": {
  "type": "boolean",
  "default": true,
  "description": "是否使用大括号替换选中文字的引号"
}
```