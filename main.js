const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// フォント設定を追加
ctx.font = '20px Arial';
ctx.fillStyle = 'black';

// ゲームの状態
let y = 200, vy = 0, gravity = 0.5, jumpPower = -10;
let isJumping = false, canDoubleJump = false;
let obstacles = [{x: 500, y: 250, w: 20, h: 40}];
let score = 0, stage = 1, gameOver = false;
let nextObstacleTime = 0;
let scrollSpeed = 3;

// ステージごとの設定
const stageSettings = [
    { speed: 3, obstacleInterval: [1000, 3000], height: 40 },  // ステージ1
    { speed: 3.3, obstacleInterval: [900, 2800], height: 40 },   // ステージ2
    { speed: 3.6, obstacleInterval: [800, 2600], height: 40 },   // ステージ3
    { speed: 3.9, obstacleInterval: [700, 2400], height: 40 },   // ステージ4
    { speed: 4.2, obstacleInterval: [600, 2200], height: 40 }    // ステージ5
];

function drawCharacter(x, y) {
    // 頭
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(x + 15, y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 体
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(x + 5, y + 20, 20, 20);
    
    // 足
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 5, y + 40, 8, 10);
    ctx.fillRect(x + 17, y + 40, 8, 10);
}

function jump() {
    if (!isJumping) {
        vy = jumpPower;
        isJumping = true;
        canDoubleJump = true;
    } else if (canDoubleJump) {
        vy = jumpPower * 1.2; // 2段階ジャンプは少し高く
        canDoubleJump = false;
    }
}

function resetGame() {
    y = 200;
    vy = 0;
    obstacles = [{x: 500, y: 250, w: 20, h: 40}];
    score = 0;
    stage = 1;
    gameOver = false;
    nextObstacleTime = 0;
    scrollSpeed = stageSettings[0].speed;
    gameLoop();
}

function checkStageUp() {
    if (score >= stage * 20 && stage < 5) {
        stage++;
        scrollSpeed = stageSettings[stage-1].speed;
        // ステージアップ演出
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Stage ' + stage + '!', canvas.width/2, canvas.height/2);
        setTimeout(() => {
            gameLoop();
        }, 1000);
    }
}

document.getElementById('jumpBtn').onclick = jump;
document.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });

function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // キャラ
    vy += gravity;
    y += vy;
    if (y > 250) { y = 250; vy = 0; isJumping = false; }
    drawCharacter(50, y);

    // 障害物
    for (let obs of obstacles) {
        obs.x -= scrollSpeed;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        // 当たり判定
        if (50 < obs.x + obs.w && 50 + 30 > obs.x && y < obs.y + obs.h && y + 30 > obs.y) {
            gameOver = true;
            showGameOver();
        }
    }

    // 障害物追加（ランダムな間隔と高さで）
    if (obstacles[obstacles.length - 1].x < 300 && Date.now() > nextObstacleTime) {
        const settings = stageSettings[stage-1];
        const height = Math.random() < 0.3 ? 60 : 40; // 30%の確率で高い障害物
        obstacles.push({
            x: 500,
            y: 250 - (height - 40), // 高い障害物は上に配置
            w: 20,
            h: height
        });
        score++;
        // 次の障害物までの時間をランダムに設定
        nextObstacleTime = Date.now() + (settings.obstacleInterval[0] + Math.random() * (settings.obstacleInterval[1] - settings.obstacleInterval[0]));
    }

    // スコアとステージ表示
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Stage: ' + stage, 10, 60);

    checkStageUp();
    requestAnimationFrame(gameLoop);
}

function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 40);
    ctx.fillText('Stage: ' + stage, canvas.width/2, canvas.height/2 + 70);
    ctx.fillText('Click to Restart', canvas.width/2, canvas.height/2 + 110);
    
    // リスタートボタンのイベントリスナーを追加
    canvas.onclick = function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (y > canvas.height/2 + 90 && y < canvas.height/2 + 130) {
            canvas.onclick = null;
            resetGame();
        }
    };
}

gameLoop();