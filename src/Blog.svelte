<script>

export let j = 0;

import Cow from './Cow.svelte'
import Drop1 from './Drop1.svelte'
import Drop2 from './Drop2.svelte'
import Drop3 from './Drop3.svelte'
import Drop4 from './Drop4.svelte'
import Drop5 from './Drop5.svelte'
import Monad from './Monad.svelte'
import Monad2 from './Monad2.svelte'
import Monad3 from './Monad3.svelte'
import Haskell from './Haskell.svelte'
import Bugs from './Bugs.svelte'
import Matrix from './Matrix.svelte'
import Transducer from './Transducer.svelte'
import ToggleClass from './ToggleClass.svelte'
import ToggleTheme from './ToggleTheme.svelte'
import Home from './Home.svelte'
import Score from './Score.svelte'
import Stor from './Stor.svelte'
import Snack from './Snack.svelte'
import Cargo from './Cargo.svelte'
function id (v) {return v}

</script>




<style>
body {
font: "Times New Roman";
}

.dropbtn {
background-color: #361B01;
color: orange;
font-size: 28px;
border: none;
}

.dropdown {
  position: fixed;
  top: 200px;
  left: 10%;
  width: 16%;
display: inline-block;
background-color: #361B01;
}

.dropdown-content {
display: none;
position: absolute;
color: sky-blue;    
z-index: 1;
background-color: #361B01;
}
.dropdown-content a {
color: yellow;
padding: 12px 16px;
text-decoration: none;
display: block;
background-color: #361B01;
}

.dropdown-content a:hover {color: gold; background-color: #361B01;}

.dropdown:hover .dropdown-content {display: block; background-color: #361B01;}

.dropbtn {color: gold; background-color: #361B01;}

.menu {}
.menu:hover {color: orange}
</style>



<br>
<!-- <div style = "display: flex">
<div style = "width 20%; margin-right: 2%"> -->

<div class="dropdown">
  <div class="dropbtn">Table of Contents</div>
  <div class="dropdown-content">
<div class = menu on:click = {() => j = 1}> A Simple Monad</div>
<div class = menu on:click on:click = {() => j = 2}> A Messaging Monad</div>
<div class = menu on:click on:click = {() => j = 3}> A Promises Monad</div>
  </div>
</div>


<!--  
<div on:click = {() => j = 1}> A Simple Monad</div>
<div on:click = {() => j = 2}> A Messaging Monad</div>
<div on:click = {() => j = 3}> A Promises Monad OUOIU OIUIUIO HJHKHKI DSDFDFH 234 HJHKHKI</div>
  </div>
<div style = "width: 70%; margin-right: 2%"> -->
<!-- <div on:click = {() => j = 3}> A Promises Monad</div>
<div>
</div>

        <ul >
            <div>VARIATIONS ON THE MONAD THEME</div>
            <li class='button' on:click={() => {j = 1; console.log("j is", j)}}>A Simple Monad</li>>
            <li class='button' on:click={() => {j = 2; console.log("j is", j)}}>Message Monad</li>
            <li class='button' on:click={() => {j = 3; console.log("j is", j)}}>Promise Monad</li>
            <li class='button' on:click={() => {j = 7; console.log("j is", j)}}>Transducer Simulator</li>
            <li class='button' on:click={() => {j = 10; console.log("j is", j)}}>React Interactive Game of Score</li>
        </ul>
        
        <ul>

        <li><div>MISCELLANEOUS TOPICS</div></li>
        <li class='button'  on:click={() => j = 5}> Why Svelte</li>
        <li class='button' on:click={() => {j = 9; console.log("j is", j)}}>Hidden Haskell Informationx</li>
        <li class='button' on:click={() => {j = 4; console.log("j is", j)}}>Bed Bugs</li>
        <li class='button' on:click={() => {j = 0; console.log("j is", j)}}>Home</li>
        <li class='button' on:click={() => {j = 23; console.log("j is", j)}}>StoreDemo</li>
        </ul>
        <ul>
        <li><div>SVELTE SNIPPETS</div></li>
        <li class='button' on:click={() => {j = 8; console.log("j is", j)}}>Toggle Theme</li>
        <li class='button' on:click={() => {j = 11; console.log("j is", j)}}>Toggle Class</li>
        <li class='button' on:click={stor}>Stor</li>
        <li class='button' on:click={snack}>Snack</li>
        <li class='button' on:click={cargo}>Cargo</li>
            <li class='button' on:click={() => {j = 40; console.log("j is", j)}}>Drop1</li>
            <li class='button' on:click={() => {j = 41; console.log("j is", j)}}>Drop2</li>
            <li class='button' on:click={() => {j = 42; console.log("j is", j)}}>Drop3</li>
            <li class='button' on:click={() => {j = 43; console.log("j is", j)}}>Drop4</li>
            <li class='button' on:click={() => {j = 44; console.log("j is", j)}}>Drop5</li>
            
            
        <br>
        </ul>
        </div>  -->                                                         
        <div class = margins>

<div style = "margin-left: 25%; margin-right: 25%;">

<div style = "font-size: 40px; color: #FFD700; text-align: center">DAVID SCHALK's BLOG</div>
<div style = "font-size: 24px; color: #FFCCAA; font-style: italic; text-align: center">Escape from a Cargo Cult and Other Adventures </div>
<br><br><br> 

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
<Monad3 />
{/if}
{#if j === 4}
<Bugs />
{/if}
{#if j === 5}
<Matrix />
{/if}
{#if j === 7}
<Transducer />
{/if}
{#if j === 8}
<ToggleTheme />
{/if}
{#if j === 9}
<Haskell />
{/if}
{#if j === 10}
<Score />
{/if}
{#if j === 11}
<ToggleClass />
{/if}
{#if j === 20}
<Cow />
{/if}
{#if j === 21}
<Stor />
{/if}
{#if j === 22}
<Snack />
{/if}
{#if j === 23}
<Cargo />
{/if}
{#if j === 40}
<Drop1 />
{/if}
{#if j === 41}
<Drop2 />
{/if}
{#if j === 42}
<Drop3 />
{/if}
{#if j === 43}
<Drop4 />
{/if}
{#if j === 44}
<Drop5 />
{/if}
</div>
<br><br>
<slot />
</div>
<pre>



...
</pre>



