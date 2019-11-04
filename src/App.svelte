<script>
    import Blog from './Blog.svelte'

    let lock = false;
    $: lock

</script>

<style>
  h1 {
    text-align: center;
  }
</style>

<Blog />
