import { useEffect, useRef, useState } from 'react';

export default function GalacticGame({ dayCount, onClose }) {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('start'); // start, playing, gameover
    const [score, setScore] = useState(0);

    // Difficulty scaling based on Day Count (Level 1 to 14+)
    // More days = Faster speed, more asteroids
    const baseSpeed = 4 + (dayCount * 0.5);
    const spawnRate = Math.max(20, 60 - (dayCount * 2));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set initial size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = Math.min(400, window.innerHeight * 0.6);

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let frames = 0;

        // Game Objects
        const ship = { x: 50, y: 150, width: 30, height: 20, dy: 0 };
        let obstacles = [];
        let stars = [];

        // Keys
        const keys = { ArrowUp: false, ArrowDown: false };

        const handleKeyDown = (e) => (keys[e.code] = true);
        const handleKeyUp = (e) => (keys[e.code] = false);

        const handleTouchStart = (e) => {
            e.preventDefault(); // Prevent scrolling
            const touchY = e.touches[0].clientY;
            const middle = window.innerHeight / 2;
            if (touchY < middle) {
                keys.ArrowUp = true;
                keys.ArrowDown = false;
            } else {
                keys.ArrowDown = true;
                keys.ArrowUp = false;
            }
        };

        const handleTouchEnd = (e) => {
            keys.ArrowUp = false;
            keys.ArrowDown = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        // Mobile Touch Listeners
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchStart, { passive: false }); // Allow dragging
        canvas.addEventListener('touchend', handleTouchEnd);

        // Init Stars
        for (let i = 0; i < 50; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 3 + 1
            });
        }

        const gameLoop = () => {
            if (gameState !== 'playing') return;

            frames++;

            // Update dimensions dynamically if resized
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = Math.min(400, window.innerHeight * 0.6);

            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // --- Background Stars ---
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                star.x -= star.speed;
                if (star.x < 0) star.x = canvas.width;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // --- Ship Movement ---
            if (keys.ArrowUp) ship.dy = -5;
            else if (keys.ArrowDown) ship.dy = 5;
            else ship.dy *= 0.9; // Friction

            ship.y += ship.dy;
            // Boundaries
            if (ship.y < 0) ship.y = 0;
            if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;

            // Draw Ship (Triangle)
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.moveTo(ship.x + ship.width, ship.y + ship.height / 2);
            ctx.lineTo(ship.x, ship.y);
            ctx.lineTo(ship.x, ship.y + ship.height);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // --- Obstacles (Asteroids) ---
            if (frames % Math.floor(spawnRate) === 0) {
                obstacles.push({
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 30),
                    width: 30 + Math.random() * 20,
                    height: 30 + Math.random() * 20,
                    speed: baseSpeed + Math.random() * 2
                });
            }

            ctx.fillStyle = '#6366f1'; // Indigo asteroids
            obstacles.forEach((obs, index) => {
                obs.x -= obs.speed;

                // Collision Detection
                if (
                    ship.x < obs.x + obs.width &&
                    ship.x + ship.width > obs.x &&
                    ship.y < obs.y + obs.height &&
                    ship.y + ship.height > obs.y
                ) {
                    setGameState('gameover');
                }

                // Draw Asteroid
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

                // Remove off-screen
                if (obs.x + obs.width < 0) {
                    obstacles.splice(index, 1);
                    setScore(s => s + 10);
                }
            });

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        if (gameState === 'playing') {
            gameLoop();
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            if (canvas) {
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchStart);
                canvas.removeEventListener('touchend', handleTouchEnd);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, dayCount, baseSpeed, spawnRate]);

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-black">
            <canvas ref={canvasRef} className="block w-full h-[300px] sm:h-[400px]" />

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white font-mono text-xl z-10 drop-shadow-md">
                SCORE: {score} | LEVEL: {dayCount}
            </div>

            {gameState === 'start' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4 animate-pulse">
                        GALACTIC DRIFT
                    </h2>
                    <div className="text-indigo-200 mb-8 text-center px-4">
                        {/* Visual Progress Bar */}
                        <div className="flex flex-col items-center gap-2 mb-4">
                            <div className="flex gap-1">
                                {Array.from({ length: 14 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`
                                        w-4 h-6 rounded-sm border transition-all duration-300
                                        ${i < dayCount
                                                ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_#22d3ee]'
                                                : 'bg-indigo-950/50 border-indigo-800'
                                            }
                                    `}
                                        title={`Day ${i + 1}`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-mono text-cyan-300 tracking-widest">MISSION PROGRESS: {dayCount}/14</p>
                        </div>

                        <p className="text-sm mt-4 text-indigo-300">Use Arrow Keys (⬆/⬇) to dodge obstacles.</p>
                    </div>
                    <button
                        onClick={() => setGameState('playing')}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-[0_0_15px_#00f3ff] transition-all transform hover:scale-105"
                    >
                        START MISSION
                    </button>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm z-20">
                    <h2 className="text-4xl font-bold text-white mb-2">MISSION FAILED</h2>
                    <p className="text-xl text-red-200 mb-6">Final Score: {score}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setScore(0);
                                setGameState('playing');
                            }}
                            className="px-6 py-2 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-200"
                        >
                            RETRY
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-white text-white font-bold rounded-lg hover:bg-white/10"
                        >
                            EXIT
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Controls Overlay (visible only on touch devices ideally, but kept simple here) */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 sm:hidden z-10 opacity-50">
                {/* Can implement touch controls later if needed, current version relies on keyboard but keys work on some mobile browsers if virtual keyboard is up. 
                 Real mobile support would require touchstart listeners. Adding generic instruction for now. */}
            </div>
        </div>
    );
}
