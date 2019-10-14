
<script>

   import {fade} from "svelte/transition"
   let visible = true;

    import Monad from './Monad.svelte'
    import Monad2 from './Monad2.svelte'
    import Haskell from './Haskell.svelte'
    import Bugs from './Bugs.svelte'
    import Matrix from './Matrix.svelte'
    import Transducer from './Transducer.svelte'
    import Asynchronous_Monad from './Asynchronous_Monad.svelte'
    import ToggleTheme from './ToggleTheme.svelte'
    import Home from './Home.svelte'

    var j = 0

    function monad () {j = 1; console.log(j)};
    function monad2 () {j = 2; console.log(j)};
    function haskell () {j = 3; console.log(j)};
    function bugs () {j = 4; console.log(j)};
    function matrix () {j = 5; console.log(j)};
    function transduce () {j = 6}; console.log(j);
    function async () {j = 7; console.log(j)};
    function tog () {j = 8; console.log(j)};
    function home () {j = 0; console.log(j)};

    $: j

    console.log("j is", j)


</script>

<style>

button {
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

                        <div style = "margin-Right: 2%; width: 20%" >
                        <br><br><br><br><br><br><br>
                        <ul style = "list-style: none;">
                        <li><div class='button'  on:click={matrix}>Why Svelte</div></li>
                        <br>
                        <li><div>MONAD SERIES</div></li>
                        <br>
                        <li><div class='button'  on:click={monad}>A Simple Monad</div></li>
                        <br>
                        <li><div class='button'  on:click={monad2}>Handling Promises in Monads</div></li>
                        <br>
                        <li><div class='button'  on:click={transduce}>Asynchrous Functions</div></li>
                        <br>
                        <li><div class='button'  on:click={async}>Transducer Simulator</div></li>
                        <br>
                        <li><div>MISCELANEOUS TOPICS</div></li>
                        <br>
                        <li><div class='button' on:click={haskell}>Hidden Haskell Information</div></li>
                        <br>
                        <li><div class='button'  on:click={bugs}>Bed Bug Eradication</div></li>
                        <br>
                        <li><div class='button'  on:click={tog}>Toggle Theme</div></li>
                        <br>
                        <li><div class='button'  on:click={home}>Home</div></li>
                        <br>
                        </ul>
                        </div>
                        <div style = "margin-Right: 2%; width: 80%" >
                        <div style=" font-weight: 900; font-size: 45px; color: #bbbb00; text-align: center; ">DAVID SCHALK'S BLOG</div>


{#if j === 0}
		<Home />
{/if}
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
{#if j === 6}
<Asynchronous_Monad />
{/if}
{#if j === 7}
<Transducer />
{/if}
{#if j === 8}
<ToggleTheme />
{/if}


<br><br><br>
</div>
</div>
</div>
<br><br>
