class DeckBuilder {
    constructor() {
        this.cards = [];
        this.deck = [];
        this.arenaCards = [];
        this.currentFilter = 'すべて';
        this.searchTerms = {
            name: '',
            rarelity: '',
            type: ''
        };

        this.initializeElements();
        this.setupEventListeners();
        this.loadCards();
    }

    initializeElements() {
        this.cardGrid = document.getElementById('cardGrid');
        this.deckCards = document.getElementById('deckCards');
        this.arenaCardsContainer = document.getElementById('arenaCardsContainer');
        this.deckCount = document.getElementById('deckCount');
        this.arenaCount = document.getElementById('arenaCount');
        this.generatePDFBtn = document.getElementById('generatePDF');
        this.clearDeckBtn = document.getElementById('clearDeck');
    }

    setupEventListeners() {
        // 検索機能
        document.getElementById('nameSearch').addEventListener('input', (e) => {
            this.searchTerms.name = e.target.value.toLowerCase();
            this.renderCards();
        });

        document.getElementById('rarelitySearch').addEventListener('change', (e) => {
            this.searchTerms.rarelity = e.target.value;
            this.renderCards();
        });

        document.getElementById('typeSearch').addEventListener('change', (e) => {
            this.searchTerms.type = e.target.value;
            this.renderCards();
        });

        // フィルターボタン
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderCards();
            });
        });

        // アクションボタン
        this.generatePDFBtn.addEventListener('click', () => this.generatePDF());
        this.clearDeckBtn.addEventListener('click', () => this.clearDeck());
    }

    async loadCards() {
        try {
            // GitHub Pages用のパスに修正
            const basePath = window.location.hostname === 'localhost' ? '' : '/大陸遊戯office';
            const response = await fetch(`${basePath}/data/cards.json`);
            const data = await response.json();
            
            if (!data.cards || !Array.isArray(data.cards)) {
                console.error('カードデータが正しい形式ではありません:', data);
                return;
            }
            
            this.cards = data.cards;
            console.log('カードデータを読み込みました:', this.cards.length, '枚');
            this.renderCards();
        } catch (error) {
            console.error('カードデータの読み込みに失敗しました:', error);
        }
    }

    renderCards() {
        this.cardGrid.innerHTML = '';

        if (!Array.isArray(this.cards)) {
            console.error('カードデータが配列ではありません');
            return;
        }

        let filteredCards = this.cards;

        if (this.currentFilter !== 'すべて') {
            filteredCards = filteredCards.filter(card => card.attribute === this.currentFilter);
        }

        filteredCards = filteredCards.filter(card => {
            const nameMatch = card.name.toLowerCase().includes(this.searchTerms.name);
            const rarelityMatch = !this.searchTerms.rarelity || card.rarelity === this.searchTerms.rarelity;
            const typeMatch = !this.searchTerms.type || card.type === this.searchTerms.type;
            const isArenaB = card.type === 'アリーナ' && card.subtype === 'ARENA B';
            return nameMatch && rarelityMatch && typeMatch && !isArenaB;
        });

        if (filteredCards.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'カードが見つかりませんでした';
            this.cardGrid.appendChild(noResults);
            return;
        }

        filteredCards.forEach(card => {
            const cardElement = this.createCardElement(card, false);
            this.cardGrid.appendChild(cardElement);
        });
    }

    createCardElement(card, isInDeck = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.cardId = card.id;
        
        // GitHub Pages用のパスに修正
        const basePath = window.location.hostname === 'localhost' ? '' : '/大陸遊戯office';
        const imagePath = `${basePath}/imgs/cards/${card.recording || '-'}/${card.id}.png`;
        
        cardDiv.innerHTML = `
            <div class="card-image">
                <img src="${imagePath}" alt="${card.name || card.id}" onerror="this.src='${basePath}/imgs/cards/placeholder.png'">
            </div>
        `;

        cardDiv.addEventListener('click', () => {
            if (isInDeck) {
                this.removeCardFromDeck(card, isInDeck);
            } else {
                this.addCardToDeck(card);
            }
        });

        return cardDiv;
    }

    addCardToDeck(card) {
        if (card.type === 'アリーナ') {
            if (this.arenaCards.length < 2) {
                this.arenaCards.push(card);
                // ARENA Aの場合、対応するARENA Bを自動的に追加
                if (card.subtype === 'ARENA A' && card.to) {
                    const arenaBCard = this.cards.find(c => c.id === card.to);
                    if (arenaBCard && !this.arenaCards.some(c => c.id === arenaBCard.id)) {
                        this.arenaCards.push(arenaBCard);
                    }
                }
                this.updateArenaDisplay();
            }
        } else {
            if (this.deck.length < 25) {
                // FANFAREカードは1枚まで
                if (card.type === 'ファンファーレ') {
                    const fanfareCount = this.deck.filter(c => c.type === 'ファンファーレ').length;
                    if (fanfareCount >= 1) {
                        alert('ファンファーレカードは1枚までです');
                        return;
                    }
                }

                // 同じカードが既に存在する場合、最初のカードの次に挿入
                const existingIndex = this.deck.findIndex(c => c.id === card.id);
                if (existingIndex !== -1) {
                    // 発言権以外のカードは3枚まで
                    const sameCardCount = this.deck.filter(c => c.id === card.id).length;
                    if (card.type !== '発言権' && sameCardCount >= 3) {
                        alert('同じカードは3枚までです');
                        return;
                    }
                    this.deck.splice(existingIndex + 1, 0, card);
                } else {
                    this.deck.push(card);
                }
                this.updateDeckDisplay();
            } else {
                alert('メインデッキは25枚までです');
            }
        }
    }

    removeCardFromDeck(card) {
        if (card.type === 'アリーナ') {
            const index = this.arenaCards.findIndex(c => c.id === card.id);
            if (index !== -1) {
                this.arenaCards.splice(index, 1);
                // ARENA Aを削除した場合、対応するARENA Bも削除
                if (card.subtype === 'ARENA A' && card.to) {
                    const arenaBIndex = this.arenaCards.findIndex(c => c.id === card.to);
                    if (arenaBIndex !== -1) {
                        this.arenaCards.splice(arenaBIndex, 1);
                    }
                }
                this.updateArenaDisplay();
            }
        } else {
            const index = this.deck.findIndex(c => c.id === card.id);
            if (index !== -1) {
                this.deck.splice(index, 1);
                this.updateDeckDisplay();
            }
        }
    }

    updateDeckDisplay() {
        this.deckCards.innerHTML = '';
        this.deck.forEach(card => {
            const cardElement = this.createCardElement(card, true);
            this.deckCards.appendChild(cardElement);
        });
        this.deckCount.textContent = this.deck.length;
    }

    updateArenaDisplay() {
        this.arenaCardsContainer.innerHTML = '';
        this.arenaCards.forEach(card => {
            const cardElement = this.createCardElement(card, true);
            this.arenaCardsContainer.appendChild(cardElement);
        });
        this.arenaCount.textContent = this.arenaCards.length;
    }

    clearDeck() {
        this.deck = [];
        this.arenaCards = [];
        this.updateDeckDisplay();
        this.updateArenaDisplay();
    }

    generatePDF() {
        if (this.deck.length !== 25 || this.arenaCards.length !== 2) {
            alert('メインデッキは25枚、アリーナカードは2枚必要です。');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const cardWidth = 66;
        const cardHeight = 92;
        const cardSpacing = 0;

        const cardsPerRow = 3;
        const cardsPerCol = 3;
        const cardsPerPage = cardsPerRow * cardsPerCol;

        const totalWidth = (cardWidth * cardsPerRow) + (cardSpacing * (cardsPerRow - 1));
        const totalHeight = (cardHeight * cardsPerCol) + (cardSpacing * (cardsPerCol - 1));
        const startX = (pageWidth - totalWidth) / 2;
        const startY = (pageHeight - totalHeight) / 2;

        // GitHub Pages用のパスに修正
        const basePath = window.location.hostname === 'localhost' ? '' : '/大陸遊戯office';

        for (let pageIndex = 0; pageIndex < 2; pageIndex++) {
            if (pageIndex > 0) {
                doc.addPage();
            }

            for (let i = 0; i < cardsPerPage; i++) {
                const cardIndex = pageIndex * cardsPerPage + i;
                if (cardIndex >= this.deck.length) break;

                const row = Math.floor(i / cardsPerRow);
                const col = i % cardsPerRow;

                const x = startX + (col * (cardWidth + cardSpacing));
                const y = startY + (row * (cardHeight + cardSpacing));

                const card = this.deck[cardIndex];
                const imagePath = `${basePath}/imgs/cards/${card.recording || '-'}/${card.id}.png`;
                doc.addImage(imagePath, 'PNG', x, y, cardWidth, cardHeight, undefined, 'FAST');
            }
        }

        doc.addPage();
        
        const remainingMainCards = this.deck.slice(18);
        const allThirdPageCards = [...remainingMainCards, ...this.arenaCards];
        
        allThirdPageCards.forEach((card, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;

            const x = startX + (col * (cardWidth + cardSpacing));
            const y = startY + (row * (cardHeight + cardSpacing));

            const imagePath = `${basePath}/imgs/cards/${card.recording || '-'}/${card.id}.png`;
            doc.addImage(imagePath, 'PNG', x, y, cardWidth, cardHeight, undefined, 'FAST');
        });

        doc.save('deck.pdf');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DeckBuilder();
}); 