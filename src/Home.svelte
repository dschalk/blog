
<script>
let cache = [[1,2,3,4,5,6,7,8,9]];
let j = 0;
let ob = {
x: [], 
push: function push (e) {
  ob.x.push(parseInt(e.target.id.slice(1,2), 10));
  if (ob.x.length >1) {
    let d = exchange(ob.x[0], ob.x[1]);
    cache.splice(j+1,0,d);
    ob.x = [];
    j+=1;
    return cache;   let j = 0;
  }
}
}

function exchange (k,n) {
let ar = cache[j].slice();
let a = ar[k]
ar[k] = ar[n];
ar[n] = a;
return ar;
}

let back = function back () {
if (j > 0) j = j-=1;
else j = j;
}

let forward = function forward () {
if (j+1 < cache.length) j = j+=1;
else j = j;
}

import {fade} from "svelte/transition"
let visible = true;


let text = `A monad is a way of composing functions that require context in addition to the return value, such as
map(a→b)
f latten
computation, branching, or effects. Monads map M (a) −−−−−−−→ M (b) and flatten M (M (a)) −−−−−→
f
g
M (a) , so that the types line up for type lifting functions like a −
→ M (b) , and b −
→ M (c) , making them
composable.
f
g
f then g
Given two functions, a −
→ M (b) and b −
→ M (c) , monads let us compose them to produce h : a −−−−−→
M (c) where then represents the Kleisli arrow operator ( >=> in Haskell). It’s similar to the composition
operator, ◦ , but works in the opposite direction. You can think of it as f latM ap(g) ◦ f ( flatMap(g)
after f ). It’s the monad equivalent of g ◦ f . I use “ then ” for the Kleisli composition operator to clarify
the order of operations and make the text more friendly to people who are not familiar with category
theory or Haskell notation.`

var jay = `If you search the Internet for “monad” you’re going to get 
bombarded by impenetrable category theory math and a bunch of people “helpfully” 
explaining monads in terms of burritos and space suits.

Monads are simple. The lingo is hard. Let’s cut to the essence.

A monad is a way of composing functions that require context in addition to the 
return value, such as computation, branching, or I/O. Monads type lift, flatten 
and map so that the types line up for lifting functions a => M(b), making them composable. 
It's a mapping from some type a to some type b along with some computational context, 

hidden in the implementation details of lift, flatten, and map:
Functions map: a => b
Functors map with context: Functor(a) => Functor(b)
Monads flatten and map with context: Monad(Monad(a)) => Monad(b)
But what do “flatten” and “map” and “context” mean?
Map means, “apply a function to an a and return a b". Given some input, return some output.
Context is the computational detail of the monad’s composition (including lift, flatten, 
and map). The Functor/Monad API and its workings supply the context which allows you to 
compose the monad with the rest of the application. The point of functors and monads is 
to abstract that context away so we don’t have to worry about it while we’re composing 
things. Mapping inside the context means that you apply a function from a => b to the 
value inside the context, and return a new value b wrapped inside the same kind of context. 
Observables on the left? Observables on the right: Observable(a) => Observable(b). Arrays 
on the left side? Arrays on the right side: Array(a) => Array(b).

Type lift means to lift a type into a context, blessing the value with an API that you can use to compute from that value, trigger contextual computations, etc… a => F(a) (Monads are a kind of functor).
Flatten means unwrap the value from the context. F(a) => a. `

let monad_ = ` function Monad () { 
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



</script>

{#if visible}
<div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
INTRODUCTION 
</div>
{/if  }   

<p>  The recursive closures called "monads" (on this website) are returned by factory functions called "Monad". The functions returned by Monad() can be anonymous or named. </p> 
<span>  Each monad "m" created by calling, for example, "let m = Monad()", has its own dynamic array named "ar". Each monad "m", as defined above, either returns a function named "_f" that concatenates elements onto ar or, more commonly, returns a function named "run" that returns a function named "_f" that concatenates elements onto "ar". After monads process everything provided to them, the returned function _f lies dormant with access to the "ar" array in its outer function.  </span> <span style = "font-style:italic; color: #FFBBDD;"> Dormant monads can resume activity or spawn orthogonal branches. </span>
<p> When a monad encounters a function, say "func", the last item in its outer function's array, for example "e" in "[a,b,c,d,e]", becomes the func's argument and the return value is concatenated to the array. The outer functions array then becomes [a,b,c,d,e,func(e)]. </p>
<p>  When a suitably defined monad encounters a promise, the promise's resolution value is concatenated to the array. Values which are niether functions nor promises that that meet conditions specified in monad m's definition of "run" are concatenated to ar. When a monad encounters the string "stop" (or "s" defined as "stop") the outer function's array is returned.</p>    
<p style = "font-style: italic; color: #BBFFBB;"> NOTE: The definition of "Monad" varies from module to module on this site. An alternative would be to define "Monad" with more functionality and place it in a parent module. </p>
<p> When no value is provided to a monad, the monad's return value "_f" remains dormant waiting to resume its activity or provide a starting point for an orthogonal branch if and when it is called upon to do so. A dormant monad that is provided with the argument "stop" will return its outer function's array.</p>
<p> The table of contents provides links to a simple monad, a monad that interacts with a WebSockets server and a Web Worker, two monads that nteract with promises, and one that functions as a transducer. A monad that combines all of this functionality can easily be defined. </p>

<h3> Functional Programming</h3>
<span class = tao> Contrary to what you may have read or heard in video presentations, functional programming can and often does entail the mutation of variables and objects. Haskell, for example, is a functional language. Haskell programmers generally perform mutations inside of monads, insulated from the rest of the prograrams that contain them, but that isn't necessary.  See </span>
<a href="https://en.wikibooks.org/wiki/Haskell/Mutable_objects" target="_blank">Haskell Mutable Objects"</a> and  
<a href="https://tech.fpcomplete.com/haskell/tutorial/mutable-variables" target="_blank">Haskell Mutable Variables</a>

<p>  I experimented with porting Haskell patterns and algorithms over to JavaScript. I enjoyed experimenting the way people enjoy Sudoku or crossword puzzles. My functions were pure; my "variables" were immutable, and my monad api's were unnecessarity complicated and pretty useless. </p>

<p> Haskell monads of a certain type can be "lifted" into monads of other types and normalized with flatmap. Imposing strict typing on JavaScript can be useful, especially in large group efforts where misusing functions can create bugs, but doing so prior to developing useful monads seems decidedly counterproductive. It smacks of cargo cult programming, about which I will say more later.  </p>

<h3>The Word "Monad"</h3>
<p> I call the following basic function, along with variations on its theme, a "monad":</p>
<pre>{monad_}</pre>
<p>The table of contents has links to monads that handle WebSockets and Web Worker messages along with monads that handle promises and behave like transducers.</p>
 <span class = tao> Monad (from Greek μονάς monas, "singularity" in turn from μόνος monos, "alone"), has many meanings going back to antiquity. The Pythagoreans called the first thing that came into existence.  Leibniz' used the term to denote an elementary particle. In Category Theory, a Monad is a monoid in the category of endofunctors. <a  href = "https://www.reddit.com/r/haskell/comments/5ez9b1/monoid_in_the_category_of_endofunctors/" target = "_blank">Reddit topic </a></span>
 <span>Another Wikipedia article describes "monad" as "a design pattern that allows structuring programs generically while automating away boilerplate code needed by the program logic."</span>
 <a href = " https://en.wikipedia.org/wiki/Monad_(functional_programming) " target = "_blank">Monad (functional programming)"</a> 
 
 <p>The monads described here are unusual in that they are distinguished from one another by definitions in discrete modules rather than by types. In a less modular framework, alternative names such as "Monad1" and "Monad2" could be used. Like Haskell monads, the monads presented on this site encapsulate chains of computations whose results can be returned whenever they are wanted. Lazy evaluation would be nice, but that is for another day. </p>
 
  <span> A basic unit of perceptual reality is a "monad" in Gottfried Leibniz' </span>
<span style = "font-style: italic"> Monadology </span>
<span>, published in 1714. A single note in music theory is called a monad. </span>

<p>  Many bloggers, lecturers, and authors seem to have definite opinions about the meaning of "monad". I don't use the term the way they do but before I go into that, let's have a glimpse of what the others are saying: </p>
<pre style = "color: #77CCFF ">{jay}</pre >
<a class = tao  href = "https://medium.com/javascript-scene/javascript-monads-made-simple-7856be57bfe8" target = "_blank">JavaScript Monads Made Simple</a> 

<p> Monads in the Haskell Programming Language were inspired by Category Theory monads. The "monads" discussed herein are resemble Haskell monads in that they can be used to isolate pipelines of computations and hold the result for possible later use. Here'<s></s> a very simple monad: </p>

<pre>{monad_}</pre>
<br>
<br>
<br>
<div style = "text-align: center">.</div>



