window.JST = {};
function render(template, data) { return JST[template](data); }
window.JST["main/index"] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul id=\'block_list\'></ul>';
}
return __p;
};
window.JST["main/index_block"] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<table>\n    <tr class=\'time\'>\n        <td class=\'label\'>Time</td><td>'+
((__t=( new Date(get('time')) ))==null?'':_.escape(__t))+
'</td>\n    </tr>\n    <tr class=\'trans\'>\n        <td class=\'label\'>Trans</td><td>'+
((__t=( get('n_tx') ))==null?'':_.escape(__t))+
'</td>\n    </tr>\n    <tr class=\'size\'>\n        <td class=\'label\'>Size</td><td>'+
((__t=( get('size') ))==null?'':_.escape(__t))+
'</td>\n    </tr>\n    <tr class=\'height\'>\n        <td class=\'label height\'>Height</td><td class=\'height\'>'+
((__t=( get('height') ))==null?'':_.escape(__t))+
'</td>\n    </tr>\n    <tr class=\'hash\'>\n        <td class=\'label hash\'>Hash</td><td class=\'hash\'>'+
((__t=( get('hash') ))==null?'':_.escape(__t))+
'</td>\n    </tr>\n</table>\n\n';
}
return __p;
};
