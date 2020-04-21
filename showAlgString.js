function onOpen() {
    var ui = SpreadsheetApp.getUi();
    var menu = ui.createMenu('手順コピー');
    menu.addItem('実行', 'showAlgString');
    menu.addToUi();
  }
  
  //本体
  function showAlgString() {
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
      var output = letters+' '+output_alg; //例："みい UFR RDF UFL [U', R' D' R]"
    }
    Browser.msgBox(output)   
  }
  
  //サブ関数：レターペアとステッカーに分解して配列を返す
  function getSticker(sticker_raw){
    var sticker_string = sticker_raw.replace('(','').replace(')','').split(' ');
    return sticker_string
  }