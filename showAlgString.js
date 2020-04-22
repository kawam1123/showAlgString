//Name: showAlgString.js
//Version: 1.2 (2020/04/22)
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
  showAlgString(option=1);
}

function showAlgStringSummary(){
  //出力形式：ステッカー、手順
  showAlgString(option=2);
}

function showAlgStringMin(){
  //出力形式：ステッカー、手順
  showAlgString(option=3);
}

function showAlgString(option) {
//本体
//optionで出力形式を変える
//  1:レターペア、ステッカー、手順 例："みい UFR RDF UFL [U', R' D' R]"
//  2:ステッカー、手順 例："UFR RDF UFL [U', R' D' R]"
//  3:手順 例："[U', R' D' R]"
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet=spreadsheet.getActiveSheet();
  var target = sheet.getCurrentCell() //現在のセルを指定する
  var alg = target.getValue(); //アルゴリズムの文字列を取得する　例： [U', R' D' R]
  //var buffer = 'UFR' //バッファを指定する。とりあえず固定値。
  var buffer = sheet.getName().replace('Corners','').replace('Edges','').replace('corners','').replace('edges','').replace(' ',''); //シート名にバッファが書いてあると信じてシート名を取得、cornersやedgesは消去
  var sticker_2nd = sheet.getRange(1, target.getColumn()).getValue(); //例："み (RDF)"
  var sticker_3rd = sheet.getRange(target.getRow(), 1).getValue(); //例："い (UFL)"
  
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
  Browser.msgBox(output)   
}

//サブ関数：レターペアとステッカーに分解して配列を返す
function getSticker(sticker_raw){
  var sticker_string = sticker_raw.replace('(','').replace(')','').split(' ');
  return sticker_string
}