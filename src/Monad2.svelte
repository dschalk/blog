
<script>
var monad2 = `
var Monad2 = function Monad2 ( AR = [] )  {
  var f_, p;
  var ar = AR.slice();
  var x = ar.pop();
  return (function run (x) {
    if (x === null || x === NaN ||
      x === undefined) x = f_('stop').pop();
    if (x instanceof Filt) {
      var z = ar.pop();
      if (x.filt(z)) x = z; else ar = [];
    }
    else if (x instanceof Promise) x.then(y =>
      {if (y != undefined && typeof y !== "boolean" && y === y &&
      y.name !== "f_" && y.name !== "stop" ) {
      ar.push(y);
      diffRender()
    }})
    else if (x != undefined && x === x  && x !== false
      && x.name !== "f_" && x.name !== "stop" ) {
      ar.push(x);
      diffRender()
    };
    function f_ (func) {
      if (func === 'stop' || func === 'S') return ar;
      else if (func === 'finish' || func === 'F') return Object.freeze(ar);
      else if (typeof func !== "function") p = func;
      else if (x instanceof Promise) p = x.then(v => func(v));
      else p = func(x);
      return run(p);
    };
    return f_;
  })(x)
}
 `
 </script>

<style>

h3 {
   font-size: 27px;
}
#tao {
   indent-text: 3%;
}
</style>
<h2>Complex Monads</h2>
<p> The basic JavaScript monad is good for composing simple functions. But what if you want your monad to accept raw data and Promises? What if you want to mimick the behavior of transducers and perform multiple transformations, including filtering, on arrays, sets, or any other container of enumerable data? Here's a monad that has been reliably performing these tasks in my current project: </p>
<pre>{monad2}</pre>
<span class = tao> You can see Monad2 in action at </span>
<a href = "http://schalk.site" target = "_blank"> schalk.site</a>
<span> Monad2 is named "Comp" there. Demonstration 1 shows Monad2 (a/k/a "Comp") restarting, running asynchronous code, and forking into orthogonal branches. Demonstration 2 compares ordinary dot composition, a transducer, and Monad2. In a single step, Monad2 gets the result the transducer gets in a single step and the dot procedure gets in five steps, four of which create useless intermediate arrays for the garbage collector to clean up. </span>
<p> You might wonder what "diffRender()" is. schalk.site is in a Cycle.js framework. In Cycle.js, reactivity is usually accomplished by merging streams and havind main() send the result into the virtual DOM. This is convenient when main() is responding to DOM events. Responding to other things, for example incoming WebSockets or Web Worker messages for example , requires dedicated drivers. After defining numerous drivers I lost patience and started using diffRender(). </p>
<span class = tao>  diffRender() increments a number in the virtual DOM up to 50 then starts again at 0. This prompts Snabbdom to diff the entire virtual DOM. The Snabbdom API provides more targeted ways to force updates. patch(oldVnode, newVnode) comes to mind. I might have gotten around to benchmarking various alternatives to defining drivers but instead, I switched to </span>
<a href = "https://svelte.dev/"  target = "_blank">Svelte</a>
<span> It isn't burdened with a virtual DOM, and Svelte provides reactivity with elegant simplicity. </span>
<span> The code for this Svelte application is at </span>
<a href = "https://github.com/dschalk/blog/" target = "_blank">GitHub repository</a>
