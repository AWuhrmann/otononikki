<script lang="ts">
  import { page } from "$app/stores"
  import { SignIn, SignOut } from "@auth/sveltekit/components"

  import {
    Notebook,
    House,
    ChartColumnStacked,
    LogOut,
    LogIn,
  } from "lucide-svelte"
</script>

<header>
  <div class="signedInStatus">
    <div class="nojs-show loaded">
      <img
        alt="User avatar"
        src={$page.data?.session?.user?.image ??
          `https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.floor(Math.random() * 100000) + 1}&randomizeIds=true`}
        class="avatar"
      />
      <nav>
        <ul class="navItems my-auto">
          <li class="navItem"><a href="/"><House /></a></li>
          <li class="navItem"><a href="/protected"><Notebook /></a></li>
          <li class="navItem"><a href="/stats"><ChartColumnStacked /></a></li>
        </ul>
      </nav>
      {#if $page.data.session}
        <span class="signedInText pr-10">
          {$page.data.session.user?.email ?? $page.data.session.user?.name}
        </span>
        <SignOut>
          {#snippet submitButton()}
            <LogOut />
          {/snippet}
        </SignOut>
      {:else}
        <span class="notSignedInText">You are not signed in</span>
        <SignIn>
          {#snippet submitButton()}
            <LogIn />
          {/snippet}
        </SignIn>
      {/if}
    </div>
  </div>
</header>

<style>
  .nojs-show {
    opacity: 1;
    top: 0;
  }
  .signedInStatus {
    display: block;
    min-height: 4rem;
  }
  .loaded {
    position: relative;
    top: 0;
    opacity: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    border-radius: 0 0 0.6rem 0.6rem;
    padding: 0.6rem 1rem;
    margin: 0;
    border-bottom: 1px solid rgba(83, 83, 83, 0.5);
    transition: all 0.2s ease-in;
  }
  .signedInText,
  .notSignedInText {
    justify-content: end;
    padding-left: 1rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inherit;
    line-height: 1.3rem;
    flex: 1;
  }
  .signedInText {
    padding-top: 0rem;
    left: 4.6rem;
  }
  .avatar {
    border-radius: 2rem;
    margin-right: 30px;
    float: left;
    height: 2.8rem;
    width: 2.8rem;
    background-color: white;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .buttonPrimary {
    font-weight: 500;
    border-radius: 0.3rem;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.4rem;
    position: relative;
    justify-self: end;
    background-color: #346df1;
    color: #fff;
    text-decoration: none;
    padding: 0.7rem 1.4rem;
  }
  .buttonPrimary:hover {
    box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.2);
  }
  .navItems {
    display: flex;
    flex-direction: row;
    justify-items: flex-start;
    gap: 20px;
    margin-left: 20px;
    padding: 0;
    list-style: none;
  }
  .navItem {
    display: inline-block;
    margin-right: 1rem;
    font-size: 20px;
    font-weight: bold;
    color: rgb(85, 85, 85);
  }
  :global(form button) {
    border: none !important;
  }
</style>
