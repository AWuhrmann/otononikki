<script>
    export let name;
    export let picture;
</script>

<label class="card">
    <input class="card__input" type="checkbox" />
    <div class="card__body">
        <header class="card__body-header">
            <h2 class="card__body-header-title">{name}</h2>
            <p class="card__body-header-subtitle">{name}</p>
        </header>
        <div class="card__body-cover"><img alt="image of {name}" class="card__body-cover-image" src={picture}/><span
                class="card__body-cover-checkbox">
                <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </svg></span>
        </div>
    </div>
</label>