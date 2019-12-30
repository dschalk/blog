
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
<p> Posts are placed either in the "Functional JavaScript" section or else in the section named "Miscellaneous". The functional JavaScript section includes a React application named "Game of Score"; a Cycle.js application named "Frunctional Web Applications"; and functional JavaScript examples each presented in a small Svelte module. "Game of Score", "Functional Web AookuxRUIBA", abd the "Asychronous Monad" Svelte module all use the same modified Haskell Wai WebSockets server. </p>


<h2>Functional JavaScript</h2>
<p> My functional JavaScript ideas will raise eyebrows and cause some immediate consternation among functional Javascript enthusiasts. My Haskell WebSockets server is coded in a pure functional style. It works like a charm and is exceedingly easy to maintain as new requirements emerge.</p>
<p> The Haskell language in combination with the Glorious Haskell Compiler (a/k/a "Glaskow Haskell Compiler") is so wonderful that, if I weren't so inclined to think about what I am doing and so skeptical of authority, I might be persuaded by the many blog posts and video presentations advocating Cargo Cult functional JavaScript. I might be advocating Cargo Cult JavaScript here. </p>
<p> Functional-cargo-cult developers will weigh down their code with universal type checking, even when there is no rational reason to do so. If they have a million cycle recursive expression inside of a function, they will spew 999,999 useless creations into RAM rather than mutate an attribute of the function a million times.</p>
<p> Cargo-cult JavaScript practitioners "think" something like this: Lisp ML, Haskell, and other functional programming languages avoid mutation have strict type requirements, so the wonderfully hybrid and dynamic JavaScript programming language should be fettered, constricted, and weighed down with univeral immutability and type checking because that will magically bring the benifits inherent in the functional languages.</p>   
<p> I urge everyone involved in creating JavaScript applications to at least take a look at my examples of what funtions returned by modifications of Monad() can do. "Functional JavaScript" means various things to different people. I like meanings that stress getting the most out of JavaScripts first-class functions</p>
<h3>References</h3>

<div></div>
<div>Cargo Cult Science http://calteches.library.caltech.edu/51/2/CargoCult.pdf </div> 



<h2>Miscellaneous Section</h2>
<p> The "Misclaneous" is for discoveries that seem worth sharing, and ideas of minimal general interest that I don't want to forget   </p>
<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. </p>

<br>
<br>

                    <div style = "display: flex">
                    <div style = "text-align: right; margin-right: 2%; width: 20%" >

<button on:click={back}>
BACK
</button>
<br>
<br>
<div style="text-indent:20px"><button>{ j }</button></div>
<br>
<button on:click={forward}>
FORWARD
</button>
<br>
<br>
                
            </div>
            <div style = "marginRight: 0%; width: 80%;">

<button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[j][2]}</button>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[j][7]}</button>
<button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
</div>
</div>
<br>
<p> An example of an imbedded module that I will explain later: </p> 
<Cow /> 
<br><br>
<div>David Schalk</div>
<div>October, 2019 </div>
<br>
<br>

