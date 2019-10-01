
<script>
import {fade} from "svelte/transition"
let visible = true;


    import Monad from './Monad.svelte'
    import Monad2 from './Monad2.svelte'
    import Haskell from './Haskell.svelte'
    import Bugs from './Bugs.svelte'
    import Matrix from './Matrix.svelte'
    import Home from './Home.svelte'
    import Asynchronous_Monad from './Asynchronous_Monad.svelte'
    import Transducer from './Transducer.svelte'

    var j = 0

    function monad () {j = 1};
    function monad2 () {j = 2};
    function haskell () {j = 3};
    function bugs () {j = 4};
    function matrix () {j = 5};
    function transduce () {j = 6};
    function async () {j = 7};
    function home () {j = 0};

$: j
</script>

<style>
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
<div class="content2">
<br><br>
<div style=" font-weight: 900; font-size: 45px; color: #bbbb00; text-align: center; ">DAVID SCHALK'S HOMEMADE BLOG</div>

                        <div style = "display: flex">
                        <div style = "margin-Left: 2%; width: 50%" >

 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
INITIAL POST

 </div>
<p> This blog is a place for me to store ideas that I don't want to forget, and which I hope at least some people will find thought provoking, informative, or just interesting. I'll mostly write about computer programming, but already there is a post on bed bug eradication. I practiced law for twenty-three years, so there will probably be some posts related to that. My undergraduate degree is in chemistry and when I was the city of Bloomington, Indiana's "City Chemist", I was in the center of some intense drama involving public safety and governmental skulduggery. </p>
<p> This blog has characteristics of a journal and of my momoirs. But is mostly about computer programming, with special attention to web development, functional and reactive programming, and my experiences with IBM's public access quantum computer and other quantum computers that provide free online access.  </p>
                        </div>
                        <div style = "marginRight: 2%; width: 50%;">
<br><br><br><br>
<ul style = "list-style: none;">
<li><button on:click={monad}>A Simple Monad</button></li>
<li><button on:click={monad2}>A Swiss Army Knife Monad</button></li>
<li><button on:click={haskell}>Hidden Haskell Information</button></li>
<li><button on:click={bugs}>100% Effectove Non-Toxic Bed Bug Eradication</button></li>
<li><button on:click={matrix}>Beauty of Svelte</button></li>
<li><button on:click={transduce}>Asynchrous Functions</button></li>
<li><button on:click={async}>Transducer Simulator</button></li>
<li><button on:click={home}>Home</button></li>
</ul>
</div>
</div>
<div style = "display: block; margin-left: auto; margin-right: auto; width: 50%;">
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
  <Transducer />
{/if}
{#if j === 7}
  <Asynchronous_Monad />
{/if}


<br><br><br>
</div>
</div>
</div>
<br><br>
