document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const contentFrame = document.getElementById('content-frame');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            links.forEach(l => l.classList.remove('active'));
            
            link.classList.add('active');
            
            const page = link.getAttribute('data-page');
            
            // Try to get token from parent scope (index.html)
            const session = window.supabase ? (async () => {
                const { data } = await window.supabase.auth.getSession();
                return data.session;
            })() : null;

            if (window.supabase) {
                window.supabase.auth.getSession().then(({ data }) => {
                    const token = data.session ? data.session.access_token : '';
                    contentFrame.src = `${page}.html?token=${token}`;
                });
            } else {
                contentFrame.src = `${page}.html`;
            }
        });
    });

    // Set the initial active link
    const initialPage = 'executive';
    const initialLink = document.querySelector(`.sidebar a[data-page="${initialPage}"]`);
    if (initialLink) {
        initialLink.classList.add('active');
    }
});