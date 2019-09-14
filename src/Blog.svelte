
<script>
    import Monad from './Monad.svelte'
    import Monad2 from './Monad2.svelte'
    import Haskell from './Haskell.svelte'
    import Bugs from './Bugs.svelte'
    import Matrix from './Matrix.svelte'

    let j = 0;

    function monad () {j = 1};
    function monad2 () {j = 2};
    function haskell () {j = 3};
    function bugs () {j = 4};
    function matrix () {j = 5};
    var code = `
        import Monad from './Monad.svelte'
        import Monad2 from './Monad2.svelte'
        import Haskell from './Haskell.svelte'
        import Bugs from './Bugs.svelte'
        import Matrix from './Matrix.svelte'

        let j = 0;

        function monad () {j = 1};
        function monad2 () {j = 2};
        function haskell () {j = 3};
        function bugs () {j = 4};
        function matrix () {j = 5};

        <button on:click={monad}>A Simple Monad</button>
        <br>
        <br>
        <button on:click={monad2}>A Swiss Army Knife Monad</button>
        <br>
        <br>
        <button on:click={haskell}>Hidden Haskell Information</button>
        <br>
        <br>
        <button on:click={bugs}>100% Effectove Non-Toxic Bed Bug Eradication</button>
        <br>
        <br>
        <button on:click={matrix}>Beauty of Svelte</button>


        {#if j === 1}
        			<Monad />
        {/if}

        {#if j === 2}
          <Monad2 />
        {/if}

        {#if j === 3}
          <Haskell />
        {/if}

        {#if j === 4}
          <Bugs />
        {/if}

        {#if j === 5}
          <Matrix />
        {/if} `
</script>

<style>

</style>


<h1>David's Blog</h1>
<div id = 'content'>
<span class = tao> The topics in this blog pertain mostly to computer programming. JavaScript and Haskell are my favorite languages.</span>
<a href = "https://svelte.dev/"  target = "_blank">Svelte</a>
<span>, upon which this website rests, is my choice for front-end web development. The code for this site is at </span>
<a href = "https://github.com/dschalk/game2">blog repository</a>
<span> -- David Schalk </span>
<br>
<br>
<h3>JavaScript and Functional Programming</h3>
<span class = tao> The current version of a project I started several years ago is now called </span>
<a href = "http://schalk.site" target = "_blank" > JavaScript and Functional Programming </a>
<span> The front end operates in a Cycle.js framework and the back end in a modified Haskell Wai WebSockets server. </span>
<span> Before that, my front end was the React framework. I wrote an elaborate program named </span>
<a href = "http://game.schalk.site" target = "_blank">Websockets Game of Score" </a> <span> that uses the Websockets server I use today in an expanded form that accomodates subsequent projects. <span>
<p> I started the JavaScript and Functional Programming project to show the utility of the little "monads" I defined in various ways. These were objects "m" that held a value "x" and a method "bnd" such that m.bnd(func) for some function "func" made "m" point to a new monad whose x value was func(old x). The old monad persisted as long as there was a reference to it, as when it was an item in an array. I didn't mind mutating the name m, but in order to preserve a record of the mutations, m.x was never mutated.</p>
<span class = tao> Presently I am inclined to mutate objects if I don\'t need the old version, and that is rearely the case. I don\'t like to unnecessarily leave debris for the garbage collector. I do this knowing that some people will think less of my programming abilities. See  </span>
<a href = "http://cloudingmine.com/avoid-javascript-object-mutation-at-all-costs/ " target = "_blank"> Avoid JavaScript object mutation at all costs </a>
<span> Well, you know what if they can't take a joke. </span>
<p> Haskell MVar and TMVar monads are objects with values that get removed and replaced. This isn\'t mutation in Haskell, but changing methods or attributes in objects is considered mutation in JavaScript. Go figure. </p>
<p> Thoughts of using immutable data or strict typing in JavaScript programs have perished now that I am using Svelte. Variables in Svelte's small modules can't clash with one another (unless one is embedded in another); and one would have to be nine-tenths asleep to fail to notice clashes inside of a small module. Consequences of mutations are certainly easy to see. Working in Svelte is pleasantly relaxing. </p>
<p> Here's the code that makes the buttons below work: </p>
<pre>{code}</pre>
<br>
<button on:click={monad}>A Simple Monad</button>
<br>
<br>
<button on:click={monad2}>A Swiss Army Knife Monad</button>
<br>
<br>
<button on:click={haskell}>Hidden Haskell Information</button>
<br>
<br>
<button on:click={bugs}>100% Effectove Non-Toxic Bed Bug Eradication</button>
<br>
<br>
<button on:click={matrix}>Beauty of Svelte</button>

{#if j === 1}
			<Monad />
{/if}

{#if j === 2}
  <Monad2 />
{/if}

{#if j === 3}
  <Haskell />
{/if}

{#if j === 4}
  <Bugs />
{/if}

{#if j === 5}
  <Matrix />
{/if}
<br>
<br>

{#if j === 0}
<p> Clicking the buttons changes the value of j. j is the gate keeper in the #if statements. This is quite elegant, and all the credit goes to Svelte.</p>
{/if}
<br>
<br>
<br>
<br>
</div>
