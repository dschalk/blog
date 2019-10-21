<script>
import {fade} from "svelte/transition"
let visible = true;


var k = 100000000;
var ltTest = x => y => new Filt(x => y < x);

var isOdd = function isOdd (x) {return new Filt(v => v % 2 === 1)};
var isOddF = function isOddF (x) {return new Filt(v => v % 2 === 1)};

function isOd_ (x) {return new Filt(v => v % 2 === 1)};
var lessThan = x => y => new Filt(x => y < x);

function tdReduce(base) {
  return function(reducingFunction) {
    return (accumulator, value) => {
      return reducingFunction(accumulator, func(v));
    }
  }
}

function tdMap(func) {
  return function(reducingFunction) {
    return (accumulator, v) => {
      return reducingFunction(accumulator, func(v));
    }
  }
}

function tdFilter(test) {
  return function(reducingFunction) {
    return (accumulator, v) => {
      return (test(v) ? reducingFunction(accumulator, v) : accumulator)
    };
  };
};

var ar = "cowgirl";
$: ar;

var cleanF = function cleanF (arthur = []) {
  ar = arthur;
  return ar.filter(
    a => a === 0 || a && typeof a !== "boolean" //
  ).reduce((a,b)=>a.concat(b),[])
};

$: cleanF;


function Monad ( AR = [] )  {
  var f_, p, run;
  var ar = AR.slice();
  var x = ar.pop();
  return run = (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" &&
      y.name !== "stop" ) {
      ar.push(y);
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
    };
    function f_ (func) {
      if (func === 'stop' || func === 'S') return ar;
      else if (func === 'finish' || func === 'F') return Object.freeze(ar);
      else if (typeof func !== "function") p = func;
      else if (x instanceof Promise) p = x.then(v => func(v));
      else p = func(x);
      return run(p);
    };

    return f_;
  })(x)
}

function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};

var compose = (...fns) =>
fns.reduceRight((prevFn, nextFn) =>
(...args) => nextFn(prevFn(...args)),
value => value
);

var add1 = function add1(v) { return v + 1; };
var sum = function sum(total,v) { return total + v; };
var cube = function cube(v) { return v**3; };

var size = 100;
$: size;

var ar74 = [...Array(size).keys()];
$: ar74;

var mapWRf = mapping(cube);
var mapRes = ar74.reduce(mapWRf(concat), []);
console.log("mapRes is", mapRes);

var isEven = x => x % 2 === 0;
var not = x => !x;
var isOdd2 = compose(not, isEven);

function curry(fn) {
   var arity = fn.length;
   return function $curry(...args) {
      if (args.length < arity) {
         return $curry.bind(null, ...args);
      }
      return fn.call(null, ...args);
   }  ;
}

var map = f => ar => ar.map(v=>f(v));
var filter = p => ar => ar.filter(p);
var reduce = f => ar => v => ar.reduce(f,v)
function apply(x, f) {return f(x);}
function concat(xs, val) {return xs.concat(val);}

function mapping(f) {
   return function(rf) {
      return (acc, val) => {
         return rf(acc, f(val));
      }
   }
}

var A_A = "H";
$: A_A;

var B_B = "s";
$: B_B;

var C_C = "G";
$: C_C;

var D_D = "I";
$: D_D;

var res1;
$: res1;

var res2;
$: res2;

var res3;
$: res3;

var res4;
$: res4;

var dotResult;
$: dotResult;

var test9;
$: test9;

var transducerResult;
$: transducerResult;

console.log("blah blah blah");

var ar7b = [...Array(1000)];

var test8 = k => ltTest(k).filt;;

var test9;
$: test9;

   res4 = ar74
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .map(x => Math.sqrt(x))

   console.log("res4 is", res4);

    dotResult = res4.map(v=>v*v)
   .map(v=>v+1000)
   // .filter(v => v < k - 3);
   // res4 = res4;
   console.log("dotResult is", dotResult);

var td1;
$: td1;

var td2;
$: td2;

var td3;
$: td3;

var xform;
$: xform;

var xform2;
$: xform2;


   td1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)(v=>(v-3)/Math.sqrt(v-3))('stop').pop()
   td2 = y => Monad([y])(v=>v*v)(v=>v+1000)(test8)('stop').pop()

   res1 = ar74.map(x => td1(x));
   res2 = res1.map(y => td2(y));
   res3 = ar74.map(z => td2(td1(z)));

   console.log("cleanF(res2) is", cleanF(res2));
   console.log("cleanF(res3) is", cleanF(res3));

   xform = compose(
      tdFilter(x=>x%2===1),
      tdMap(x => x**4),
      tdMap(x => x+3),
      tdMap(x => x-3),
      tdMap(x => Math.sqrt(x))
   )
   xform2 = compose(
      tdMap(x=>x*x),
      tdMap(x=>x+1000),
      tdFilter(x => x < k)
   );

   transducerResult = ar74.reduce(xform(xform2(concat)),[] );
   console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
   console.log("transducerResult is", transducerResult);
   console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")

   A_A = dotResult;
   B_B = cleanF(res2);
   C_C = cleanF(res3);
   D_D = transducerResult;

   console.log("A_A is", A_A)
   console.log("B_B is", B_B)
   console.log("C_C is", C_C)
   console.log("D_D is", D_D)


function go () {
  return [dotResult, res2, res3, transducerResult];
};

go();

console.log("res4 is", res4);

$: dotResult;
$: res2;
$: res3;
$: transducerResult;

function test888 (k) {
  var ar7 = [...Array(k).keys()];
  var t1 = x => Monad([x])(isOdd)(v=>v**4)(v=>v+3)(v=>(v-3)/Math.sqrt(v-3))('stop').pop()
  var t2 = y => Monad([y])(v=>v*v)(v=>v+1000)(test8)('stop').pop()

  res1 = ar7.map(x => td1(x));
  res2 = ar7.map(y => td2(y));
  res3 = ar7.map(z => td2(td1(z)));
 res4 = ar7
   .filter(v => (v % 2 === 1))
   .map(x => x**4)
   .map(x => x+3)
   .map(x => x-3)
   .map(x => Math.sqrt(x))

   console.log("res4 is", res4);

    dotResult = res4.map(v=>v*v)
   .map(v=>v+1000)
   .filter(v => v < k);
   res4 = res4;
   console.log("dotResult is", dotResult);

   transducerResult = ar7.reduce(xform(xform2(concat)),[] );

   return [dotResult, res2, res3, transducerResult]

}


</script>
<br><br><br>
{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
TRANSDUCER SIMULATION
 </div>
{/if}
<br><br>
<p> The tradition JavaScript method of composing functions using mainly map, filter, and reduce dot notation (eg. "array.map(func1).filter(func2).map(func3)") polutes memory with arrays that are used only to compute the next array in a chain. Moreover, each of the soon-to-be useless arrays must be traversed. When arrays are large and numerous functions are involved, this can be a performance bottleneck.</p>
<p> Transducers provide an ingenious solution to the problem. Any JavaScript developer who hasn't already done so would do well to get a good night's sleep, drink a big cup of coffee, and wrap his or her head around the transducer algorithm.</p>
<p> Another, more straightforward one-array-traversal solution is to use monads. This post shows the result of an array being traversed only one time and, with the help of a monad, undersoing multiple transformations by a collection of functions. The result is the same result obtained by the dot method and a standard transducer.</p>
<p> The following results were obtained using a 100-element array and eight functions:</p>
<div style = "color: #FFAAAA; font-size: 20px">The traditional dot multiple-traversals result:</div>
<br>
<div style = "color: #FFFFAA">{dotResult.join(" ")}</div>
<br>
<br>
<div style = "color: #FFAAAA; font-size: 20px">The monad two-traversals result:</div>
<br>
<div style = "color: #FFFFAA">{res2.join(" ")}</div>
<br>
<br>
<div style = "color: #FFAAAA; font-size: 20px">The monad one-traversal result:</div>
<br>
<div style = "color: #FFFFAA">{res3.join(" ")}</div>
<br>
<br>
<div style = "color: #FFAAAA; font-size: 20px">The standard transducer one-traversal result:</div>
<br>
  <div style = "color: #FFFFAA">{transducerResult.join(" ")}</div>
<br><br>

{A_A.join(" ")}
<br><br>
{B_B.join(" ")}
<br><br>
{C_C.join(" ")}
<br><br>
{D_D.join(" ")}
<br><br>
<input bind:value = {size}>
<br>
<h2>{size}</h2>
<br>
<div> ar74 is {ar74} </div>
{go().map(v => v.join(" "))}





..
