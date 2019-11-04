
<script>
   import {fade} from "svelte/transition"
   let visible = true;

import Monad from './Monad.svelte'
import Async from './Asynchronous_Monad.svelte'
import Promises from './Promises_Monad.svelte'
import Transducer from './Transducer.svelte'
import Haskell from './Haskell.svelte'
import Bugs from './Bugs.svelte'
import Matrix from './Matrix.svelte'
import ToggleTheme from './ToggleTheme.svelte'
import Home from './Home.svelte'
import Score from './Score.svelte'
import Game2 from './Game2.svelte'
import Blank from './Blank.svelte'

    var j = 0;
    $: j;

                        <li><div class='button' on:click={()=>j=0}>Home</div></li>
                        <br>
                        <li><div class='button' on:click={()=>j=11}>Cycle.js game</div></li>s
                        <br>
                        </ul>
                        </div>
                        <div style = "margin-Right: 2%; width: 80%" >
                        <div style=" font-weight: 900; font-size: 45px; color: #bbbb00; text-align: center; ">DAVID SCHALK'S BLOG</div>


{#if j !== 0}
<Blank />
{:else}
		<Home />
{/if}


{#if j === 1}
{#if j !== 0}
<Blank />
{:else}
<Monad />
{/if}

{#if j === 2}
{#if j !== 0}
<Blank />
{:else}
<Async />
{/if}

{#if j === 2}
{#if j !== 0}
<Blank />
{:else}

<Blank />
{#if j !== 0}
<Blank />
{:else}
{/if}

{#if j === 3}
{#if j !== 0}
<Blank />
{:else}

<Promises />
{/if}

{#if j === 4}
<Transducer />
{/if}

{#if j === 5}
{#if j !== 0}
<Blank />
{:else}
<Matrix />
{/if}

{#if j === 6}
{#if j !== 0}
<Blank />
{:else}
<Haskell /> {/if}

{#if j === 7}
{#if j !== 0}
<Blank />
{:else}
Bugs />
{/if}

{#if j === 10}
{#if j !== 0}
<Blank />
{:else}
<Score />
{/if}

{#if j === 11}
{#if j !== 0}
<Blank />
{:else}
<Game2/>
{/if}

{#if j === 8}
{#if j !== 0}
<Blank />
{:else}
<ToggleTheme />
{/if}

<br><br><br>
{#if j !== 0<Blank />
{:else}
</div>
</div>
</div>
-->

<br><br>
