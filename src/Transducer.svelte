<script>
import {fade} from "svelte/transition"
let visible = true;


</script>

{#if visible}
 <div style = "font-family: Times New Roman;  text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
TRANSDUCER SIMULATION
 </div>
{/if}
<p> Howdy folks </p>
