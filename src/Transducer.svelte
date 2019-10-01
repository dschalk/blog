
<script>


import {fade} from "svelte/transition"
let visible = true;


function Monad (z) {
  var x = z;
  var stop = "stop";
  var foo = function foo (func) {
    if (func.name === "stop") return x
    else {
      x = func(x);
      return foo;
    }
  };
  return foo;
}

var Comp = function Comp ( AR = [] )  {
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
      y.name !== "f_" && y.name !== "stop" ) {
      ar.push(y);
      diffRender()
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
      diffRender()
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
function ints (n) {return [...Array(n)]}
function isOdd (x) {return new Filt(v => v % 2 === 1)};A

var lessThan = x => y => new Filt(x => y < x);
var ltTest = lessThan();

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
      return test(v) ?
       reducingFunction(accumulator, v) : accumulator;
    };
  };
};

function cleanF (ar) {
  return ar.filter(
    a => a === 0 || a && typeof a !== "boolean" //
  ).reduce((a,b)=>a.concat(b),[])
};

function Fux (p) {this.p = p; this.fux = function fux (x) {return p(x)}};

  var quadF = a => b => c => {
      let ar = [];
      let d = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      let e = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
      if (d === d) {
          ar.push(`${a}*x*x + ${b}*x + ${c} = 0 has the following solutions:`);
          ar.push(`x = ${d} and x = ${e}`);
      }
      else {
          ar.push(`${a}*x*x + ${b}*x + ${c} = 0 has no solution`);
          ar.push('');
      }
      return ar;
  }

function* integers() {
  let i = 0;
    while (true) {
    yield i++;
  }
}

function Filt (p) {this.p = p; this.filt = function filt (x) {return p(x)}};
function filtP (p) {return new Filt(p)};

var filtOdd = filtP(x=>x%2 === 1);
var filtEven = filtP(x=>x%2 === 0);
var less_than = function less_than(x) {return new Filt(v=>v<x)};

function add1(v) { return v + 1; };V
function sum(total,v) { return total + v; };
function cube(v) { return v**3; };
</script>

{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
TRANSDUCER SIMULATION
 </div>
{/if}
<h2>Let's blow this pop stand</h2>
