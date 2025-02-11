<script lang="ts">
  import { page } from "$app/state";
  import { SignIn, SignOut } from "@auth/sveltekit/components";

  import {
    Notebook,
    House,
    ChartColumnStacked,
    LogOut,
    LogIn,
  } from "lucide-svelte";
</script>

<header>
  <div class="min-h-16 border-b border-gray-300">
    <div class="h-full relative flex items-center bg-white px-4 py-3 pl-48">
      <nav>
        <ul class="flex flex-row items-center gap-5 ml-5 p-0 list-none">
          <li class="text-gray-600 font-bold">
            <a href="/" class="flex items-center gap-2">
              <House />
              <span>Home</span>
            </a>
          </li>
          <li class="text-gray-600 font-bold">
            <a href="/protected" class="flex items-center gap-2">
              <Notebook />
              <span>Notes</span>
            </a>
          </li>
          <li class="text-gray-600 font-bold">
            <a href="/stats" class="flex items-center gap-2">
              <ChartColumnStacked />
              <span>Statistics</span>
            </a>
          </li>
        </ul>
      </nav>

      {#if page.data.session}
        <div class="flex-1 flex justify-end items-center">
          <span class="signedInText pr-10">
            {page.data.session.user?.email ?? page.data.session.user?.name}
          </span>
          <button
            class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign out <SignOut>
              {#snippet submitButton()}
                <LogOut />
              {/snippet}
            </SignOut>
          </button>
        </div>
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
