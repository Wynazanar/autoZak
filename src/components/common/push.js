function Push(status, title, description) {
    const element = document.createElement('div');
    element.classList.add('push', status, 'show');

    element.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <div style="display: flex; align-items: center;">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <p style="font-size: 20px; font-weight: 500; color: var(--gray_2-20); margin-inline: 16px">${title}</p>
            </div>
        </div>
        <p style="color: var(--gray_2-40); margin-top: 8px; font-size: 16px;">${description}</p>
    `;

    document.body.appendChild(element);

    setTimeout(() => {
        element.classList.remove('show');
        element.classList.add('hide');

        setTimeout(() => {
            document.body.removeChild(element);
        }, 300);
    }, 3000);
}