//Name: showAlgString.js
//Version: 1.5.2 (2020/05/09)
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
    var output_alg = buffer + '-' + getSticker(sticker_2nd)[1] + '-' + getSticker(sticker_3rd)[1] + ' ' + alg; //例： UFR RDF UFL
    
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

function getMoveType(move="D"){
  //入力したムーブについて回転面、回転軸、符号を出力する
  //出力は連想配列moveType=[moveString,moveAxis,moveSign] //例 ["U","UD",1] ["F","FB",3]
  var moveType = {};
  re_move = /[UDFBLRESMwxyzudfblr]{1,2}/;
  moveType.move = move;
  //回転面を取得
  moveType.moveString = move.match(re_move).toString(); // U
  moveType.isRotation = moveType.moveString.match(/[xyz]/) ? true : false;
  //回転軸を取得 : UD ,FB, RLのいずれか
  switch(moveType.moveString){
    case "U": case "D": case "Uw": case "Dw": case "y": case "E":
      moveType.moveAxis = "UD"; //UD軸
      break;
    case "F": case "B": case "Fw": case "Bw": case "z": case "S":
      moveType.moveAxis = "FB"; //FB軸
      break;
    case "R": case "L": case "Rw": case "Lw": case "x": case "M":
      moveType.moveAxis = "RL"; //RL軸
      break;
  }
  
  //符号を取得 : (U)1, (U2)2, U'=3
  switch(moveType.move.slice(-1)){//ムーブの符号を取得
    case "'":
      moveType.moveSign = 3;
      break;
    case "2":
      moveType.moveSign = 2;
      break;
    default:
      moveType.moveSign = 1;        
  }
  //Logger.log("moveType:",moveType.moveString, moveType.moveAxis, moveType.moveSign);
  return moveType;
}

function calcTotalSign(
  moveTypeArray = [ // sample "U' D U U D2" = "U D'"
  {"moveString":"U","moveAxis":"UD","moveSign":3},
  {"moveString":"D","moveAxis":"UD","moveSign":1}, 
  {"moveString":"U","moveAxis":"UD","moveSign":1},
  {"moveString":"U","moveAxis":"UD","moveSign":1},
  {"moveString":"D","moveAxis":"UD","moveSign":2}
  ]
){
  //同じ回転軸のムーブを受け取って、符号の総和を計算して出力する
  //入力は連想配列moveTypeの配列。[moveString,moveAxis,moveSign] //例 ["U","UD",1] ["F","FB",3]

  //ムーブの文字でソート
  moveTypeArray.sort(function(a,b){
    return a.moveString < b.moveString ? 1 : -1;
  });
  
  //符号の総和を計算する連想配列を定義
  var totalSign = {};
  
  //ムーブの文字ごとに符号を計算
  for (var i = 0, len= moveTypeArray.length; i < len; ++i) {
    var targetString = moveTypeArray[i].moveString;
    var targetSign   = moveTypeArray[i].moveSign;
    totalSign[targetString] = !totalSign[targetString] ? targetSign : (totalSign[targetString]+targetSign) % 4;
  }
  
  //中層回転は手数が削減される場合のみキャンセルする。M' R = Rw, Rw M' = Rw M'
  //未実装
  
  //計算結果をalg配列として返す[
  var totalSignOutput = [];
  Object.keys(totalSign).forEach(function(moveString){
    switch(this[moveString]){
      case 0: break;
      case 1: totalSignOutput.push(moveString);break;
      case 2: totalSignOutput.push(moveString+"2");break;
      case 3: totalSignOutput.push(moveString+"'");break;
    }    
  }, totalSign);
  
  
  
  //debug_output
  //SignOutput = totalSign.U + "\\n" + totalSign.D + "\\n" + totalSignOutput;
  //showOutputString(SignOutput); 
  return totalSignOutput;
}

function recur_cancel(alg="U D U U D R x x' R' F F' F M' Rw U R U M' Rw"){
  //入力した文字列に対して再帰的にキャンセル処理をする。
  alg_array = alg.split(" ");
  reset_flag = 0;
  
  var len = alg_array.length;
  
  //algが2手に満たない場合、キャンセルの必要がないので終了する
  if(len<2) return alg_array.join(" ");
    
  //すべてのムーブを順に走査する。
  for (var i = 0; i < len-1; ++i) {
    Logger.log("alg_array:",alg_array);
    Logger.log("target move, i = :",alg_array[i], i);

    // ムーブの情報を取得する。
    var targetMove = getMoveType(alg_array[i]);   //1つ目のムーブの情報を取得
    
    // 持ち替え記号はキャンセルしない
    if(targetMove.isRotation) continue;
    
    // 後続のムーブと回転軸が一致するかを確認する。
    for (var j = i+1; j < len; ++j) {
      //回転軸が異なるムーブが出現したらループを抜ける [i]～[j-1]までが連続している。
      //後続のすべてのムーブの回転軸が同じである場合にはループが自然に終わる。[i]～[len-1]までが連続している。
      //持ち替え記号はキャンセルに含まない
      if(getMoveType(alg_array[j]).moveAxis != targetMove.moveAxis || getMoveType(alg_array[j]).isRotation) break;
    }
    
    Logger.log("breakpoint:",i,j,alg_array.slice(i,j));
    
    //回転軸が一致するムーブがあるなら、処理を継続する。
    if(i != j-1) {
      var replaceLen = j - i;
      var targetArray = alg_array.slice(i,j).map(x => getMoveType(x));
            
      //先行するムーブ
      preArray = alg_array.slice(0,i);
      //置換した後のムーブ。空となる場合もある。
      replacedArray = calcTotalSign(targetArray);
      //後続するムーブ
      postArray = alg_array.slice(j);
      //キャンセルした部分を除いて、新しい配列を生成する
      alg_array = preArray.concat(replacedArray,postArray);
      
      //イテレータを増加あるいは初期化
      replaceLenAfter = replacedArray.length;
      Logger.log("replaceLen,replaceLenAfter",replaceLen, replaceLenAfter);
      i += replaceLenAfter -1;
      
      //配列の長さを再計算
      len = alg_array.length;
      
      //Logger.log("preArray",preArray);
      //Logger.log("replacedArray",replacedArray);
      //Logger.log("postArray",postArray);
      //Logger.log("output",alg_array);
      
    }
  }//for end

  //debug_output
  //DecompressedOutput = "Original, Decompressed :\\n"+alg+"\\n"+alg_array.join(" ");
  //showOutputString(DecompressedOutput); 
  return alg_array.join(" ");
}