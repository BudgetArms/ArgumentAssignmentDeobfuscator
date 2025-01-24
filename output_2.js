var Array1, Array2, Function9, index1, Function5, index6, Function6, index7, index0, Function7;
function Function20() {
  Function20 = function () {};
}
function Function9() {}
function Function1(Array1) {
  var Array2 = 'CpXAiS:ax]IuPD#5;0kvs1HEQlV*2ZfoF%UJ)7KWLh_+|Rr(NbT,Y>B}<d@e~^yMq6g{9m.?nGc[!/8=tj3w"4&$zO';
  var Function9, index1, Function5, index6, Function6, index7, index0;
  Function9 = '' + (Array1 || '');
  index1 = Function9.length;
  Function5 = [];
  index6 = 0;
  Function6 = 0;
  index7 = -1;
  Function20(Function9, index1, Function5, index6, Function6, index7);
  console.log('Array2: ', Array2);
}

// now thing
Function20(Function9 = Function2() || {}, index1 = Function9.TextDecoder, Function5 = Function9.Uint8Array, index6 = Function9.Buffer, Function6 = Function9.String || String, index7 = Function9.Array || Array, index0 = function () {
  var Array1 = new index7(128),
    Array2,
    Function9;
  Array2 = Function6.fromCodePoint || Function6.fromCharCode;
  Function9 = [];
  Function20(Array2, Function9);
  return function (index1) {
    var Function5, index6, index7, index0;
    index6 = undefined;
    index7 = index1.length;
    Function9.length = 0;
    Function20(index6, index7, Function9.length);
    for (index0 = 0; index0 < index7;) {
      Function20(index6 = index1[index0++], index6 <= 127 ? Function5 = index6 : index6 <= 223 ? Function5 = (index6 & 31) << 6 | index1[index0++] & 63 : index6 <= 239 ? Function5 = (index6 & 15) << 12 | (index1[index0++] & 63) << 6 | index1[index0++] & 63 : Function6.fromCodePoint ? Function5 = (index6 & 7) << 18 | (index1[index0++] & 63) << 12 | (index1[index0++] & 63) << 6 | index1[index0++] & 63 : (Function5 = 63, index0 += 3), Function9.push(Array1[Function5] || (Array1[Function5] = Array2(Function5))));
    }
    return Function9.join("");
  };
}());
(function () {
  console.log("TESTING");
  Function1();
});