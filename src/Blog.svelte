
<script>
    import Monad from './Monad.svelte'
    import Monad2 from './Monad2.svelte'
    import Haskell from './Haskell.svelte'
    import Bugs from './Bugs.svelte'
</script>

<style>

</style>


<h1>David's Blog</h1>
<div id = 'content'>
<p> This will be a repository for all sorts of things, but mainly ideas and techniques related to computer programming.  David Schalk, August 13, 2019 </p>
<a href = "http://schalk.site" target = "_blank" > JavaScript and Functional Programming </a>
<p> This is a Svelte application. I liked Cycle.js a lot more than React, but Svelte is now my framework of choice. I code modules in plain HTML. There is no need for a Virtual DOM. The code is at </p>
<a href = "https://github.com/dschalk/game2">blog repository</a>
<p> Click the caption (above) to see the current version of a project I started three years agp. The front end operates in a Cycle.js framework and the back end in a modified Haskell Wai WebSockets server. </p>
<p> I started the project to show the utility of the little "monads" I defined. These were objects "m" that held a value "x" and a method "bnd" such that m.bnd(func) for some function "func" a new monad named "m" as before holding a value named "x" === func(x). Each new "m" was actually a clone that appropriated the name "m" and changed the x value to func(x), leaving leaving the previous "m" intact and persistent as long as there was a reference to it, as a member of an array for example. </p>
<span> Presently I am inclined to mutate objects if I don\'t need the old version. I don\'t like to unnecessarily leave debris for the garbage collector. I do this knowing that some people will think less of my programming expertise. See  </span>
<a href = "http://cloudingmine.com/avoid-javascript-object-mutation-at-all-costs/ " target = "_blank"> Avoid JavaScript object mutation at all costs </a>
<p> Haskell MVar and TMVar monads are objects with values that get removed and replaced. This isn\'t mutation in Haskell, but changing a methods or attributes in objects is mutation in JavaScript. In Haskell, changes that take place in the IO, State, and are no cause for concern if the results are sent away from the main body of programs. JavaScript mutations whose side effects do not occur in the main body of programs don\'t worry me, although browser engine optimization might be a concern. </p>
<Monad />
<Monad2 />
<Haskell />
<Bugs />
</div>
