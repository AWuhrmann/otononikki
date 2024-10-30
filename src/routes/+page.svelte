<script>
    import svelteLogo from '../assets/svelte.svg'
    import viteLogo from '/vite.svg'
    import Counter from '../lib/Counter.svelte'
    import Header from '../components/header.svelte'
    import Journal from '../components/Journal.svelte';
    import Stats from '../components/Stats.svelte';
    import Tabs from '../components/Tabs.svelte';

    let items = [
        { label: 'Recorder', value: 1, component: Journal },
        { label: 'Stats', value: 2, component: Stats },
    ]
</script>

<main>
    <div class="container">
        <!-- <div class="content">
            <div class="tab-container">
                <Tabs {items} />
            </div>
        </div> -->
    </div>
</main>

<style>
    main {
    min-height: 20vh;
    display: flex;
    flex-direction: column;
    font-family: "Inter", Arial;
    justify-content: center;
    align-items: center;
    overflow-y: hidden;
    height: 100vh;
    margin: 0;
    padding: 0;
    }

    .container {
        width: 100%;
    }
</style>
