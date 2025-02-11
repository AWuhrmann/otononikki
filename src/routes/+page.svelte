<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components"

  let { data } = $props()
  const { session } = data
</script>

<main>
  <div class='m-10 w-1/2'>
    <p class='text-2xl text-center '> Welcome back, {session?.user.username} </p>
  </div>
</main>

<style>
  :global(body) {
    background-color: #f7f8fa;
    margin: 0;
  }
</style>
