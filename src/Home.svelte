
<script>
var cache = [[1,2,3,4,5,6,7,8,9]];
var j = 0;
var ob = {
  x: [], 
  push: function push (e) {
    ob.x.push(parseInt(e.target.id.slice(1,2), 10));
    if (ob.x.length >1) {
      var d = exchange(ob.x[0], ob.x[1]);
      cache.splice(j+1,0,d);
      ob.x = [];
      j+=1;
      return cache;   var j = 0;
    }
  }
}

function exchange (k,n) {
  var ar = cache[j].slice();
  var a = ar[k]
  ar[k] = ar[n];
  ar[n] = a;
  return ar;
}

var back = function back () {
  if (j > 0) j = j-=1;
  else j = j;
}

var forward = function forward () {
  if (j+1 < cache.length) j = j+=1;
  else j = j;
}

import {fade} from "svelte/transition"
let visible = true;

import Cow from "./Cow.svelte";

</script>

{#if visible}
<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
INTRODUCTION 
</div>
{/if}
<br>
<p> The cult that captivated me had no makeshift control towers or runways to entice cargo-bearing planes to land. It was a conglomeration of authors, presenters, and bloggers who ritualistically avoid things not found in exclusively functional languages, such as mutations and referentially opaque functions while favoring curried functions over multi-parameter versions. My enthusiasm for the Haskell programming language and the Glasgow Haskell Compiler (a/k/a Glorious Haskell Compiler) made me an easy recruit.

When the global space is a tiny module, global variables are not dangerous. When a million and one non-tail-call recursions or passes through a loop can either spew a million pieces of garbage into memory or mutate something a million times, there should be a good reason for choosing to feed the garbage such a large meal. I'll have more on this later. 

<p> The functional programming I espouse is, in the case of JavaScript, the art of devising application-specific higher-order functions to manipulate smaller, reusable functions. </p>
<p> This blog isn't only about computer programming. The Tao Te Ching, bed bugs, and other miscellaneous topics have already found places here. </p>
<br>
<br>
<div>David Schalk</div>
<div>October, 2019 </div>
<br>
<br>

