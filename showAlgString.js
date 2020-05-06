//Name: showAlgString.js
//Version: 1.5 (2020/05/06)
//Author: kawam1123

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('手順コピー');
  menu.addItem('レターペア+ステッカー+手順', 'showAlgStringFull');
  menu.addItem('ステッカー+手順', 'showAlgStringSummary');
  menu.addItem('手順', 'showAlgStringMin');
  menu.addSeparator();
  menu.addItem('レターペア+ステッカー+手順+展開', 'showAlgStringFullwithDecom');
  menu.addItem('ステッカー+手順+展開', 'showAlgStringSummarywithDecom');
  menu.addItem('手順+展開', 'showAlgStringMinwithDecom');
  menu.addItem('展開', 'showAlgStringMinwithDecomOnly');
  
    menu.addToUi();
  }

function showAlgStringFull(){
  //出力形式：レターペア、ステッカー、手順
  showOutputString(showAlgStringsRange(format=1));
}

function showAlgStringSummary(){
  //出力形式：ステッカー、手順
  showOutputString(showAlgStringsRange(format=2));
}

function showAlgStringMin(){
  //出力形式：ステッカー、手順
  showOutputString(showAlgStringsRange(format=3));
}

function showAlgStringFullwithDecom(){
  //出力形式：レターペア、ステッカー、手順、展開
  showOutputString(showAlgStringsRange(format=1,decompress=true));
}

function showAlgStringSummarywithDecom(){
  //出力形式：ステッカー、手順、展開
  showOutputString(showAlgStringsRange(format=2,decompress=true));
}

function showAlgStringMinwithDecom(){
  //出力形式：手順、展開
  showOutputString(showAlgStringsRange(format=3,decompress=true));
}

function showAlgStringMinwithDecomOnly(){
  //出力形式：展開
  showOutputString(showAlgStringsRange(format=3,decompress=false,decomonly=true));
}

function showAlgStringsRange(format=1,decompress=false,decomonly=false){
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
    outputString　+= getAlgString(sheet,targets[target],format,decompress,decomonly) + "\\n"
  }
  
  return outputString;
}

function getAlgString(sheet, target, format, decompress=false, decomonly=false) {
//範囲内で全てのセルについて処理をする
//formatで出力形式を変える
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
        outputString += generateAlgString(sheet, targetCell, format, decompress, decomonly) + '\\n'
      }
    }
  }
 
  return outputString  
}


function generateAlgString(sheet, targetCell, format, decompress=false, decomonly){
//特定のセルtargetCell(Range)を与えると出力用の文字列を生成する

  var alg = targetCell.getValue(); //アルゴリズムの文字列を取得する　例： [U', R' D' R]
  
  //空白セルなら処理しない
  if(alg==""){
    return "";
  }
  
  if(decomonly){//展開のみオプションが有効であるならば、展開のみ出力
    output = showAlgDecompressionSimple(alg);
    console.log("出力文字列(decomonly)："+output+"\n");
    return output;
  }
  
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
    if(format==1) var output = letters+' '+output_alg; //例："みい UFR RDF UFL [U', R' D' R]"
    if(format==2) var output = output_alg; //例："UFR RDF UFL [U', R' D' R]"
    if(format==3) var output = alg; //例："[U', R' D' R]"
  }
  
  if(decompress){ //コミューテータ表記の展開オプションが有効であるならば
    output += " " + showAlgDecompressionSimple(alg);
  }
  
    
  console.log("出力文字列："+output+"\n");
  return output;
}

//サブ関数：レターペアとステッカーに分解して配列を返す
function getSticker(sticker_raw){
  var sticker_string = sticker_raw.replace('(','').replace(')','').split(' ');
  return sticker_string
}

function showOutputString(outputString){
  //画面上に出力する。あとはコピペで頑張ってくれ。
  Browser.msgBox(outputString)   
}

function showAlgDecompressionSimple(inputString = "[U D: [D' R D R', F2]]"){
  if(inputString.match(/\:/)){ //セットアップあり
    str = inputString.replace(/(\[|\]|\n)/g,"").split(": ");//カッコと改行を削除
    Logger.log("[str[0], str[1]]= ",str[0],"/",str[1]);
    var decom = [str[0], decompressComm(str[1]), reverseAlg(str[0])];
    output = decom.join(" ");
    Logger.log("decom: ",decom);
  }else if(inputString.match(/\,/)){ //セットアップなし
    str = inputString.replace(/(\[|\]|\n)/g,"");
    output = decompressComm(str);
  }else{ //特殊手順
    output = inputString.replace(/(\[|\]|\n)/g,"");
  }
  decom_output = recur_cancel(output);//キャンセル処理
  Logger.log("decom_output: ", decom_output);
  //showOutputString(output); 
  return decom_output;
}

function reverseAlg(alg){
//手順を逆手順に変換する
  reversed = alg.split(' ').reverse();
  for (var i = 0, len = reversed.length; i < len; ++i) {
    reversed[i] = reverseMove(reversed[i]);
  }
  result = reversed.join(" ");
  return result;
  //Logger.log([input,result]);
}
    
function reverseMove(move){
    //単一ムーブを逆手順に変換する
    //R -> R'
    //U2 -> U2
    //D' -> D
    lastLetter = move.slice(-1);
    if(lastLetter == "'"){
      reversed_string = move.replace("'","");
    }else if(lastLetter == "2"){
      reversed_string = move; //do nothing
    }else{
      reversed_string = move + "'";
    }
    return reversed_string;
}

function decompressComm(alg="D' R D R', F2"){
  //「R U R', D」のような文字列を期待する
  comm_arr=alg.split(", ");
  comm_arr.push(reverseAlg(comm_arr[0]));
  comm_arr.push(reverseAlg(comm_arr[1]));
  comm_output=comm_arr.join(" ");
  Logger.log("[original_move,comm_output]=",alg,"/",comm_output);
  return comm_output;
  
}

function recur_cancel(alg="U D D' D2 U U' D R F Dw Dw' F F F"){
  //入力した文字列に対して再帰的にキャンセル処理をする。
  alg_array = alg.split(" ");
  re_move = /[UDFBLRwxyzudfblr]{1,2}/;
  reset_flag = 0;
  
  //すべてのムーブを順に走査する。
  for (var i = 0, len = alg_array.length; i < len-1; ++i) {
    Logger.log("alg_array:",alg_array);
    Logger.log("target move, i = :",alg_array[i], i);
    var moveType1st = alg_array[i].match(re_move).toString(); //ムーブの回転面を取得
    var moveType2nd = alg_array[i+1].match(re_move).toString(); //ムーブの回転面を取得
    Logger.log("1st/2nd =", moveType1st, "/", moveType2nd);
    if (moveType1st==moveType2nd){//後のムーブの回転面が一致するならば
      Logger.log("match! : ", moveType1st);
      
      switch(alg_array[i].slice(-1)){//ムーブの符号を取得
        case "'":
          moveSign = 3;
          break;
        case "2":
          moveSign = 2;
          break;
        default:
          moveSign = 1;        
      }
      
      switch(alg_array[i+1].slice(-1)){
        case "'":
          moveSign += 3;
          break;
        case "2":
          moveSign += 2;
          break;
        default:
          moveSign += 1;
      }
      
      //符号を計算する
      Logger.log("sign:",moveSign);
      switch(moveSign % 4){
        case 1:
          alg_array[i] = moveType1st; // U
          alg_array.splice(i+1,1);//i+1を削除
          i-=1;//配列のイテレータを1つ戻す
          break;
        case 2:
          alg_array[i] = moveType1st + "2" ; // U2
          alg_array.splice(i+1,1);//i+1を削除
          i-=1;//配列のイテレータを1つ戻す
          break;
        case 3:
          alg_array[i] = moveType1st + "'" ; // U'
          alg_array.splice(i+1,1);//i+1を削除
          i-=1;//配列のイテレータを1つ戻す
          len = alg_array.length;
          break;
        case 0:
          alg_array.splice(i,2);//2つとも削除
          i-=1;//配列のイテレータを2つ戻す
          break;
        default:
      }
    
    
    len = alg_array.length;//配列の長さを再計算
    reset_flag = 1;//リセットフラグを立てる
    }//if end
    
    //最後に達したとき、リセットフラグが立っているならば、最初から配列を走査する
    if(i==len-2 && reset_flag==1) {
      Logger.log("reset!");
      i=0;
      reset_flag=0;
    }
    
  }//for end
  //DecompressedOutput = "Original, Decompressed :\\n"+alg+"\\n"+alg_array.join(" ");
  //showOutputString(DecompressedOutput); 
  return alg_array.join(" ");
}