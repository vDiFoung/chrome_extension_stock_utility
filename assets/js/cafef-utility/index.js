
let GetCompanyName = function(oc, sym){
    let link='';
    for (let i=0, length = oc.length; i<length; i++){
        if( oc[i].c.toLowerCase() === sym.toLowerCase()){
            var cName = oc[i].m;
            var san='hose';
            if(oc[i].san=='2') san='hastc';if(oc[i].san=='8') san='otc';if(oc[i].san=='9') san='upcom';
            if(cName.lastIndexOf('(')>0) cName = cName.substring(0, cName.lastIndexOf('('));
            link = `${cName} (${san.toUpperCase()})`;
            break;
        }
    }
    return link;
}

let trim = function(str){
    if (str){return str.replace(/^\s+|\s+$/g, '');}
    else{return '';}
};

let UnicodeToKoDau = function(input){
    let KoDauChars = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAAEEEEEEEEEEEDIIIOOOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYAADOOU';
    let uniChars = 'àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴÂĂĐÔƠƯ';
    var retVal = '';input = trim(input);var s = input.split('');
    var arr_KoDauChars = KoDauChars.split('');var pos;
    for (var i = 0; i < s.length; i++){
        pos = uniChars.indexOf(s[i]);
        if (pos >= 0) retVal+= arr_KoDauChars[pos];
        else retVal+= s[i];
    }
    return retVal;
}

let UnicodeToKoDauAndGach = function(input){
    var strChar = 'abcdefghiklmnopqrstxyzuvxw0123456789 ';input = trim(input);
    var str = input.replace("–", "");str = str.replace("  ", " ");str = UnicodeToKoDau(str.toLowerCase());
    var s = str.split('');var sReturn = "";
    for (var i = 0; i < s.length; i++){
        if (strChar.indexOf(s[i]) >-1){
            if (s[i] != ' ') sReturn+= s[i];
            else if (i > 0 && s[i-1] != ' ' && s[i-1] != '-') sReturn+= "-";
        }
    }
    return sReturn;
}
let GetCompanyInfoLink = function(oc, sym){
    if(sym == "VNINDEX") return '/Lich-su-giao-dich-Symbol-VNINDEX/Trang-1-0-tab-1.chn';
    if(sym == 'HNX-INDEX') return '/Lich-su-giao-dich-Symbol-HNX-INDEX/Trang-1-0-tab-1.chn';
    if(sym == 'UPCOM-INDEX')return '/Lich-su-giao-dich-Symbol-UPCOM-INDEX/Trang-1-0-tab-1.chn';
    var link='';
    for (i=0;i<oc.length;i++){
        if( oc[i].c.toLowerCase()==sym.toLowerCase()){
            var san='hose';
            if(oc[i].san=='2') san='hastc';if(oc[i].san=='8') san='otc';if(oc[i].san=='9') san='upcom';
            var cName = oc[i].m;
            if(cName.lastIndexOf('(')>0) cName = cName.substring(0, cName.lastIndexOf('('));
            cName = UnicodeToKoDauAndGach(cName);
            link= '/'+san+'/'+sym+'-'+cName+'.chn';
            break;
        }
    }
    return link;
}