// @ts-check
(function () {
    const style = document.createElement('style');
    style.id = '${scssFilename}_style';
    // @ts-ignore
    style.innerHTML = $css;
    document.head.appendChild(style);
})();
