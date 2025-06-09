class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = new Player(this);
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.health = 100;
        
        this.sounds = {
            shoot: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3'] }),
            explosion: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1234/1234-preview.mp3'] })
        };
        
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = e.clientX - rect.left - this.player.width / 2;
        });

        window.addEventListener('click', () => {
            this.player.shoot();
        });
    }

    spawnEnemy() {
        if (Math.random() < 0.02) {
            this.enemies.push(new Enemy(this));
        }
    }

    update() {
        this.player.update();
        this.spawnEnemy();

        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.active;
        });

        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            return enemy.active;
        });

        this.checkCollisions();
        this.updateUI();
    }

    checkCollisions() {
        for (let enemy of this.enemies) {
            for (let bullet of this.bullets) {
                if (this.checkCollision(enemy, bullet)) {
                    enemy.hit();
                    bullet.active = false;
                    this.score += 100;
                    this.sounds.explosion.play();
                }
            }

            if (this.checkCollision(enemy, this.player)) {
                enemy.active = false;
                this.health -= 20;
                this.sounds.explosion.play();
                
                if (this.health <= 0) {
                    alert('遊戲結束！你的分數：' + this.score);
                    location.reload();
                }
            }
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    updateUI() {
        document.getElementById('score').textContent = '分數: ' + this.score;
        document.getElementById('health').textContent = '生命值: ' + this.health;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.draw();
        this.enemies.forEach(enemy => enemy.draw());
        this.bullets.forEach(bullet => bullet.draw());
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = game.canvas.width / 2 - this.width / 2;
        this.y = game.canvas.height - this.height - 20;
    }

    update() {
        // 確保玩家不會超出畫布範圍
        this.x = Math.max(0, Math.min(this.x, this.game.canvas.width - this.width));
    }

    draw() {
        this.game.ctx.fillStyle = '#4CAF50';
        this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    shoot() {
        this.game.bullets.push(new Bullet(this.game, this.x + this.width / 2, this.y));
        this.game.sounds.shoot.play();
    }
}

class Enemy {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (game.canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
        this.active = true;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.game.canvas.height) {
            this.active = false;
        }
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        // 設置飛機顏色
        ctx.fillStyle = '#F44336';
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;

        // 開始繪製飛機
        ctx.beginPath();
        
        // 機身
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 4, this.height / 4);
        ctx.lineTo(-this.width / 4, this.height / 4);
        ctx.closePath();
        
        // 填充機身
        ctx.fill();
        ctx.stroke();

        // 機翼
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, -this.height / 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    hit() {
        this.active = false;
    }
}

class Bullet {
    constructor(game, x, y) {
        this.game = game;
        this.width = 5;
        this.height = 15;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = 7;
        this.active = true;
    }

    update() {
        this.y -= this.speed;
        if (this.y < -this.height) {
            this.active = false;
        }
    }

    draw() {
        this.game.ctx.fillStyle = '#FFC107';
        this.game.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 啟動遊戲
window.onload = () => {
    new Game();
};