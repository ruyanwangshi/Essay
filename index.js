import fs from 'fs';
import xlsx from 'xlsx'

const res = xlsx.readFile('./123.xlsx')
const sheetName = res.SheetNames[0];
const worksheet = res.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
const obj_map = {}
const list = []
// 遍历每一行的数据
for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  if(!obj_map[row[7]]) {
    obj_map[row[7]] = true
    list.push(row[7])
  }

}

console.log('最终结果', list.length)

// console.log('最终结果',Object.keys(res), res.Workbook,res.Sheets)