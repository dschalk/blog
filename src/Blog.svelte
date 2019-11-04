
<script>

   import {fade} from "svelte/transition"
   let visible = true;



    import Monad from './Monad.svelte'
    import Async from './Asynchronous_Monad.svelte'
    import Promises from './Promises_Monad.svelte'
    import Haskell from './Haskell.svelte'
    import Bugs from './Bugs.svelte'
    import Matrix from './Matrix.svelte'
    import Transducer from './Transducer.svelte'
    import ToggleTheme from './ToggleTheme.svelte'
    import Home from './Home.svelte'
    import Blank from './Blank.svelte'
    import Score from './Score.svelte'
    import Theme from './ToggleTheme.svelte'

    var j = 0;
    $: j;

    function home () {j = 0; console.log(j)};
    function monad () {j = 1; console.log(j)};
    function async () {j = 2; console.log(j)};
    function promises () {j = 3; console.log(j)};
    function transducer () {j = 4}; console.log(j);
    function score () {j = 5; console.log(j)};
    function haskell () {j = 6; console.log(j)};
    function bugs () {j = 7; console.log(j)};
    function matrix () {j = 8; console.log(j)};
    function blank () {j = 9; console.log(j)};
    function theme () {j = 10; console.log(j)};


</script>

<style>
div {
   font-size: 18px;
   color: #bccbaa;
}

.gamma {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

  ul {  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  list-style: none;
  }

  tao {
    margin-left: 3%;
  }

  .narrow {
    font-family: monospace;
    font-size: 22px;
    margin-left: auto;  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
    margin-right: auto;
    display: block;
    text-indent: 1.6%;
  }
</style>

<div class="content">
<br><br>

            <div style = "display: flex">
            <div style = "margin-Left: 2%; width: 20%" >

                        <br><br><br><br><br><br><br>
                        <ul style = "list-style: none;">
                        <li><div class='button'  on:click={() => j = 8}>Svelte Demo</div></li>
                        <br>
                        <li><div>MONAD SERIES</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j = 1; console.log("j is", j)}}>A Simple Monad</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=2; console.log("j is", j)}}>Asynchronous Monads</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=3; console.log("j is", j)}}>Promises Monad</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 4; console.log("j is", j)}}>Transducer Simulator</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=5; console.log("j is", j)}}>Game of Score</div></li>
                        <br>

                        <li>e<div>MISCELANEOUS TOPICS</div></li>
                        <br>
                        <li><div class='button' on:click={()=>{j=6; console.log("j is", j)}}>Haskell Tip</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 7; console.log("j is", j)}}>Bed Bug Eradication</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 0; console.log("j is", j)}}>Home</div></li>
                        <br>
                        <li><div class='button' on:click={() => {j = 9; console.log("j is", j)}}>Blank</div></li>
                        <br>
                        <li><div class='button' on:click={theme}>Toggle Theme</div></li>
                        <br>
                        </ul>
                        </div>
                        <div style = "margin-Right: 2%; width: 80%" >
                        <div style=" font-weight: 900; font-size: 45px; color: #bbbb00; text-align: center; ">DAVID SCHALK'S BLOG</div>
            </div>
            <div style = "margin-Right: 2%; width: 80%" >
{#if j === 0}
		<Home />
{/if}

{#if j === 1}
<Monad />
{/if}

{#if j === 2}
  <Async />
{/if}

{#if j === 3}
<Promises />
{/if}

{#if j === 4}
<Tranducer />
{/if}

{#if j === 5}
<Score />
{/if}

{#if j === 6}
<Haskell />
{/if}

{#if j === 7}
<Bugs />
{/if}

{#if j === 8}
<Matrix />
{/if}

{#if j === 9}
<Blank />
{/if}

{#if j === 10}
<Theme />
{/if}


<br><br><br>
</div>
</div>
</div>
<br><br>
