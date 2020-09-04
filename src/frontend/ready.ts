const ready = (fn) => {
    if ('loading' !== document.readyState) {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

export default ready
