
  <script>  
      import {fade} from "svelte/transition"
        var j = 3;
        $: j;


                function wait(ms) {
                  return new Promise(r => setTimeout(r, ms));
                }

                  async function pause (x) {
                    await wait(1000)
                    return x;
                  }

                  var pauseP = t => async x => {
                    await wait(t*1000)
                    return x;
                  }

                  async function pauseM (x) {
                    await wait(600)
                    return ret(x);
                  }

                  async function pauseX (x) {
                    await wait(x);
                  }

                  async function squareP (x) {
                    await wait(300)
                    return x*x;
                  }

                  var divPinverse = a => async b => {
                    await wait (300)
                    return a/b;
                  }

                  var divP = a => async b => {
                    await wait (300)
                    return b/a;
                  }

                  var doubleP = async a => {
                    await wait (300)
                    return a+a;
                  }

                  var toInt = a => pareseInt(a, 10);

                  var addP_toInt = x => async y => {
                    await wait(300)
                    return toInt(x) + toInt(y);
                  }

                  var addP = x => async y => {
                    await wait(900)
                    return parseInt(x,10) + parseInt(y,10);
                  }

                  var multP = x => async y => {
                    await wait(300)
                    return x * y;
                  }

                  var powP = x => async y => {
                    await wait(300)
                    return y**x;
                  }

                  async function cubeP (x) {
                    await wait(300)
                    return x*x*x;
                  }

                  async function idP (x) {
                    await wait(900)
                    return x;
                  }
                  async function sqrtP (x) {
                    await wait(900)
                    return x**(1/2)
                  }

                  var _conveNt_ = a => b => parseFloat(b,a);
                  var toFloat = _conveNt_ (10);

                  var cube = x => x**3;
                  var pow = p => x => x**p;
                  var square = x => x*x;
                  var add = x => y => parseInt(x) + parseInt(y);
                  var sqrt = x => x**(1/2);
                  var root = r => x => x(1/r);
                  var mult = a => b => a*b;
                  var div = d => x => x/d;

                var f = function f () {};
                var f_ = function f_ () {};
                var sto = "sto";
                var halt = "halt";

                var lock = false;
                $: lock
                
                var h = "halt"



  const sym1 = Symbol('sym1');
  const sym2 = Symbol('sym2');
  const sym3 = Symbol('sym3');

var B = {};
B[sym1] = [];
B[sym2] = [];
B[sym3] = [];

$: B;
                var Mona = function Mona ( AR = [], ar = [] )  {  
                  let p, run, f_;
                  B[ar] = AR.slice();
                  let x = B[ar].slice(-1)[0] ;
                  return run = (function run (x) {
                  if (x instanceof Promise) {x.then(y => {
                    if (!( y.name == "f_" || y == lok || y == NaN || y == undefined ||
                     typeof y == "undefined" || y != y  ) ){B[ar] = B[ar].concat(y)}
                    else if (!(x.name == "f_" || x == lok || x instanceof Promise ||
                     x == undefined || x == NaN)) {B[ar] = B[ar].concat(x);
                  }   }  )  }
                    f_ = function f_ (func) {
                      console.log("B[ar] is", B[ar]);
                      if (func === 'halt' || func === 'h' || func == undefined ||
                       typeof func == "undefined" || func == NaN ) {
                        B[ar] = B[ar]; 
                        return B[ar].slice();
                      }
                      if (typeof func == "function" && x instanceof Promise) p = x.then(v => func(v))
                      else if (typeof func != "function" && x instanceof Promise) p = x.then(v => v)
                      else if (typeof func != "function") p = func
                      else p = func(x);
                      return run(p);
                    };
                    return f_;
                  })(x);
                }

  const A = {};

  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona([], sym2);
  A[sym3] = Mona([], sym3);

  $: B[sym1];
  $: B[sym2];

function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))
        (() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
}

function branch (a, b) {  // Transfers a copy of the last item in A[b] to A[a]
  var c = A[b]().slice(-1);
  return A[a](c);
}

var lok = false;
$: lok;

function start () {
  if (!lok) {
    console.log("lok is false -- calling test_3")
    test_3()
  }
  else {
    console.log("lok is true -- setTimeout 300")
    setTimeout(() => start(),300);
  }
}

function resume (s) {return branch(s,s)}
start();


// var resume = function resume (s) {return Mona(A[s])}

var syms = `const sym1 = Symbol('sym1');
const sym2 = Symbol('sym2');
const sym3 = Symbol('sym3');`

var t_3 = `function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))(() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
} `
var code = `var B = {};
B[sym1] = [];
B[sym2] = [];
B[sym3] = [];

$: B;

var Mona = function Mona ( AR = [], ar = [] )  {  
  let p, run, f_;
  B[ar] = AR.slice();
  let x = B[ar].slice(-1)[0] ;
  return run = (function run (x) {
  if (x instanceof Promise) {x.then(y => {
    if (!( y.name == "f_" || y == lok || y == NaN || y == undefined || 
    typeof y == "undefined" || y != y  ) ){B[ar] = B[ar].concat(y)}
    else if (!(x.name == "f_" || x == lok || x instanceof Promise || x == undefined ||
     x == NaN)) {B[ar] = B[ar].concat(x);
  }   }  )  }
    f_ = function f_ (func) {
      console.log("B[ar] is", B[ar]);
      if (func === 'halt' || func === 'h' || func == undefined ||
       typeof func == "undefined" || func == NaN ) {
        B[ar] = B[ar]; 
        return B[ar].slice();
      }
      if (typeof func == "function" && x instanceof Promise) p = x.then(v => func(v))
      else if (typeof func != "function" && x instanceof Promise) p = x.then(v => v)
      else if (typeof func != "function") p = func
      else p = func(x);
      return run(p);
    };
    return f_;
  })(x);
}

  const A = {};

  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona([], sym2);
  A[sym3] = Mona([], sym3);

  $: B[sym1];
  $: B[sym2];

function test_3 () {
  lok = true;
  A[sym1] = Mona([0], sym1);
  A[sym2] = Mona( [], sym2);
  A[sym3] = Mona([], sym3);
  A[sym1](addP(3))(cubeP)(addP(3))(squareP)(divP(100))(() => 
    branch(sym2,sym1)(idP)(squareP)(divP(27))(multP(7))(doubleP)(() => 
      branch(sym3,sym2)(idP)(() => B[sym1][1]+B[sym1][2]+B[sym1][3])
      (divP(10))(multP(7))(()=>2+3+4+5)(multP(3))(() => 
        branch(sym1,sym2)(divP(7))(addP(8))(multP(3))
        (() => B[sym1].reduce((a,b) => a+b))
        (addP(-23))(divP(24))(() => lok = false)
      )
    )
  )  
}

test_3 ();

function branch (a, b) {  // Transfers a copy of the last item in A[b] to A[a]
  var c = A[b]().slice(-1);
  return A[a](c);
}

var lok = false;
$: lok;

function start () {
  if (!lok) {
    console.log("lok is false -- calling test_3")
    test_3()
  }
  else {
    console.log("lok is true -- setTimeout 300")
    setTimeout(() => start(),300);
  }
}`

  </script>

  <style>

button {
margin-left: 5%;
background-color: #004400;
border-width: 2px;
border-color: #E8F7C1;
border-radius: 70px;
text-decoration-color: red;
font-size: 26px;
-webkit-box-shadow: 0px 0px 15px 0px rgb(255, 215, 0);
box-shadow:         0px 0px 15px 0px rgb(255, 215, 0);
padding: 3px 10px 3px 10px;
}

button:hover {
  color: rgb(156, 236, 156);
  background-color: #0000CC;
  padding: 3px 10px 3px 10px;
  text-decoration-color: yellow;
   border-color: #0000AA;
}

pre:hover {
  color: gold;
}

.caption {
  font: times;  
  text-align: center; 
  color: hsl(210, 90%, 90%); 
  font-size: 32px;
}

.sub_caption {
  font: times;  
  text-align: center; 
  color: hsl(210, 90%, 90%); 
  font-size: 32px;
}
  </style>

  {#if j === 3}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); " transition:fade>
<div style = "font-size: 32px;"> MORE PROMISE MANIPULATION</div>
<div style = "font-size: 22px;">Computations Easily Resumed and Branched</div>  
</div>
{/if}
  <br>
<p> The ES6 Promises API doesn't provide a way to access prior Promise resolution values in chains of composed procedures or in units of state saved for possible future use. In the previous module, Monad() instances saved their array payloads in the object "O". By the naming convention, for any array "O.ar" in "O", "ar = Monad(O.ar)" reactivates the Monad() instance "ar" and "ar2 = Monad(O.ar)" initiates a branch. </p>
<p> In this module, the object "B" contains the functions returned by instances of "Mona()", defined below. Instances of Mona() close over a function named "f_", giving f_() access to the array held in Mona() instance that spawned it. These little functions name "f_" have unique keys in "B", and can resume activity under their original names (corresponding to their keys) or initiate new branches. Clicking the button below calls start() which runs test_3() after any previously queued runs have finished . </p>

<button style = "text-align: left" on:click = {start}>  
test_3()
</button>

<h3>lok is {lok}</h3>
<h3> B[sym1] is {B[sym1]} </h3>
<h3> B[sym2] is {B[sym2]} </h3>
<h3> B[sym3] is {B[sym3]} </h3>

<p> Symbols are used as names and as the second parameter of Mona(). Mona() instances in object "A" populate and update object B with their arrays. Mona() instances in "A" and their arrays in "B" have identical object keys.</p>

<pre style = "font-size: 18">{syms}</pre>
  <pre style = "font-size: 18">{t_3}</pre> 

<pre style = "font-size: 18">{code}</pre>


  <br>

  <br>
 

  <p></p>
  
  
  <br> 