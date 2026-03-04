document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const contentFrame = document.getElementById('content-frame');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            links.forEach(l => l.classList.remove('active'));
            
            link.classList.add('active');
            
            const page = link.getAttribute('data-page');
            
            contentFrame.src = `${page}.html`;
        });
    });

    // Set the initial active link
    const initialPage = 'executive';
    const initialLink = document.querySelector(`.sidebar a[data-page="${initialPage}"]`);
    if (initialLink) {
        initialLink.classList.add('active');
    }
});