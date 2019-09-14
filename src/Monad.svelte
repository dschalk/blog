
<script>
import Monad2 from './Monad2.svelte'
function Monad (z) {
  var x = z;
  var foo = function foo (func) {
    var stop = "stop";
    if (func.name === "stop") return x
    else {
      x = func(x);
      return foo;
    }
  };
  return foo;
}

const cow = `function Monad (z) {
    var x = z;
    var foo = function foo (func) {
        var stop = 'stop';
        if (func.name === 'stop') return x
        else {
            x = func(x);
            return foo;
        }
    };
    return foo;
}

const prod = a => b => a*b;
const sum = a => b => a+b;`

const prod = a => b => a*b;
const sum = a => b => a+b;
let num = 6;
let res = Monad(num)(sum(7))(prod(4))(v=>v-10)(stop)
$: res;

let compute = function compute (e) {
  num = e.target.value;
  res = Monad(num)(sum(7))(prod(4))(v=>v-10)(stop)
  console.log("e is", e, "num is", num);
  return num;
}
$: compute

var axe = `
var mon = Monad(3);
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop);

console.log("a is", a)  // a os 900`

var orion = `function foo(func) {
        var stop = "stop";
        if (func.name === "stop") return x;else {
            x = func(x);
            return foo;
        }
    } `
var tree = `
mon(x => x/100)
console.log("mon(stop) now is",mon(stop))  // mon(stop) now is 9 `

var fred = `
var ar = [];
var mon = Monad(3);
ar.push(mon(stop));
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)
ar.push(a);
ar.push(mon(x => x/100)(stop));
console.log("ar is", ar)  // [3, 900, 9] `
</script>

<style>

h3 {
   font-size: 27px;
}
#tao {
   indent-text: 3%;
}

#aside {
    font-size: 18px;
    color: #eeaaff;
    font-style: italic;
}
</style>


<h2>A Simple Monad</h2>
<p> In order to be a Category Theory monad, a function must exist in a category. JavaScript objects (including functions) don't constitute a category. But functions that hold values and compose with multiple functions that operate on their values behave like Category Theory monads enough to justify calling them "monads".</p>
<p> Here's the definitions of three functions: </p>
<pre>{cow}</pre>
<p> And here's an anonymous monad followed by three functions and "stop". : </p>
<pre> Monad(6)(sum(7))(prod(4))(v=>v-10)(stop) // 42 </pre>
<p> It gave the expected result, 42. If you change the definition of the anonymous monad, the result will be displayed below.</p>
<input id = "one" type = "number" bind:value = {num}  on:input = {compute}  />

<span> Monad(</span>

<span>{num}</span>
<span>)(sum(7))(prod(4))(v=>v-10)(stop) returns </span>
<span> {res} </span>
<br>
<br>
<span class = tao> Named monads retain their values, even after they encounter "stop" and return the value of x held in the Monad closure. The following examples illustrate this: </span>
<pre>
{axe}
</pre>

<p> As expected, "console.log("mon is", mon)" returns the foo() that was returned by by calling Monad(3):</p>
<pre>
{orion}
</pre>

<p> mon() is still the foo() returned by Monad(). Because mon() maintains a reference to the x in the context of its creation, x will not be garbage collected. </p>
<p> It is convenient to have state, in the form of x, safely tucked away in a closure, but if later in your program you no longer have any use for x, it's up to you to destroy the named monad that points to it. </p>
<p> One reason Svelte is so fast and efficient is that it mutates variables and objects. It has risen above the conventional "wisdom" of the day. If you want to save value of x in mon, you can do this: </p>

<pre>{fred}</pre>
<span class = tao> Better yet, keep the array of computation results in the closure. It would then be convenient to run functions on array elements or the array itself. Monads could be asynchronous, populating the array with Promise resolution values. They could even be made to perform multiple array transformation - including map, filter, and reduce - in a single step, just as transducers do. Here comes a Swiss army knife definition that does all of these things. I'll call it "Monad2". </span>
<span id = aside> I leave sentence punctuation outside of quotation marks, which is customary in the UK.</span>
