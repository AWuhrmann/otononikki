<script lang="ts">
  import { SignIn } from "@auth/sveltekit/components";

  export let data;
  const { session } = data;
</script>

<main>
  <h1>SvelteKit Auth Example</h1>
  <p>
    This is an example site to demonstrate how to use <a
      href="https://kit.svelte.dev/">SvelteKit</a
    >
    with <a href="https://sveltekit.authjs.dev">SvelteKit Auth</a> for authentication.
  </p>
  <p>Your role: {session.user.role}</p>
  <SignIn>
    <div slot="submitButton" class="buttonPrimary">Sign in</div>
  </SignIn>
</main>

<style>
  main {
    flex: 1;
  }
</style>
