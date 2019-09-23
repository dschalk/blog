
<script>
import {fade} from "svelte/transition"
let visible = true;

let monadDisplay = `function Monad (z) {
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

let bonadsD = `function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)(stop)]}`

let axe = `
let mon = Monad(3);
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop);
console.log("a is", a)  // a is 900`

let tree = `
mon(x => x/100)
console.log("mon(stop) now is",mon(stop))  // mon(stop) now is 9 `

let fred = `
let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon(stop));
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)
ar.push(a);
ar.push(mon(x => x/100)(stop));
ar.push(mon2(mon(stop)(x=>x*100)))
console.log("ar is", ar)  // [3, 900, 9] `

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

const prod = a => b => a*b;
const sum = a => b => a+b;

let num = 6;

let bonads = function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)(stop),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)(stop)]}


let mona = bonads(num);
$: mona
console.log(mona)

let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon(stop));
var a = mon(x=>x**3)(x=>x+3)(x=>x**2)(stop)
ar.push(a);
ar.push(mon(x => x/100)(stop));
ar.push(mon2(()=>mon(stop))(x=>x*100)(stop))

function numF (e) {num = e.target.value; console.log("e.target.value is", e.target.value); return e.target.value}
$: num

console.log("num is", num);
</script>

<style>
.tao {
  margin-left: 3%;
}

h3 {
   font-size: 27px;
}

#aside {
    font-size: 18px;
    color: #eeaaff;
    font-style: italic;
}
</style>
<br><br><br>
 {#if visible}
 	<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
A SIMPLE LITTLE MONAD
 	</div>
 {/if}
 <br>
<span style = "text-indent: 3%"> The word "monad" has been around for centuries. Gottfried Leibniz published </span>
<span style = "font-style: italic"> Monadology </span>
<span> in 1714. The precursor to the familiar symbol of yin-yang, taijitu (太極圖), has a version with two dots added, has been given the august designation: "The Great Monad". A single note in music theory is called a monad. All of this is too tangential to warrant references. I Googled around a little to get it and you can too if the word "monad" interests you.</span>
<p> Monads in the Haskell Programming Language were inspired by Category Theory monads. In order to be Category Theory monads, function must exist in a mathematically rigorous "category". Haskells objects and functions are not the objects and morphisms of Category Theory. Making a category out of most of Haskell's functions and types is an amusing pasttime for some people, but I doubt that it has any practical value. </p>
<p> So it should be no surprise that my JavaScript monads are not Category Theory monads. They do obey a JavaScript version of the Haskell monad laws, which are not a requirement in Haskell but are indicative of utility and robustness objects (including functions) don't constitute a category. But functions that hold values and compose with multiple functions that operate on their values behave like Category Theory monads enough to justify calling them "monads".</p>
<p> Here's the definitions of three functions: </p>
<pre>{monadDisplay}</pre>
<p> And here is an anonymous monad followed by three functions and "stop". : </p>
<pre> Monad(6)(sum(7))(prod(4))(v=>v-10)(stop) // 42 </pre>
<p> Anonymous monads never interfere with other monads. The demonstration below illustrates this by running seven anonymous monads in rapid succession. The number you enter is "num" in </p>
{bonadsD}
<input id = "one" type = "number" on:input={bonads}  bind:value={num} />
<p> num is {num} so bonads(num) returns {bonads(num)} </p>

<span class = tao> Named monads retain their values, even after they encounter "stop" and return the value of x held in the Monad closure. The following examples illustrate this: </span>
<pre>
{axe}
</pre>

<p> As expected, mon returns which is the "foo()" returned by by calling Monad(3):</p>
{mon}

<p> mon() is still the foo() returned by Monad(). Because mon() maintains a reference to the x in the context of its creation, x will not be garbage collected. </p>

<p> It is convenient to have state, in the form of x, safely tucked away in a closure; but if later in your program you no longer have any use for x, it's up to you to destroy the named monad that points to it. </p>
<p> One reason Svelte is so fast and efficient is that it mutates variables and objects. In this and other ways, Svelte has shaken off the bonds of current conventional "wisdom". </p>
<p>If you want to save older versions of a monad, you can stash it in an ordinary curly braces object, an array, a set, etc. Here's some code that demonstrates preserving a monad's history. It also demonstrates a monad named "mon2" branching off of mon and going its own way. </p>
<pre>{fred}</pre>
<p> ar is {ar} </p>
<span class=tao> Another technique is to keep the array of computation results in the closure.  It would then be convenient to run functions on array elements or the array itself. Monads could be asynchronous, populating the array with Promise resolution values. They could even be made to perform multiple array transformation - including map, filter, and reduce - in a single step, just as transducers do. To see a monad that does all of these things, click "A Swiss Army Knife Monad". </span>
<span id = aside> By the way, I leave sentence punctuation outside of quotation marks, which is customary in the UK and eliminates the ambiguity inherent in the standard American syntax.</span>
