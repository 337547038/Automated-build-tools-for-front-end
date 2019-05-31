/**
 * Created by 337547038 css检查
 */
const fs = require('fs');
const stylelint = require("stylelint");
// https://github.com/stylelint/stylelint/blob/HEAD/docs/user-guide/node-api.md
module.exports = function () {
  const myConfig = {
    // https://stylelint.io/user-guide/rules/
    "rules": {
      "color-no-invalid-hex": true,// 无效的十六进制颜色
      "unit-no-unknown": true, // 未知单位
      "property-no-unknown": true, // 未知属性
      "declaration-block-no-duplicate-properties": true, // 重复属性
      "selector-pseudo-class-no-unknown": true, // 未知伪类选择器
      "selector-type-no-unknown": true,// 未知选择器
      "property-no-vendor-prefix": true, // 禁止属性的供应商前缀
      "length-zero-no-unit": true // 禁止零长度的单位（自动固定
    }
  };
  stylelint.lint({
    config: myConfig,
    files: "src/sass/*.scss",
    formatter: function (stylelintResults) {
    },
    syntax: "scss"
  }).then(function (data) {
    //console.log(data)
    // console.log(data.results[1].warnings)
    // 转换美化下输出
    if (data.errored) {
      data.results.forEach(item => {
        if (item.errored) {
          console.log('\x1B[33m%s\x1B[39m', item.source);
          item.warnings.forEach(w => {
            console.log(`[${w.line}:${w.column}] ${replaceText(w.text)}`)
          });
        }
      });
    } else {
      console.log('检验通过!')
    }
  });
};

// 将错误提示改为中文
function replaceText(text) {
  return text.replace('color-no-invalid-hex', '无效的十六进制颜色')
    .replace('unit-no-unknown', '未知单位')
    .replace('property-no-unknown', '未知属性')
    .replace('declaration-block-no-duplicate-properties', '重复属性')
    .replace('selector-pseudo-class-no-unknown', '未知伪类选择器')
    .replace('selector-type-no-unknown', '未知选择器')
    .replace('property-no-vendor-prefix', 'scss无需添加兼容前缀')
    .replace('length-zero-no-unit', '零长度不建议添加单位')
}
