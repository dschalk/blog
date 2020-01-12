
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
<p> The cult that captivated me has no makeshift control towers or dirt runways made to entice cargo-bearing planes to land. It was a conglomeration of authors, presenters, and bloggers who write JavaScript code without mutating variables or objects, and whose functions are strictly typed, referentially transparent, and take arguments one at a time. Maybe it was my enthusiasm for the Haskell programming language that made it so easy for me to hope that mimicking Haskell's inherent characteristics would result in better Javascript code.

I constrained my JavaScript code in other ways too, favoring "good parts" over "bad parts", and "best practices" over common sense. After a while it dawned on me that when the global space is a little module in an application, global variables are not dangerous. When a million and one non-tail-call recursions or passes through a loop can either spew a million pieces of garbage into memory, or else mutate something a million times, there should be a good reason for choosing to feed the garbage collector such a large feast. That's when I unleashed the full power of JavaScript and started having fun.  

<p> For me, Functional programming in the context of Javascript is the art of inventing higher-order, often application-specific functions to manipulate smaller, reusable functions. Simple monad, messages monad, Promises monad, and transducer monad (shown herein) hint at the possibilities. </p>
<p> Posts in this blog aren't just about computer programming. Nothing fit to publish is off limits. </p>
<br>
<br>
<br>
<div style = "text-align: center">...</div>
