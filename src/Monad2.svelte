











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
<pre>{monad2}</pre>
<span class = tao> You can see Monad2 in action at </span>
<a href = "http://schalk.site" target = "_blank"> schalk.site</a>
<span> Monad2 is named "Comp" there. Demonstration 1 shows Monad2 (a/k/a "Comp") restarting, running asynchromous code, and forking into orthogonal branches. Demonstration 2 compares ordinary dot composition, a transducer, and Monad2. In a single step, Monad2 gets the result the transducer gets in a single step and the dot procedure gets in five steps, four of which create useless intermediary arrays for the garbage collector to clean up. </span>
<p> You might wonder what "diffRender()" is. schalk.site is in a Cycle.js framework. In Cycle.js, reactivity is usually accomplished with "drivers". After defining numerous drivers, I started forcing Snabbdom's diff/render process by changing a number in the virtual DOM. diffRender() increments a number in the virtualDom up to 50 then starts again at 0.</p>
<span class = tao> This blog rests peacefully in a </span>
<a href = "https://svelte.dev/"  target = "_blank">Svelte</a>
<span> framework. There is no virtual DOM and reactivity is built in. For my purposes, Svelte is far superior to React, Cycle.js, and any other framework I have tried. The code for this site is at </span>
<a href = "httms://github.com/dschalk/blog" target = "_blank">Githum repository</a>
