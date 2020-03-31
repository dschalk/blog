
<script>
import {fade} from "svelte/transition"
let visible = true;

function Monad () { 
  var ar = []
  var s = "stop";
  return function _f (func) {
    if (func === "stop") return ar
    if (typeof func !== "function") {
      ar = ar.concat(func); 
      return _f
    } 
    else  {
      ar = ar.concat(func(ar.slice(-1)[0]));
      return _f;
    }
  };
}

var a = Monad()
var  b = Monad();
var res1 = a(3)(v=>v**3)(v=>v+3)(v=>v*v)(s)    
var res2  = b(a("stop"))(v=>v/100)(Math.sqrt)(Math.floor)(s);  
var res3 = a(Math.floor(a(v=>v/((a(s)[0]*10)))(s))) (v=>v+4)(v=>v*3) (s);   
var res4 = b(v=>v*2)(v=>v*7) (s);    

let num = 3;

function demo(num) {
var a = Monad()
var  b = Monad();
var res1 = a(3)(v=>v**3)(v=>v+3)(v=>v*v)(s)    
var res2  = b(a("stop"))(v=>v/100)(Math.sqrt)(Math.floor)(s);  
var res3 = a(Math.floor(a(v=>v/((a(s)[0]*10)))(s))) (v=>v+4)(v=>v*3) (s);   
var res4 = b(v=>v*2)(v=>v*7) (s);    
return [[res1],[res2],[res3],[res4]];
}

const prod = a => b => a*b;
const sum = a => b => a+b;

var result =  Monad()(4)(v=>v**4)(Math.sqrt)(x=>x-2)
(v => "And the answer is: " + v*3)('stop')  

let s = "stop";

var code1 = `function Monad () { 
  var ar = []
  var s = "stop";
  return function _f (func) {
      if (func === "stop") return ar
      if (typeof func !== "function") {
          ar = ar.concat(func); 
          return _f
      } 
      else  {
          ar = ar.concat(func(ar.slice(-1)[0]));
          return _f;
      }
   };
} `

var code2 =  `
let a = Monad()
let  b = Monad();
let res1 = a(3)(v=>v**3)(v=>v+3)(v=>v*v)(s)    // [3,27,30,900]
let res2  = b(a("stop"))(v=>v/100)(Math.sqrt)(s);  // [3,27,30,900,9,3]
let res3 = a(v=>v/90)(v=>v+4)(v=>v*3) (s)         // [3,27,30,900,10,14,42]
let res4 = b(v=>v*2)(v=>v*7) (s)                  // [3,27,30,900,9,3,6,42] `

var result = Monad()(4)(v=>v**4)(Math.sqrt)(x=>x-2)
    (v => "And the answer is: " + v*3)('stop')

 var code3 = `Monad()(4)(v=>v**4)(Math.sqrt)(x=>x-2)(v => "And the answer is: " + v*3)('stop')}`   

export {a, b, res1, res2, res3, res4}

</script>

{#if visible}
<div style = "font-family: Times New Roman; text-align:center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
A SIMPLE LITTLE MONAD
</div>
{/if}

<br>
<p> The following definition of "Monad" exhibits a basic feature of the more complex definitions that follow: When _f() is returned and there is some value "v" in front of it, _f(v) is evaluated and _f is returned again. When, at last, there is nothing in front of _f, _f just waits for further instructions. It can resume activity where it left off, start a branch without altering the current value, or return its array.</p>
<pre>{code1}</pre>
<p> For example:</p>

<pre>{code2}</pre>

<p> Here's an anonymous monad performing computations and returning results along with a string.</p>
<pre>{code3}</pre>

<input  type = "number" on:input={demo}   />



<h3>res1 = {res1}</h3>
<h3>res2 = {res2}</h3>
<h3>res3 = {res3}</h3>
<h3>res4 = {res4}</h3>

<h3>a("stop") returns [{a("stop")}]</h3>
<h3>b("stop") returns [{b("stop")}]</h3>

<h3>The variable "result" is: {result}</h3>

<h2>demo3:{demo(3)}</h2>


