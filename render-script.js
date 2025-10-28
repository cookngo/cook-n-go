const version = "v0.2.1"

function renderFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <p>2025 Cook N Go <span style="font-size: 0.9rem;">(made with Spoonacular API)</span></p>
        <p style="font-size: 0.9rem;">Running ${version}</p>
        `
}

renderFooter()