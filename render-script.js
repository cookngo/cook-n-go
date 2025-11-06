const version = "v0.2.2"

function renderFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <p>2025 Cook N Go <span style="font-size: 0.9rem;">(made with Spoonacular API and Vercel servers)</span></p>
        <p style="font-size: 0.9rem;">Running ${version}</p>
        `
}

renderFooter()