import ready from '../ready'

const updateLinks = () => {
    const from: any = document.getElementById('select-from')
    const to: any = document.getElementById('select-to')
    const fromId = from.selectedIndex
    const fromName = from.value
    const toId = to.selectedIndex
    const toName = to.value
    const kmlLink = document.getElementById('kml-link')
    const mapLink = document.getElementById('map-link')
    kmlLink.setAttribute('href', [
        process.env.SERVER_PREFIX,
        'download-map',
        [fromId, toId].join('-'),
        `kektura--${[fromName, toName].join('--')}`,
    ].join('/'))
    mapLink.setAttribute('href', [
        process.env.SERVER_PREFIX,
        'map',
        [fromId, toId].join('-'),
        `${[fromName, toName].join('--')}`,
    ].join('/'))
}

ready(() => {
    const domq = document.getElementsByClassName('hike-select')
    const selects = [domq[0], domq[1]]
    const fromOption: HTMLOptionElement = document.querySelector(
        '#select-from option[value="dobogoko"]'
    )
    const toOption: HTMLOptionElement = document.querySelector(
        '#select-to option[value="nagymaros"]'
    )
    const fromSelect: HTMLSelectElement = document.querySelector('#select-from')
    const toSelect: HTMLSelectElement = document.querySelector('#select-to')
    fromSelect.selectedIndex = fromOption.index
    toSelect.selectedIndex = toOption.index
    selects.forEach((select) => {
        select.addEventListener('change', updateLinks)
    })
    updateLinks()
})
