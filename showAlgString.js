//Name: showAlgString.js
//Version: 1.3 (2020/04/26)
//Author: kawam1123

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('手順コピー');
  menu.addItem('レターペア+ステッカー+手順', 'showAlgStringFull');
  menu.addItem('ステッカー+手順', 'showAlgStringSummary');
  menu.addItem('手順', 'showAlgStringMin');
  menu.addToUi();
}

function showAlgStringFull(){
//出力形式：レターペア、ステッカー、手順
showAlgStringsRange(option=1);
}

function showAlgStringSummary(){
//出力形式：ステッカー、手順
showAlgStringsRange(option=2);
}

function showAlgStringMin(){
//出力形式：ステッカー、手順
showAlgStringsRange(option=3);
}

function showAlgStringsRange(option){
//複数の選択された範囲について、文字列を取得し、メッセージを出す
var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var sheet=spreadsheet.getActiveSheet();
var targets = sheet.getActiveRangeList().getRanges(); //選択されたセルのリストを取得
console.log("処理開始");

//出力文字列を初期化する
outputString = "";

for (var target in targets) {
  //選択された複数の範囲についてループ処理する
  //複数の範囲がある場合、それぞれの出力結果の間には空行を挿入する
  console.log("次の範囲を処理する："+targets[target].getA1Notation());
  outputString　+= getAlgString(sheet,targets[target],option) + "\\n"
}

//画面上に出力する。あとはコピペで頑張ってくれ。
Browser.msgBox(outputString)  
}

function getAlgString(sheet, target, option) {
//範囲内で全てのセルについて処理をする
//optionで出力形式を変える
//  1:レターペア、ステッカー、手順 例："みい UFR RDF UFL [U', R' D' R]"
//  2:ステッカー、手順 例："UFR RDF UFL [U', R' D' R]"
//  3:手順 例："[U', R' D' R]"
//  targetはRangeである。Range内には複数の手順が含まれている場合がある。
//出力文字列を初期化する
outputString = "";
//Rangeの範囲内を繰り返し処理する
for(var row = 1; row <= target.getNumRows(); row++) {
  for (var column = 1; column <= target.getNumColumns(); column++) {
    targetCell = target.getCell(row, column); //各セルを特定する
    targetCellValue = targetCell.getValue(); //各セルの文字列を取得する
    console.log("処理対象："+targetCellValue+"\n");
    if(targetCellValue){//空白文字でないなら処理する
      console.log("個別セルの処理に入る");
      outputString += generateAlgString(sheet, targetCell, option) + '\\n'
    }
  }
}

return outputString  
}


function generateAlgString(sheet, targetCell, option){
//特定のセルtargetCell(Range)を与えると出力用の文字列を生成する

var alg = targetCell.getValue(); //アルゴリズムの文字列を取得する　例： [U', R' D' R]
//var buffer = 'UFR' //バッファを指定する。とりあえず固定値。
var buffer = sheet.getName().replace('Corners','').replace('Edges','').replace('corners','').replace('edges','').replace(' ',''); //シート名にバッファが書いてあると信じてシート名を取得、cornersやedgesは消去
var sticker_2nd = sheet.getRange(1, targetCell.getColumn()).getValue(); //例："み (RDF)"
var sticker_3rd = sheet.getRange(targetCell.getRow(), 1).getValue(); //例："い (UFL)"

if(!getSticker(sticker_2nd)[1]){//もしレターペアのない手順表ならばならば
  var output = buffer + ' ' + getSticker(sticker_2nd)[0] + ' ' + getSticker(sticker_3rd)[0] + ' ' + alg; //例： UFR RDF UFL
}else{//もしレターペアつきの手順表ならば
  var letters = getSticker(sticker_2nd)[0]+getSticker(sticker_3rd)[0]; //レターペアのみ取り出す　例："みい"
  var output_alg = buffer + ' ' + getSticker(sticker_2nd)[1] + ' ' + getSticker(sticker_3rd)[1] + ' ' + alg; //例： UFR RDF UFL
  
  //出力形式で分岐
  if(option==1) var output = letters+' '+output_alg; //例："みい UFR RDF UFL [U', R' D' R]"
  if(option==2) var output = output_alg; //例："UFR RDF UFL [U', R' D' R]"
  if(option==3) var output = alg; //例："[U', R' D' R]"
}

console.log("出力文字列："+output+"\\n");
return output;
}

//サブ関数：レターペアとステッカーに分解して配列を返す
function getSticker(sticker_raw){
var sticker_string = sticker_raw.replace('(','').replace(')','').split(' ');
return sticker_string
}