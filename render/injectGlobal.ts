/**
 * This Module Can use Node & Electron
 */
//#region 
// @ts-ignore
window.nodeRequire = require;
// @ts-ignore
delete window.require;
// @ts-ignore
delete window.exports;
// @ts-ignore
delete window.module;
//#endregion

let importExcel=require('../services/excel2html');
// @ts-ignore
window.jdi= {
    hello:hello,
    importExcel:importExcel
}

/**
 * 测试函数，此函数成功，说明注入成功
 */
function hello(){
console.log(importExcel);
    console.log('preload is ok.');
}