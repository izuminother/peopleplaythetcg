// パーティクルエフェクト
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `rgba(164, 0, 0, ${Math.random() * 0.5 + 0.2})`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// パーティクルシステムの初期化
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('particle-canvas');
    document.querySelector('.hero').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 新しいパーティクルの追加
        if (particles.length < 100) {
            createParticles();
        }

        // パーティクルの更新と描画
        particles = particles.filter(particle => {
            particle.update();
            particle.draw(ctx);
            return particle.size > 0.2;
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();
    window.addEventListener('resize', resizeCanvas);
}

// カードフィルター機能の改善
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.card-filters button');
    const cards = document.querySelectorAll('.card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブなボタンのスタイルを更新
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.textContent;
            
            cards.forEach(card => {
                if (filterType === 'すべて' || card.querySelector('.card-type').textContent === filterType) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                    card.style.animation = 'cardReveal 0.5s ease-out forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// スクロールアニメーションの改善
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            if (entry.target.classList.contains('feature-card')) {
                entry.target.style.animation = 'cardReveal 0.5s ease-out forwards';
            }
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .card, .rules-section');
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // パーティクルエフェクトの初期化
    initParticles();
});

// フォームバリデーションの改善
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // 基本的なバリデーション
        if (!name || !email || !subject || !message) {
            showNotification('すべての項目を入力してください。', 'error');
            return;
        }

        // メールアドレスのバリデーション
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('有効なメールアドレスを入力してください。', 'error');
            return;
        }

        // 送信成功のアニメーション
        showNotification('お問い合わせを受け付けました。', 'success');
        this.reset();
    });
}

// 通知表示機能
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ナビゲーションメニューのスクロール制御の改善
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100px)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});
