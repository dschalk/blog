
<script>
    import {fade} from "svelte/transition"
    let visible = true;

    let j = 3;
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
      await wait(100)
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
      return x + y;
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
      await wait(300)
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
    var add = x => y => x+y;
    var sqrt = x => x**(1/2);
    var root = r => x => x(1/r);
    var div = d => x => x/d;

   var f = function f () {};
   var f_ = function f_ () {};
   var sto = "sto";
   var halt = "halt";

   var O = new Object();
   $: O;

   var M = -1;
   $: M;
   var N = -1;
   $: N;
   var T = -1;
   $: T;
   var Q = -1
   $: Q;

   var lock = false;
   $: lock

   var Monad = function Monad ( AR = [], name = "generic"  )  {
     var f_, p, run;
     var ar = AR.slice();
     var name = name;
     O[name] = ar;
     let x = O[name].pop();
     return run = (function run (x) {
       if (x instanceof Promise) x.then(y => {
         if (y != undefined && y == y && y.name !== "f_") {
         O[name] = O[name].concat(y)
         }
       })
       if (!(x instanceof Promise)) {
          if (x != undefined && x == x) {
             O[name] = O[name].concat(x)
          }
       }
       function f_ (func) {
         if (func === 'halt' || func === 'S') return O[name].slice();
         else if (typeof func !== "function") p = func;
         else if (x instanceof Promise) p = x.then(v => func(v));
         else p = func(x);
         return run(p);
       };
       return f_;
     })(x);
  }

   var branch = function branch (s,s2) {return Monad(O[s].slice()  , s2)}
   var resume = function resume (s) {return Monad(O[s], s)}

   Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
   (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
   (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
   (() => resume("test")(multP(4))(addP(6))))


var mon = `   var Monad = function Monad ( AR = [], name = "generic"  )  {
     var f_, p, run;
     var ar = AR.slice();
     var name = name;
     O[name] = ar;
     let x = O[name].pop();
     return run = (function run (x) {
       if (x instanceof Promise) x.then(y => {
         if (y != undefined && y == y && y.name !== "f_") {
         O[name] = O[name].concat(y)
         }
       })
       if (!(x instanceof Promise)) {
          if (x != undefined && x == x) {
             O[name] = O[name].concat(x)
          }
       }
       function f_ (func) {
         if (func === 'halt' || func === 'S') return O[name].slice();
         else if (typeof func !== "function") p = func;
         else if (x instanceof Promise) p = x.then(v => func(v));
         else p = func(x);
         return run(p);
       };
       return f_;
     })(x);
  }`

  var lok = false;

  var start = function start () {
     if (!lok) {
       lok = true;
       setTimeout(() => lok = false,3000 );
       O = {};
       Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
       (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
       (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
       (() => resume("test")(multP(4))(addP(6)))) }
     else {
       setTimeout(() => start(),300);
     }
  }

var fs = `   var branch = function branch (s,s2) {return Monad(O[s].slice(-1)  , s2)}
   var resume = function resume (s) {return Monad(O[s], s)}`
var code = `    Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
     (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
     (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
     (() => resume("test")(multP(4))(addP(6))))`
</script>

{#if j === 3}
	<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
PROMISES MONAD
	</div>
{/if}


{#if j === 9}
	<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
  MONAD VARIATION THAT HANDLES PROMISES
	</div>
{/if}

<h2>O.test is {O.test}</h2>
<h2>O.test_2 is {O.test_2}</h2>             <br>
<span class=tao> To see branch() and resume() in action, click the verbose butt6n (below). To see the boolean "lok" protecting the integrity of the data, click the verbose button (below) several times in rapid succession:</span>
<br><br>
<button style = "text-align: left" on:click = {start}>Run Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
     (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
     (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
     (() => resume("test")(multP(4))(addP(6))))</button>


<br>
<p> Here's the modified monad constructor: </p>
<pre>{mon}</pre>
<p> After monads encounter "halt", they can use the function resume() to continue processing data where they left off and (2) they can branch off in new monads created by branch(). Here are the definitions:</p>
<pre>{fs}</pre>
<p> This is the statement that produces the observed results when "START" is clicked. </p>
<pre>{code}</pre>                           <br>
<button on:click = {start}>Run Monad([2], "test")(addP(1))(cubeP)(addP(3))(squareP)(divP(100))
     (() => branch("test", "test_2")(sqrtP)(cubeP)(()=>addP(O.test_2[2])
     (O.test_2[1]))(squareP)(divP(100))(sqrtP)(multP(14))
     (() => resume("test")(multP(4))(addP(6))))</button>


<br>
<h2>O.test is {O.test}</h2>
<h2>O.test_2 is {O.test_2}</h2>
<br>

<br>
<span class = "tao"> Notice the statement: </span>
<span style = "color: #AAFFAA">()=>addP(O.test_2[2])(O.test_2[1])</span>
<span>. Promises in chains of ES6 Promises can't access previous Promise resolution values. One way to get access to prior resolution values is to encapsulate Promise chains in Monad(). This also makes it convenient to resume or branch from terminated computation chains; and this can be accomplished without naming the chains. </span>