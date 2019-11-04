<script>
import {fade} from "svelte/transition"
let visible = true;
</script>

{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
 <br><br>
 AN INTERACTIVE GAME, TO-DO LIST, AND CHAT
 </div>
{/if}

<br>
<p> The interactive application is written in the Cycle.js framework. Users can join or create groups. Everyone signed into a group shares a common todo list and message board, and they all see the same scoreboard and dice rolls.</p>
<span class = "tao"> The application is included in the monad section because of its heavy reliance on monads. It is available online at </span>
<a href = "http://game2.schalk.site" target = "_blank" >Game</a>
<span>. The code is at </span>
<a href = "https://github.com/dschalk/game2" target = "_blank"> Repository</a>
<span>.</span>
<p> The modified Haskell Wai WebSockets server generates pseudo-random numbers for the dice rolls, provides permanent storage for user names and passwords, comments, and each group's to-do list. It also assures that game play, text messaging, and changes to to-do lists occur within the confines of each group. Haskell pattern matching made it very easy to code group specific activities. </p>
