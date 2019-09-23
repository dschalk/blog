<script>
import {fade} from "svelte/transition"
let visible = true;

  var cache = [[1,2,3,4,5,6,7,8,9]];
  var j = 0;
  var ob = {x: [], push: function push (e) {
     ob.x.push(parseInt(e.target.id.slice(1,2), 10));
     if (ob.x.length >1) {
         var d = exchange(ob.x[0], ob.x[1]);
         cache.splice(j+1,0,d);
         ob.x = [];
         j+=1;
         return cache;
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
       j = j-=1;
   }

   var forward = function forward () {
      if (j < 9) j = j+=1;
    }
   var code = `import {fade} from "svelte/transition"
   let visible = true;

     var cache = [[1,2,3,4,5,6,7,8,9]];
     var j = 0;
     var ob = {x: [], push: function push (e) {
        ob.x.push(parseInt(e.target.id.slice(1,2), 10));
        if (ob.x.length >1) {
            var d = exchange(ob.x[0], ob.x[1]);
            cache.splice(j+1,0,d);
            ob.x = [];
            j+=1;
            return cache;
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
          j = j-=1;
      }

      var forward = function forward () {
         if (j < 9) j = j+=1;
       } `

   var html = `{#if visible}
    <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
    <br><br>
   A LITTLE SVELTE MODULE
    </div>
   {/if}


   <p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
   <p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. </p>
   <div id = buttons>
   <br>
   <button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
   <button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
   <button id = m2  on:click = {ob.push} >{cache[j][2]}</button>
   <br>
   <br>
   <br>
   <button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
   <button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
   <button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
   <br>
   <br>
   <br>
   <button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
   <button id = m7  on:click = {ob.push} >{cache[j][7]}</button>
   <button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
   </div>
   {#if j > 0}
   <br>
   <br>
   	<button on:click={back}>
   		BACK
   	</button>
   {/if}
   <br>
   <br>
   {#if j < cache.length -1}
   	<button on:click={forward}>
   		FORWARD
   	</button>
    <br>
    <br>
   {/if}
   <p> This is the JavaScript code inside of the "script" tags: </p>
   <p> And here is the HTML code: </p>
   <p> Is Svelte awesome, or what? </p>`
</script>

{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
A LITTLE SVELTE MODULE
 </div>
{/if}


<p> If you click any two numbers (below), they switch locations and a "BACK" button appears. If you go back and click two numbers, the result gets inserted  at your location.</p>
<p> I can use simple variables knowing they will never clash with a similarly named variable in a differenct module. Svelte code is consise and efficient. Coding in Svelte is so relaxing. </p>
<div id = buttons>
<br>
<button id = m0  on:click = {ob.push} >{cache[j][0]}</button>
<button id = m1  on:click = {ob.push} >{cache[j][1]}</button>
<button id = m2  on:click = {ob.push} >{cache[j][2]}</button>
<br>
<br>
<br>
<button id = m3  on:click = {ob.push} >{cache[j][3]}</button>
<button id = m4  on:click = {ob.push} >{cache[j][4]}</button>
<button id = m5  on:click = {ob.push} >{cache[j][5]}</button>
<br>
<br>
<br>
<button id = m6  on:click = {ob.push} >{cache[j][6]}</button>
<button id = m7  on:click = {ob.push} >{cache[j][7]}</button>
<button id = m8  on:click = {ob.push} >{cache[j][8]}</button>
</div>
{#if j > 0}
<br>
<br>
	<button on:click={back}>
		BACK
	</button><pre>{code}</pre>

{/if}
<br>
<br>
{#if j < cache.length -1}
	<button on:click={forward}>
		FORWARD
	</button>
 <br>
 <br>
{/if}
<p> This is the JavaScript code inside of the script tags except for the definitions of the variables "code" and "html", which are just the code and html cut and pasted inside of back quotes: </p>
<pre>{code}</pre>
<p> And here is the HTML code: </p>
<pre>{html}</pre>
<p> Is Svelte awesome, or what? </p>
