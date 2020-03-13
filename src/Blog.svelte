<script>

export let j = 0;

import Monad1 from './Monad1.svelte'
import Monad2 from './Monad2.svelte'
import Monad3 from './Monad3.svelte'
import Matrix from './Matrix.svelte'
import Transducer from './Transducer.svelte'
import Home from './Home.svelte'
import Score from './Score.svelte'

function id (v) {return v}

</script>

    <style>
div {
font-style: "Times New Roman";
}

.large {
  font-size: 28px;
  color: #ffffbb;
  text-align: center;
}

.show {   
  position: fixed;
  top: 75px;
  left: 10%;
  width: 16%;
display: inline-block;
background-color: #361B01;
font-size: 34px;
color: #EEF7DD;
}

.stat {
  position:  absolute;
  top: 100px;
  left: 80%;
  width: 10%;
display: inline-block;
background-color: #361B01;
color: #CCFFCC;
font-size: 14px;
}

.dropbtn {
background-color: #361B01;
color: orange;
font-size: 27px;
border: none;
}

.dropdown {
  position: fixed;
  top: 115px;
  left: 10%;
  width: 16%;
display: inline-block;
background-color: #361B01;
}

.dropdown3 {
  position: fixed;
  top: 300px;
  left: 77%;
  width: 16%;
display: inline-block;
background-color: #361B01;
}

.dropdown-content {
font-size: 23px;    
display: none;
position: absolute;
color: sky-blue;    
z-index: 0;
background-color: #361B01;
}

.dropdown3-content {
font-size: 23px;    
display: none;
position: absolute;
color: sky-blue;    
z-index: -1    ;
background-color: #361B01;  
display: block;
color: #DDFFBB      ; 
}

.dropdown-content a:hover {color: gold; background-color: #361B01;}

.dropdown:hover .dropdown-content {display: block; 

background-color:#361B01;}

.dropdown3-content a:hover {color: gold; background-color: #361B01;}

.dropdown3:hover .dropdown3-content {display: block; 

background-color:#361B01;}



.dropbtn {color: gold; background-color: #361B01;}

</style>
<div style = "font-size: 58px; color: #FFD700; text-align: center">Powerful JavaScript Monads</div>
<div style = "font-size: 32px; color: #FFBBBB; font-style:italic; text-align: center; margin-left: 27%; margin-right: 27%" > Asynchronously link functions, primitive values, and objects of all types with recursive closures. </div> 


<div class = stat>
<div>A Svelte front-end with a</div>
<div>Haskell WebSockets server</div>
<br>
<div >David E. Schalk</div>  
<div>fp3216@protonmail.com</div>
<div>https://github.com/dschalk</div>
</div>
<div class="dropdown">
<br>
  <div class="dropbtn">Table of Contents</div>
  <div class="dropdown-content">
  <br>
<div class = menu on:click = {() => j = 0}> Home</div>
  <br>
<div class = menu on:click = {() => j = 1}> A Simple Monad</div>
  <br>
<div class = menu on:click = {() => j = 2}> A Messaging Monad</div>
  <br>
<div class = menu on:click = {() => j = 3}> A Promises Monad</div>
  <br>
<div class = menu on:click = {() => j = 5}> Why Svelte>
  <br>
  <br></div>>

  </div>
</div>


<div style = "margin-left: 25%; margin-right: 25%;">

 <br>

{#if j === 0}
<div class = show>Home</div>
<Home />
{/if}
{#if j === 1}
<div class = show>Simple Monad</div>
<Monad1 />
{/if}
{#if j === 2}
<div class = show>Messages Monad</div>
<Monad2 />
{/if}
{#if j === 3}
<div class = show>Promises Monad</div>
<Monad3 />
{/if}
{#if j === 4}
<div class = show>Transducer Monad</div>
<Transducer />
{/if}
{#if j === 5}
<div class = show>Why Svelte</div>
<Matrix />
{/if}


</div>
<br><br>
<slot />

<br><br>
<br><br>
<br><br>



