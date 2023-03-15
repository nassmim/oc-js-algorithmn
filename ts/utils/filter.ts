// --------------- FICHIER DE CONTRÔLE DES FONCTIONNALITES DE RECHERCHE ET FILTRE PAR TAG ---------------

const filterDropdowns = document.getElementsByClassName('filter-dropdown') as HTMLCollection,
    filterDropdownsArray = Array.from(filterDropdowns)

const filterTags = document.querySelector('.filters__tags') as HTMLElement

function initBehaviour() {
    
    filterDropdownsArray.forEach(filterDropdown => {
    
        filterDropdown.addEventListener('click', () => {
            filterDropdown.classList.add('filter-dropdown--open')
        })
    })
}


function addTag(tagName: string): void {
    const tagElement = createTag(tagName)
    filterTags.appendChild(tagElement)
}


function createTag(tagName: string): HTMLElement {

    const tagElement: HTMLElement = document.createElement('div')

    const elementInnerHTML: string = `

        <div class="tag">
            <p class="tag__name">${tagName}</p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_51_0)">
                <path d="M14.59 8L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41L14.59 8ZM12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
                </g>
                <defs>
                <clipPath id="clip0_51_0">
                <rect width="24" height="24" fill="white"/>
                </clipPath>
                </defs>
            </svg>
        </div>
    `

    tagElement.innerHTML = elementInnerHTML

    return tagElement

}

export { initBehaviour }