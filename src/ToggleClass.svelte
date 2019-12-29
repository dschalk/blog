<script>
	let current = 'foo';
     
    export let num;
	export let mod;
	/* we don't need to declare `squared` and `cubed`
	 — Svelte does it for us
	$: squared = num * num;
	$: cubed = squared * num; */

	num = 0;
	mod = 5;

	setInterval(() => {if (mod) num = (num+=1)%mod}, 1000)
	
</script>

<style>
	button {
		display: block;
	}

	.active {
		background-color: #0000FF;
		color: #FF0000;
	}

   
	input {
		width: 50px;
	}
</style>

<p>{num +1}</p>
 <span>Seconds modulo </span>
<input bind:value = {mod} > 

<button
	class:active={current === 'foo'}
	on:click={() => current = 'foo'}
>foo</button>

<button
	class:active={current === 'bar'}
	on:click={() => current = 'bar'}
>bar</button>

<button
	class:active={current === 'baz'}
	on:click={() => current = 'baz'}
>baz</button>
