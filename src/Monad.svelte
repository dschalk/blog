
<script>
import {fade} from "svelte/transition"
let visible = true;

let monadDisplay = `function Monad (x) {
  return function _f (func) {
    if (func === "stop") return x
    else  {
      return Monad(func(x));
    }
  };
}

Monad(6)(v=>v+8)(v=>[v*2, v])(v=>v.reduce((a,b)=>a+b))("stop") 



const prod = a => b => a*b;
const sum = a => b => a+b;`

let bonadsD = `function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)("stop")]}`

let axe = `
let mon = Monad(3);
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)("stop");
console.log("a is", a)  // a is 900`

let tree = `
mon(x => x/100)
console.log("mon("stop") now is",mon("stop"))  // mon("stop") now is 9 `

let fred = `
let ar = [];
let mon = Monad(3);
let mon2 = Monad();
ar.push(mon("stop"));
let a = mon(x=>x**3)(x=>x+3)(x=>x**2)
ar.push(a);
ar.push(mon(x => x/100);
ar.push(mon2(mon("stop")(x=>x*100)))
console.log("ar.map(v=>v('stop')) is", ar.map(v=>v('stop')))  // [3, 900, 9] `

let monad_ = `function Monad (x) {
  return function _f (func) {
    if (func === "stop") return x
    else  {
      return Monad(func(x));
    }
  };
}

Monad(6)(v=>v+8)(v=>[v*2, v])(v=>v.reduce((a,b)=>a+b))("stop") `
function Monad (x) {
  return function _f (func) {
    if (func === "stop") return x
    else  {
      return Monad(func(x));
    }
  };
}

Monad(6)(v=>v+8)(v=>[v*2, v])(v=>v.reduce((a,b)=>a+b))("stop")  //42

const prod = a => b => a*b;
const sum = a => b => a+b;

let num = 6;

let bonads = function bonads(num) {
return [Monad(num)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-3)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-2)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-1)(sum(7))(prod(4))(v=>v-10)("stop"),
Monad(num-0)(sum(7))(prod(4))(v=>v-10)("stop")]}


let mona = bonads(num);
console.log(mona)

function numF (e) {num = e.target.value; console.log("e.target.value is", e.target.value); return e.target.value}

console.log("num is", num);
</script>

 {#if visible}
 	<div style = "font-family: Times New Roman; text-align:center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
A SIMPLE LITTLE MONAD
 	</div>
 {/if}
 <br>
<p> In the following expression: </p>
<pre> Monad(6)(v=>v+7)(v=>v*4)(v=>v-10)("stop") // 42 </pre>
<p> The expression "Monad(6)" creates a closure whose outer function contains "x" (initially equal to 6) and whose inner function "_f" is confined to the scope of the anonymous outer function.  whose scope is  returns "_f"; "_f(v=>v+7) returns "_f" while also mutating "x" in its outer scope, making it 13. "_f(v=>v*4) changes x to 52 and returns "_f". "_f(v=>v-10)" returns "_f" while mutating x again, making it 42. Finally, the expression "_f('stop')" causes _f to return the number 42. </p>
<p> As in the Haskell programming language, the monads described above encapsulate sequences of computations. The similarity is greater when we avoid mutation, as we do in some of the more-complex definitions of "Monad" (or whatever we decide to call it). </p>



<p> Anonymous monads never interfere with other monads. The demonstration below illustrates this by _fning seven anonymous monads in rapid succession. The number you enter is "num" in </p>
{bonadsD}
<input id = "one" type = "number" on:input={bonads}  bind:value={num} />
<p> num is {num} so bonads(num) returns {bonads(num)} </p>

<span class = tao> Named monads retain their values, even after they encounter "stop" and return the value of x held in the Monad closure. The following examples illustrate this: </span>
<pre>
{axe}
</pre>








