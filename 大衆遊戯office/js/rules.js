document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // アクティブなタブボタンの更新
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // タブコンテンツの表示/非表示の切り替え
            const targetTab = button.dataset.tab;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}); 