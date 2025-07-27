<script lang="ts">
  import { page } from "$app/state";
  import { SignIn, SignOut } from "@auth/sveltekit/components";

  import {
    Notebook,
    WalletCards,
    Contact,
    NotebookPen,
    House,
    ChartColumnStacked,
    LogOut,
    LogIn,
  } from "lucide-svelte";
</script>

<header class="relative">
  <div class="border-b border-gray-300">
    <div class="flex bg-white px-4 items-center justify-between">

      <!-- Left: Logo -->
      <div class="w-1/4 flex items-center">
        <h1 class="text-xl font-bold text-gray-800">otononikki</h1>
      </div>

      <!-- Center: Nav -->
      <nav class="w-1/2 flex justify-center py-2">
        <ul class="flex flex-wrap justify-between w-full max-w-full list-none">
          <li class="text-gray-600 font-bold">
            <a href="/" class="flex items-center gap-2 transition delay-30 ease-in-out hover:bg-gray-100 p-2 rounded-md pr-4">
              <House />
              <span>Home</span>
            </a>
          </li>
          {#if page.data.session}
            <li class="text-gray-600 font-bold">
              <a href="/notes" class="flex items-center gap-2 transition delay-30 ease-in-out hover:bg-gray-100 p-2 rounded-md pr-4">
                <Notebook />
                <span>Notes</span>
              </a>
            </li>
            <li class="text-gray-600 font-bold">
              <a href="/stats" class="flex items-center gap-2 transition delay-30 ease-in-out hover:bg-gray-100 p-2 rounded-md pr-4">
                <ChartColumnStacked />
                <span>Statistics</span>
              </a>
            </li>
            <li class="text-gray-600 font-bold">
              <a href="/contacts" class="flex items-center gap-2 transition delay-30 ease-in-out hover:bg-gray-100 p-2 rounded-md pr-4">
                <Contact />
                <span>Contacts</span>
              </a>
            </li>
            <li class="text-gray-600 font-bold">
              <a href="/cards" class="flex items-center gap-2 transition delay-30 ease-in-out hover:bg-gray-100 p-2 rounded-md pr-4">
                <WalletCards />
                <span>Cards</span>
              </a>
            </li>
          {/if}
        </ul>
      </nav>

      <!-- Right: Auth -->
      <div class="w-1/4 flex justify-end items-center">
        {#if page.data.session}
          <span class="signedInText pr-4">
            <!-- {page.data.session.user?.name} -->
          </span>
          <SignOut>{#snippet submitButton()}
            <button
            class="flex items-center gap-2 bg-gray-0 text-white px-4 py-2 rounded hover:bg-gray-100"
            >
            <span class="text-gray-800 font-bold">Sign out</span>
            <LogOut class="text-gray-800 font-bold"/>
          </button>
          {/snippet}</SignOut>
        {:else}
          <SignIn>
            {#snippet submitButton()}
              <button
                class="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                <span class="notSignedInText">You are not signed in</span>
                <LogIn/>
              </button>
            {/snippet}
          </SignIn>
        {/if}
      </div>
    </div>
  </div>
</header>
