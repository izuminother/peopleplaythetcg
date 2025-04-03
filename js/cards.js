// カードデータを管理するクラス
class CardManager {
    constructor() {
        this.cards = [];
        this.attributes = ['銃', '嘘', 'PEOPLE+', 'LOVE'];
        this.currentFilter = 'すべて';
        this.searchTerms = {
            name: '',
            rarelity: '',
            type: ''
        };
        this.init();
    }

    // 初期化
    async init() {
        try {
            console.log('カードデータの読み込みを開始');
            const response = await fetch('./data/cards.json');
            console.log('レスポンス:', response);
            const data = await response.json();
            console.log('読み込んだデータ:', data);
            this.cards = data.cards;
            this.setupSearchListeners();
            this.renderFilterButtons();
            this.renderCards();
        } catch (error) {
            console.error('カードデータの読み込みに失敗しました:', error);
        }
    }

    // 検索リスナーの設定
    setupSearchListeners() {
        const nameSearch = document.getElementById('nameSearch');
        const rarelitySearch = document.getElementById('rarelitySearch');
        const typeSearch = document.getElementById('typeSearch');

        nameSearch.addEventListener('input', (e) => {
            this.searchTerms.name = e.target.value.toLowerCase();
            this.renderCards();
        });

        rarelitySearch.addEventListener('change', (e) => {
            this.searchTerms.rarelity = e.target.value;
            this.renderCards();
        });

        typeSearch.addEventListener('change', (e) => {
            this.searchTerms.type = e.target.value;
            this.renderCards();
        });
    }

    // フィルターボタンの表示
    renderFilterButtons() {
        const filterContainer = document.querySelector('.card-filters');
        filterContainer.innerHTML = '';

        // 「すべて」ボタンを追加
        const allButton = document.createElement('button');
        allButton.textContent = 'すべて';
        allButton.classList.add('active');
        allButton.dataset.filter = 'すべて';
        allButton.addEventListener('click', () => this.setFilter('すべて'));
        filterContainer.appendChild(allButton);

        // 属性別のフィルターボタンを追加
        this.attributes.forEach(attribute => {
            const button = document.createElement('button');
            button.textContent = attribute;
            button.dataset.filter = attribute;
            button.addEventListener('click', () => this.setFilter(attribute));
            filterContainer.appendChild(button);
        });
    }

    // フィルターの設定
    setFilter(attribute) {
        this.currentFilter = attribute;
        
        // アクティブなボタンの更新
        document.querySelectorAll('.card-filters button').forEach(button => {
            button.classList.toggle('active', button.dataset.filter === attribute);
        });

        this.renderCards();
    }

    // カードの表示
    renderCards() {
        const cardGrid = document.querySelector('.card-grid');
        cardGrid.innerHTML = '';

        // フィルタリングと検索を適用
        let filteredCards = this.cards;
        
        // 属性フィルター
        if (this.currentFilter !== 'すべて') {
            filteredCards = filteredCards.filter(card => {
                return card.attribute === this.currentFilter;
            });
        }

        // 検索条件
        filteredCards = filteredCards.filter(card => {
            const nameMatch = card.name.toLowerCase().includes(this.searchTerms.name);
            const rarelityMatch = !this.searchTerms.rarelity || card.rarelity === this.searchTerms.rarelity;
            const typeMatch = !this.searchTerms.type || card.type === this.searchTerms.type;
            return nameMatch && rarelityMatch && typeMatch;
        });

        // 結果が0件の場合のメッセージ
        if (filteredCards.length === 0) {
            cardGrid.innerHTML = '<div class="no-results">該当するカードが見つかりませんでした。</div>';
            return;
        }

        filteredCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardGrid.appendChild(cardElement);
        });
    }

    // カード要素の作成
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        // 画像パスの生成
        const imagePath = `imgs/cards/${card.recording || '-'}/${card.id}.png`;
        
        // コストアイコンの生成
        const costIcons = (card.cost || ['-']).map(cost => {
            if (cost === '-') return '';
            return `<img src="imgs/${cost}.png" alt="${cost}" class="cost-icon">`;
        }).join('');

        // 関連カードの生成
        let relationHtml = '';
        if (card.relation) {
            const [relationName, relationId] = card.relation.split('(');
            relationHtml = `
                <div class="card-relation">
                    <span class="relation-label">関連カード:</span>
                    <a href="#" class="relation-link" data-card-name="${relationName}">${card.relation}</a>
                </div>
            `;
        }
        
        cardDiv.innerHTML = `
            <div class="card-image">
                <img src="${imagePath}" alt="${card.name || card.id}" onerror="this.src='imgs/cards/placeholder.png'">
            </div>
            <div class="card-content">
                <h3 class="card-title">${card.name || card.id}</h3>
                <div class="card-info">
                    <span class="card-type">${card.type || '-'}</span>
                    <span class="card-subtype">${card.subtype || '-'}</span>
                    <span class="card-attribute">${card.attribute || '-'}</span>
                    <span class="card-rarelity">${card.rarelity || '-'}</span>
                </div>
                <div class="card-stats">
                    <span class="card-cost">コスト: ${costIcons || '-'}</span>
                    <span class="card-power">パワー: ${card.power || '-'}</span>
                </div>
                <p class="card-description">${card.description || '-'}</p>
                ${relationHtml}
                <div class="card-footer">
                    <span class="card-id">${card.id}</span>
                    <span class="card-illustrator">イラスト: ${card.illustrator || '-'}</span>
                </div>
            </div>
        `;

        // 関連カードリンクのイベントリスナーを設定
        const relationLink = cardDiv.querySelector('.relation-link');
        if (relationLink) {
            relationLink.addEventListener('click', (e) => {
                e.preventDefault();
                const cardName = e.target.dataset.cardName;
                document.getElementById('nameSearch').value = cardName;
                this.searchTerms.name = cardName.toLowerCase();
                this.renderCards();
            });
        }

        return cardDiv;
    }
}

// カードマネージャーの初期化
document.addEventListener('DOMContentLoaded', () => {
    new CardManager();
}); 