

// Состояние игры
let gameState = 'menu'; // 'menu', 'playing', 'paused'
let lastAutoSave = 0;
const autoSaveInterval = 30000; // Автосохранение каждые 30 секунд

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Мобильное управление
// Улучшенное определение мобильных устройств
const isMobile = (() => {
    // Проверяем User Agent
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
    
    // Проверяем размер экрана (для планшетов и маленьких ноутбуков)
    const isSmallScreen = window.innerWidth <= 1024 && window.innerHeight <= 768;
    
    // Проверяем поддержку touch событий
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Определяем мобильное устройство
    const isMobileDevice = mobileDevices.test(userAgent);
    
    // Если это мобильное устройство ИЛИ (маленький экран И поддержка касаний)
    return isMobileDevice || (isSmallScreen && hasTouchScreen);
})();
let mobileControls = {
    // Виртуальный джойстик
    joystick: {
        active: false,
        centerX: 0,
        centerY: 0,
        currentX: 0,
        currentY: 0,
        radius: 50,
        maxDistance: 40,
        visible: false
    },
    // Кнопки действий
    buttons: {
        attack: { x: 0, y: 0, radius: 35, pressed: false, visible: false },
        interact: { x: 0, y: 0, radius: 35, pressed: false, visible: false },
        menu: { x: 0, y: 0, radius: 30, pressed: false, visible: false }
    },
    // Активные касания
    touches: new Map()
};

// Показывать ли мобильные элементы управления
// При первом запуске автоматически определяем устройство
let showMobileControls = (() => {
    const savedValue = localStorage.getItem('mobileControls');
    if (savedValue !== null) {
        // Если есть сохраненное значение, используем его
        return savedValue === 'true';
    } else {
        // При первом запуске определяем автоматически
        const autoDetected = isMobile;
        localStorage.setItem('mobileControls', autoDetected.toString());
        return autoDetected;
    }
})();

// Отладочная информация об автоопределении устройства
console.log('=== DEVICE DETECTION ===');
console.log('User Agent:', navigator.userAgent);
console.log('Screen size:', window.innerWidth + 'x' + window.innerHeight);
console.log('Touch support:', 'ontouchstart' in window);
console.log('Max touch points:', navigator.maxTouchPoints);
console.log('Detected as mobile:', isMobile);
console.log('Mobile controls enabled:', showMobileControls);
console.log('========================');

// Функция для переключения мобильного управления
function toggleMobileControls() {
    showMobileControls = !showMobileControls;
    localStorage.setItem('mobileControls', showMobileControls.toString());
    if (showMobileControls) {
        updateMobileControlsPosition();
    }
    console.log('Мобильное управление:', showMobileControls ? 'включено' : 'выключено');
}

// Функция для сброса настроек и повторного автоопределения
function resetToAutoDetection() {
    localStorage.removeItem('mobileControls');
    showMobileControls = isMobile;
    localStorage.setItem('mobileControls', showMobileControls.toString());
    if (showMobileControls) {
        updateMobileControlsPosition();
    }
    console.log('Настройки сброшены. Автоопределение:', showMobileControls ? 'MOBILE' : 'LAPTOP');
}

// Делаем функцию доступной глобально для отладки
window.resetToAutoDetection = resetToAutoDetection;

// Загружаем изображение пещеры
const caveImage = new Image();
caveImage.src = 'png/Cave.png';
let caveImageLoaded = false;

caveImage.onload = function() {
    caveImageLoaded = true;
    console.log('Cave image loaded successfully');
};

caveImage.onerror = function(e) {
    console.error('Failed to load png/Cave.png', e);
    console.error('Current URL:', window.location.href);
    console.error('Full image path would be:', window.location.origin + window.location.pathname.replace('index.html', '') + 'png/Cave.png');
    caveImageLoaded = false;
};

// Загружаем изображения мамонтов
const mammothImage = new Image();
mammothImage.src = 'png/Mammoth.png';
let mammothImageLoaded = false;

mammothImage.onload = function() {
    mammothImageLoaded = true;
    console.log('Mammoth image loaded successfully');
};

mammothImage.onerror = function(e) {
    console.error('Failed to load png/Mammoth.png', e);
    console.error('Image source:', mammothImage.src);
    mammothImageLoaded = false;
};

const angryMammothImage = new Image();
angryMammothImage.src = 'png/Angry Mammoth.png';
let angryMammothImageLoaded = false;

angryMammothImage.onload = function() {
    angryMammothImageLoaded = true;
    console.log('Angry Mammoth image loaded successfully');
};

angryMammothImage.onerror = function(e) {
    console.error('Failed to load png/Angry Mammoth.png', e);
    console.error('Image source:', angryMammothImage.src);
    angryMammothImageLoaded = false;
};

// Загружаем изображения степного мамонта
const steppeMammothImage = new Image();
steppeMammothImage.src = 'png/Imperial Mammoth.png';
let steppeMammothImageLoaded = false;

steppeMammothImage.onload = function() {
    steppeMammothImageLoaded = true;
    console.log('Imperial Mammoth image loaded successfully');
};

steppeMammothImage.onerror = function(e) {
    console.error('Failed to load png/Imperial Mammoth.png', e);
    console.error('Image source:', steppeMammothImage.src);
    steppeMammothImageLoaded = false;
};

const angrySteppeMammothImage = new Image();
angrySteppeMammothImage.src = 'png/Angry Imperial Mammoth.png';
let angrySteppeMammothImageLoaded = false;

angrySteppeMammothImage.onload = function() {
    angrySteppeMammothImageLoaded = true;
    console.log('Angry Imperial Mammoth image loaded successfully');
};

angrySteppeMammothImage.onerror = function() {
    console.error('Failed to load png/Angry Imperial Mammoth.png');
    angrySteppeMammothImageLoaded = false;
};

// Загружаем изображение туши степного мамонта
const steppeMammothBodyImage = new Image();
steppeMammothBodyImage.src = 'png/Imperial Mammoth Body.png';
let steppeMammothBodyImageLoaded = false;

steppeMammothBodyImage.onload = function() {
    steppeMammothBodyImageLoaded = true;
    console.log('Imperial Mammoth Body image loaded successfully');
};

steppeMammothBodyImage.onerror = function() {
    console.error('Failed to load png/Imperial Mammoth Body.png');
    steppeMammothBodyImageLoaded = false;
};

// Загружаем изображение туши мамонта
const mammothBodyImage = new Image();
mammothBodyImage.src = 'png/Mammoth Body.png';
let mammothBodyImageLoaded = false;

mammothBodyImage.onload = function() {
    mammothBodyImageLoaded = true;
    console.log('Mammoth Body image loaded successfully');
};

mammothBodyImage.onerror = function() {
    console.error('Failed to load png/Mammoth Body.png');
    mammothBodyImageLoaded = false;
};

// Изображения эпох больше не используются

// Загружаем изображение костра
const campfireImage = new Image();
campfireImage.src = 'png/Campfire.png';
let campfireImageLoaded = false;

campfireImage.onload = function() {
    campfireImageLoaded = true;
    console.log('Campfire image loaded successfully');
};

campfireImage.onerror = function(e) {
    console.error('Failed to load png/Campfire.png', e);
    console.error('Image source:', campfireImage.src);
    campfireImageLoaded = false;
};

// Загружаем изображение главного меню
const mainMenuImage = new Image();
mainMenuImage.src = 'main.png/Main menu.png';
let mainMenuImageLoaded = false;

mainMenuImage.onload = function() {
    mainMenuImageLoaded = true;
    console.log('Main menu image loaded successfully');
};

mainMenuImage.onerror = function(e) {
    console.error('Failed to load main.png/Main menu.png', e);
    console.error('Current URL:', window.location.href);
    console.error('Full image path would be:', window.location.origin + window.location.pathname.replace('index.html', '') + 'main.png/Main menu.png');
    mainMenuImageLoaded = false;
};

// Загружаем фоновую музыку для главного меню
const mainMenuMusic = new Audio();
mainMenuMusic.src = 'sound/tribal_drums_loud.wav';
mainMenuMusic.loop = true;
mainMenuMusic.volume = 0.5; // Средняя громкость
mainMenuMusic.preload = 'auto'; // Предзагрузка аудио
let mainMenuMusicLoaded = false;
let mainMenuMusicPlaying = false;
let userHasInteracted = false; // Флаг для отслеживания первого взаимодействия
let autoplayAttempted = false; // Флаг попытки автозапуска

// Множественные события для лучшего определения готовности
mainMenuMusic.addEventListener('loadeddata', function() {
    console.log('Main menu music - data loaded');
    if (!autoplayAttempted) {
        tryPlayMainMenuMusic();
    }
});

mainMenuMusic.addEventListener('canplay', function() {
    console.log('Main menu music - can play');
    if (!autoplayAttempted) {
        tryPlayMainMenuMusic();
    }
});

mainMenuMusic.addEventListener('canplaythrough', function() {
    mainMenuMusicLoaded = true;
    console.log('Main menu music loaded successfully - can play through');
    
    // Попытка автозапуска если мы в меню
    if (!autoplayAttempted) {
        tryPlayMainMenuMusic();
    }
});

mainMenuMusic.addEventListener('error', function(e) {
    console.error('Failed to load sound/tribal_drums_loud.wav', e);
    mainMenuMusicLoaded = false;
});

// Улучшенная функция для запуска музыки главного меню
function tryPlayMainMenuMusic() {
    if (!mainMenuMusicPlaying && gameState === 'menu') {
        autoplayAttempted = true;
        console.log('Attempting to play main menu music...');
        
        try {
            const playPromise = mainMenuMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    mainMenuMusicPlaying = true;
                    console.log('✅ Main menu music started successfully!');
                }).catch(e => {
                    console.log('⚠️ Music autoplay blocked by browser:', e.name);
                    console.log('💡 Music will start after first user interaction');
                    // Сбрасываем флаг, чтобы попробовать еще раз при взаимодействии
                    autoplayAttempted = false;
                });
            }
        } catch (e) {
            console.log('❌ Error playing music:', e.message);
            autoplayAttempted = false;
        }
    }
}

// Звуковые эффекты для игры
const woodSound = new Audio();
woodSound.src = 'sound/wood.ogg';
woodSound.volume = 0.7;
woodSound.preload = 'auto';
woodSound.loop = true; // Зацикливаем звук рубки
let woodSoundLoaded = false;

woodSound.addEventListener('canplaythrough', function() {
    woodSoundLoaded = true;
    console.log('Wood sound loaded successfully');
});

woodSound.addEventListener('error', function(e) {
    console.error('Failed to load sound/wood.ogg', e);
    woodSoundLoaded = false;
});

// Звук добычи камня
const stoneSound = new Audio();
stoneSound.src = 'sound/stone.ogg';
stoneSound.volume = 0.7;
stoneSound.preload = 'auto';
stoneSound.loop = true; // Зацикливаем звук добычи камня
let stoneSoundLoaded = false;

stoneSound.addEventListener('canplaythrough', function() {
    stoneSoundLoaded = true;
    console.log('🪨 Stone sound loaded successfully');
    console.log('🪨 Stone sound details:', {
        duration: stoneSound.duration,
        volume: stoneSound.volume,
        src: stoneSound.src
    });
});

stoneSound.addEventListener('error', function(e) {
    console.error('🪨 Failed to load sound/stone.ogg', e);
    stoneSoundLoaded = false;
});

// Добавляем дополнительные события для отладки
stoneSound.addEventListener('loadstart', function() {
    console.log('🪨 Stone sound loading started');
});

stoneSound.addEventListener('play', function() {
    console.log('🪨 Stone sound play event fired');
});

stoneSound.addEventListener('pause', function() {
    console.log('🪨 Stone sound pause event fired');
});

stoneSound.addEventListener('ended', function() {
    console.log('🪨 Stone sound ended event fired');
});

stoneSound.addEventListener('volumechange', function() {
    console.log('🪨 Stone sound volume changed to:', stoneSound.volume);
});

stoneSound.addEventListener('loadeddata', function() {
    console.log('🪨 Stone sound data loaded');
});

// Звук сбора яблок
const appleSound = new Audio();
appleSound.src = 'sound/apple.ogg';
appleSound.volume = 0.7;
appleSound.preload = 'auto';
appleSound.loop = false; // Не зацикливаем звук сбора яблок (короткий звук)
let appleSoundLoaded = false;

appleSound.addEventListener('canplaythrough', function() {
    appleSoundLoaded = true;
    console.log('🍎 Apple sound loaded successfully');
    console.log('🍎 Apple sound details:', {
        duration: appleSound.duration,
        volume: appleSound.volume,
        src: appleSound.src
    });
});

appleSound.addEventListener('error', function(e) {
    console.error('🍎 Failed to load sound/apple.ogg', e);
    appleSoundLoaded = false;
});

appleSound.addEventListener('loadstart', function() {
    console.log('🍎 Apple sound loading started');
});

// Функция для начала звука рубки для выбранного персонажа
function startWoodSoundForSelectedPerson(personIndex) {
    // Просто обновляем состояние звука
    updateWoodSound();
}

// Функция для остановки звука рубки для персонажа
function stopWoodSoundForPerson(personIndex) {
    // Просто обновляем состояние звука
    updateWoodSound();
}

// Функция для обновления звука рубки в реальном времени
let lastWoodSoundState = false; // Для отслеживания изменений состояния
function updateWoodSound() {
    // Проверяем, есть ли среди выбранных персонажей те, кто сейчас рубит
    const selectedChoppersExist = selectedPeople.some(personIndex => {
        const person = people[personIndex];
        return person && person.hasAxe && person.choppingTimer > 0 && person.currentBush;
    });
    
    const shouldPlay = selectedChoppersExist && woodSoundLoaded && userHasInteracted;
    const isPlaying = !woodSound.paused && !woodSound.ended;
    
    // Логируем только при изменении состояния
    if (shouldPlay !== lastWoodSoundState) {
        lastWoodSoundState = shouldPlay;
        
        if (shouldPlay) {
            console.log('🪵 Selected person started chopping - starting wood sound');
        } else {
            console.log('🪵 No selected person chopping - stopping wood sound');
        }
    }
    
    if (shouldPlay && !isPlaying) {
        // Нужно запустить звук
        try {
            woodSound.currentTime = 0;
            const playPromise = woodSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log('Wood sound play failed:', e.name);
                });
            }
        } catch (e) {
            console.log('Error playing wood sound:', e.message);
        }
    } else if (!shouldPlay && isPlaying) {
        // Нужно остановить звук
        woodSound.pause();
    }
}

// Функция для начала звука добычи камня для выбранного персонажа
function startStoneSoundForSelectedPerson(personIndex) {
    console.log(`🪨 startStoneSoundForSelectedPerson called for person ${personIndex}, selected: ${selectedPeople.includes(personIndex)}`);
    // Просто обновляем состояние звука
    updateStoneSound();
}

// Функция для остановки звука добычи камня для персонажа
function stopStoneSoundForPerson(personIndex) {
    // Просто обновляем состояние звука
    updateStoneSound();
}

// Функция для обновления звука добычи камня в реальном времени
let lastStoneSoundState = false; // Для отслеживания изменений состояния
function updateStoneSound() {
    // Проверяем, есть ли среди выбранных персонажей те, кто сейчас собирает камень
    const selectedMinersExist = selectedPeople.some(personIndex => {
        const person = people[personIndex];
        const isMining = person && person.collectingStonePos && person.collectTimer > 0;
        if (person && person.collectingStonePos) {
            console.log(`🪨 Person ${personIndex} state: collectingStonePos=${!!person.collectingStonePos}, collectTimer=${person.collectTimer}, mining=${isMining}`);
        }
        return isMining;
    });
    
    const shouldPlay = selectedMinersExist && stoneSoundLoaded && userHasInteracted;
    const isPlaying = !stoneSound.paused && !stoneSound.ended;
    
    // Отладочная информация
    if (selectedPeople.length > 0) {
        console.log(`🪨 Stone sound check: selectedMinersExist=${selectedMinersExist}, shouldPlay=${shouldPlay}, stoneSoundLoaded=${stoneSoundLoaded}, userHasInteracted=${userHasInteracted}, isPlaying=${isPlaying}`);
    }
    
    // Логируем только при изменении состояния
    if (shouldPlay !== lastStoneSoundState) {
        lastStoneSoundState = shouldPlay;
        
        if (shouldPlay) {
            console.log('🪨 Selected person started mining - starting stone sound');
        } else {
            console.log('🪨 No selected person mining - stopping stone sound');
        }
    }
    
    if (shouldPlay && !isPlaying) {
        // Нужно запустить звук
        console.log('🪨 Attempting to start stone sound...');
        try {
            stoneSound.currentTime = 0;
            const playPromise = stoneSound.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('🪨 Stone sound started successfully');
                }).catch(e => {
                    console.log('🪨 Stone sound play failed:', e.name, e.message);
                });
            }
        } catch (e) {
            console.log('🪨 Error playing stone sound:', e.message);
        }
    } else if (!shouldPlay && isPlaying) {
        // Нужно остановить звук
        console.log('🪨 Stopping stone sound...');
        stoneSound.pause();
    }
}

// Улучшенная функция для обработки первого взаимодействия пользователя
function handleFirstInteraction() {
    if (!userHasInteracted) {
        userHasInteracted = true;
        console.log('🎮 First user interaction detected');
        
        // Запускаем музыку при первом взаимодействии
        if (gameState === 'menu' && !mainMenuMusicPlaying) {
            console.log('🎵 Starting music after user interaction...');
            // Сбрасываем флаг автозапуска, чтобы функция сработала
            autoplayAttempted = false;
            tryPlayMainMenuMusic();
        }
    }
}

// Функция для проверки возможности автозапуска медиа
async function checkAutoplaySupport() {
    try {
        // Создаем тестовый аудио элемент
        const testAudio = new Audio();
        testAudio.volume = 0;
        testAudio.muted = true;
        
        // Пытаемся воспроизвести
        const canAutoplay = await testAudio.play().then(() => {
            testAudio.pause();
            return true;
        }).catch(() => false);
        
        console.log('🔊 Autoplay support:', canAutoplay ? '✅ Supported' : '❌ Blocked');
        return canAutoplay;
    } catch (e) {
        console.log('🔊 Autoplay check failed:', e.message);
        return false;
    }
}

// Устанавливаем размер canvas на весь экран
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Обновляем позиции мобильных элементов управления
    if (showMobileControls) {
        updateMobileControlsPosition();
    }
}

// Функция для обновления позиций мобильных элементов управления
function updateMobileControlsPosition() {
    const isLandscape = canvas.width > canvas.height;
    const isSmallScreen = Math.min(canvas.width, canvas.height) < 600;
    
    // Адаптивные размеры
    const baseMargin = isSmallScreen ? 20 : 25; // Увеличили отступы
    
    // Адаптивные размеры кнопок
    const menuButtonRadius = isSmallScreen ? 30 : 35; // Увеличили размер кнопки
    
    // Обновляем размеры в объекте управления (убираем джойстик и лишние кнопки)
    mobileControls.buttons.menu.radius = menuButtonRadius;
    
    // Скрываем джойстик и кнопки атаки/взаимодействия
    mobileControls.joystick.visible = false;
    mobileControls.buttons.attack.visible = false;
    mobileControls.buttons.interact.visible = false;
    
    // Кнопка меню в правом верхнем углу панели ресурсов
    const resourceBarHeight = isSmallScreen ? 40 : 60;
    const menuButtonWidth = 50;
    const menuButtonHeight = 25;
    
    mobileControls.buttons.menu.x = canvas.width - menuButtonWidth - 10;
    mobileControls.buttons.menu.y = 7;
    mobileControls.buttons.menu.width = menuButtonWidth;
    mobileControls.buttons.menu.height = menuButtonHeight;
    mobileControls.buttons.menu.visible = true;
    
    // Отладка позиции кнопки меню (только в первый раз)
    if (!window.menuButtonDebugShown) {
        console.log('=== MENU BUTTON POSITION ===');
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Button radius:', menuButtonRadius);
        console.log('Base margin:', baseMargin);
        console.log('Button position: x =', mobileControls.buttons.menu.x, ', y =', mobileControls.buttons.menu.y);
        console.log('============================');
        window.menuButtonDebugShown = true;
    }
}

// Функция для проверки статуса загрузки всех изображений
function checkImageLoadingStatus() {
    const imageStatus = {
        'Cave Image': caveImageLoaded,
        'Mammoth Image': mammothImageLoaded,
        'Angry Mammoth Image': angryMammothImageLoaded,
        'Imperial Mammoth Image': steppeMammothImageLoaded,
        'Angry Imperial Mammoth Image': angrySteppeMammothImageLoaded,
        'Imperial Mammoth Body Image': steppeMammothBodyImageLoaded,
        'Mammoth Body Image': mammothBodyImageLoaded,
        'Campfire Image': campfireImageLoaded,
        'Main Menu Image': mainMenuImageLoaded
    };
    
    console.log('=== IMAGE LOADING STATUS ===');
    for (const [name, loaded] of Object.entries(imageStatus)) {
        console.log(`${name}: ${loaded ? '✓ Loaded' : '✗ Failed'}`);
    }
    console.log('============================');
    
    return imageStatus;
}

// Проверяем статус загрузки через 2 секунды после загрузки страницы
setTimeout(checkImageLoadingStatus, 2000);

// Функция предварительной загрузки изображений
function preloadImages() {
    const images = [
        { img: caveImage, name: 'Cave' },
        { img: mammothImage, name: 'Mammoth' },
        { img: angryMammothImage, name: 'Angry Mammoth' },
        { img: steppeMammothImage, name: 'Imperial Mammoth' },
        { img: angrySteppeMammothImage, name: 'Angry Imperial Mammoth' },
        { img: steppeMammothBodyImage, name: 'Imperial Mammoth Body' },
        { img: mammothBodyImage, name: 'Mammoth Body' },
        { img: campfireImage, name: 'Campfire' },
        { img: mainMenuImage, name: 'Main Menu' }
    ];
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    return new Promise((resolve) => {
        images.forEach(({ img, name }) => {
            if (img.complete && img.naturalWidth > 0) {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            } else {
                const originalOnload = img.onload;
                img.onload = function() {
                    if (originalOnload) originalOnload.call(this);
                    loadedCount++;
                    console.log(`Loaded ${name} (${loadedCount}/${totalImages})`);
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                
                const originalOnerror = img.onerror;
                img.onerror = function(e) {
                    if (originalOnerror) originalOnerror.call(this, e);
                    loadedCount++;
                    console.log(`Failed to load ${name} (${loadedCount}/${totalImages})`);
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
            }
        });
        
        // Если все изображения уже загружены
        if (loadedCount === totalImages) {
            resolve();
        }
    });
}

// Инициализация после загрузки изображений
preloadImages().then(() => {
    console.log('All images processed (loaded or failed)');
    checkImageLoadingStatus();
    startGame();
});

// Запуск игры с таймаутом (на случай проблем с изображениями)
setTimeout(() => {
    console.log('Force starting game after timeout');
    startGame();
}, 5000); // Принудительный запуск через 5 секунд

// Функция запуска игры
let gameStarted = false;
function startGame() {
    if (gameStarted) return; // Избегаем двойного запуска
    gameStarted = true;
    
    console.log('=== STARTING GAME ===');
    console.log('Canvas element:', canvas);
    console.log('Canvas context:', ctx);
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    console.log('Game state:', gameState);
    console.log('Mobile controls:', showMobileControls);
    
    try {
        resizeCanvas();
        console.log('Canvas resized successfully');
        
        // Если мобильные контролы включены, настраиваем их
        if (showMobileControls) {
            updateMobileControlsPosition();
            console.log('Mobile controls positioned');
        }
        
        console.log('Game started successfully');
    } catch (error) {
        console.error('Error starting game:', error);
    }
}

// Функция для проверки доступности файлов изображений
async function checkImageAvailability() {
    const imagePaths = [
        'png/Cave.png',
        'png/Mammoth.png',
        'png/Angry Mammoth.png',
        'png/Imperial Mammoth.png',
        'png/Angry Imperial Mammoth.png',
        'png/Imperial Mammoth Body.png',
        'png/Mammoth Body.png',
        'png/Campfire.png',
        'main.png/Main menu.png'
    ];
    
    console.log('=== CHECKING IMAGE FILE AVAILABILITY ===');
    
    for (const path of imagePaths) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            console.log(`${path}: ${response.ok ? '✓ Available' : '✗ Not found'} (${response.status})`);
        } catch (error) {
            console.log(`${path}: ✗ Error - ${error.message}`);
        }
    }
    
    console.log('==========================================');
}

// Проверяем доступность файлов через 1 секунду
setTimeout(checkImageAvailability, 1000);

// Устанавливаем размер при загрузке и при изменении размера окна
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Дополнительные попытки запуска музыки при фокусе на окне
window.addEventListener('focus', function() {
    console.log('🎯 Window focused');
    if (gameState === 'menu' && !mainMenuMusicPlaying && !autoplayAttempted) {
        console.log('🎵 Attempting music autoplay on window focus...');
        tryPlayMainMenuMusic();
    }
});

// Попытка запуска при изменении видимости страницы
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && gameState === 'menu' && !mainMenuMusicPlaying && !autoplayAttempted) {
        console.log('🎵 Attempting music autoplay on visibility change...');
        setTimeout(() => tryPlayMainMenuMusic(), 100);
    }
});

// Ресурсы
let resources = {
    wood: 0,
    stone: 0,
    food: 0
};

// Система эпох
let currentEra = 'stone_age';  // Начинаем с каменного века
let totalFoodCollected = 0;    // Общее количество собранной пищи за всю игру
let totalWoodCollected = 0;    // Общее количество собранного дерева за всю игру
let totalStoneCollected = 0;   // Общее количество собранного камня за всю игру

const eras = {
    stone_age: {
        name: 'Каменный век',
        description: 'Базовая эпоха выживания',
        unlocked: true,
        buildings: ['house', 'reproduction_house', 'warrior_camp']
    },
    bone_age: {
        name: 'Новокаменный век',
        description: 'Эпоха развитого земледелия и скотоводства',
        unlocked: false,
        requirement: { food: 200 },
        buildings: ['house', 'reproduction_house', 'warrior_camp', 'bonfire', 'farm']
    }
};

// Камера
let camera = {
    x: 0,
    y: 0
};

// Трава одного цвета
function drawGrass() {
    ctx.fillStyle = '#007F0E'; // Задний фон куста
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Пещерный фон
function drawCaveBackground() {
    // Тёмный каменный фон
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Текстура каменных стен
    ctx.fillStyle = '#2a2a2a';
    for (let x = 0; x < canvas.width; x += 60) {
        for (let y = 0; y < canvas.height; y += 60) {
            if (Math.random() < 0.3) {
                ctx.fillRect(x + Math.random() * 20, y + Math.random() * 20, 
                           10 + Math.random() * 15, 10 + Math.random() * 15);
            }
        }
    }
    
    // Мерцающие факелы по краям
    const torchFlicker = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.save();
    ctx.globalAlpha = torchFlicker;
    ctx.fillStyle = '#ff6600';
    
    // Левый факел
    ctx.beginPath();
    ctx.arc(50, 50, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Правый факел
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 50, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Эффект освещения - градиент от центра
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Олень — коричневый круг


// Куст как картинка
const bushImg = new Image();
bushImg.src = 'bush.png';

function drawBush(x, y, durability = 10) {
    // Рисуем куст по центру x, y с учетом камеры
    const screenX = x - camera.x;
    const screenY = y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    if (durability > 7) {
        // Здоровое дерево с кроной
        // Ствол
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, 10, 16, 50);
        
        // Волнистая крона
        ctx.fillStyle = '#228B22';
        
        // Рисуем волнистую крону с помощью кривых
        ctx.beginPath();
        ctx.moveTo(-35, 0);
        
        // Верхняя часть кроны - волнистая
        ctx.quadraticCurveTo(-30, -25, -15, -30);
        ctx.quadraticCurveTo(-5, -35, 5, -30);
        ctx.quadraticCurveTo(15, -25, 25, -20);
        ctx.quadraticCurveTo(35, -10, 30, 5);
        
        // Правая сторона
        ctx.quadraticCurveTo(35, 15, 25, 25);
        ctx.quadraticCurveTo(20, 30, 10, 28);
        
        // Нижняя часть
        ctx.quadraticCurveTo(0, 32, -10, 28);
        ctx.quadraticCurveTo(-20, 30, -25, 25);
        
        // Левая сторона
        ctx.quadraticCurveTo(-35, 15, -35, 0);
        
        ctx.closePath();
        ctx.fill();
        
        // Обводка волнистой кроны
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-35, 0);
        ctx.quadraticCurveTo(-30, -25, -15, -30);
        ctx.quadraticCurveTo(-5, -35, 5, -30);
        ctx.quadraticCurveTo(15, -25, 25, -20);
        ctx.quadraticCurveTo(35, -10, 30, 5);
        ctx.quadraticCurveTo(35, 15, 25, 25);
        ctx.quadraticCurveTo(20, 30, 10, 28);
        ctx.quadraticCurveTo(0, 32, -10, 28);
        ctx.quadraticCurveTo(-20, 30, -25, 25);
        ctx.quadraticCurveTo(-35, 15, -35, 0);
        ctx.closePath();
        ctx.stroke();
        
    } else if (durability > 3) {
        // Голое бревно (листва срублена)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, -30, 16, 90);
        
        // Обводка ствола
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, -30, 16, 90);
        
        // Несколько колец на стволе
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = -20; i <= 50; i += 15) {
            ctx.beginPath();
            ctx.moveTo(-8, i);
            ctx.lineTo(8, i);
            ctx.stroke();
        }
        
    } else if (durability > 0) {
        // Пень
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-12, 40, 24, 20);
        
        // Верх пня с кольцами
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.ellipse(0, 40, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Кольца роста на пне
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 40, 8, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 40, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Обводка пня
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.strokeRect(-12, 40, 24, 20);
    }
    
    ctx.restore();
}

function drawAppleTree(tree) {
    const screenX = tree.x - camera.x;
    const screenY = tree.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Ствол дерева
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-8, 20, 16, 40);
    
    // Крона дерева
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#228B22';
    ctx.fill();
    
    // Яблоки (если есть пища)
    if (tree.food > 0) {
        const applePositions = [
            {x: -20, y: -10}, {x: 15, y: -5}, {x: -5, y: 15},
            {x: 25, y: 10}, {x: -30, y: 20}
        ];
        
        for (let i = 0; i < Math.min(tree.food, 5); i++) {
            const pos = applePositions[i];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#DC143C';
            ctx.fill();
        }
    }
    
    ctx.restore();
    
    // Показываем количество пищи если кто-то рядом
    const anyoneNear = people.some(p => {
        const distance = Math.sqrt((p.x - tree.x) ** 2 + (p.y - tree.y) ** 2);
        return distance < tree.r + 20;
    });
    
    if (anyoneNear && tree.food > 0) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(`🍎 ${tree.food}`, screenX, screenY - tree.r - 10);
        ctx.restore();
    }
}

function drawStone(stone) {
    const screenX = stone.x - camera.x;
    const screenY = stone.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Основной камень в стиле эмодзи 🪨
    const size = stone.size || 1;
    const baseRadius = 15 * size;
    
    // Основная форма камня - неправильный округлый камень
    ctx.fillStyle = '#95a5a6'; // Светло-серый основной цвет
    ctx.beginPath();
    ctx.ellipse(0, 0, baseRadius * 1.2, baseRadius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Добавляем неровности камня
    ctx.fillStyle = '#7f8c8d'; // Темно-серый для неровностей
    ctx.beginPath();
    ctx.ellipse(-baseRadius * 0.3, -baseRadius * 0.2, baseRadius * 0.4, baseRadius * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(baseRadius * 0.4, baseRadius * 0.1, baseRadius * 0.3, baseRadius * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(-baseRadius * 0.1, baseRadius * 0.4, baseRadius * 0.35, baseRadius * 0.2, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Тёмные тени снизу
    ctx.fillStyle = '#6c7b7d';
    ctx.beginPath();
    ctx.ellipse(0, baseRadius * 0.3, baseRadius * 1.0, baseRadius * 0.4, 0, 0, Math.PI);
    ctx.fill();
    
    // Светлые блики сверху
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.ellipse(-baseRadius * 0.2, -baseRadius * 0.3, baseRadius * 0.3, baseRadius * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(baseRadius * 0.3, -baseRadius * 0.2, baseRadius * 0.2, baseRadius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Контур камня
    ctx.strokeStyle = '#5d6d6d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, baseRadius * 1.2, baseRadius * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    // Показываем количество камня если кто-то рядом
    const anyoneNear = people.some(p => {
        const distance = Math.sqrt((p.x - stone.x) ** 2 + (p.y - stone.y) ** 2);
        return distance < stone.r + 20;
    });
    
    if (anyoneNear && stone.amount > 0) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(`🪨 ${stone.amount}`, screenX, screenY - stone.r - 10);
        ctx.restore();
    }
}

function drawCave(cave) {
    const screenX = cave.x - camera.x;
    const screenY = cave.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    if (caveImageLoaded) {
        // Используем изображение пещеры
        const imageWidth = cave.width * 2;
        const imageHeight = cave.height * 2;
        
        // Рисуем тень под пещерой
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(5, imageHeight * 0.4, imageWidth * 0.4, imageHeight * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Рисуем изображение пещеры
        ctx.drawImage(caveImage, 
                     -imageWidth / 2, -imageHeight / 2, 
                     imageWidth, imageHeight);
    } else {
        // Fallback: рисуем простую пещеру если изображение не загружено
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.ellipse(0, 0, cave.width, cave.height, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Черный вход
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, cave.height * 0.2, cave.width * 0.3, cave.height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Показываем предупреждение если кто-то рядом
    const anyoneNear = people.some(p => {
        const distance = Math.sqrt((p.x - cave.x) ** 2 + (p.y - cave.y) ** 2);
        return distance < cave.width + 30;
    });
    
    if (anyoneNear) {
        // Фон для текста предупреждения
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.roundRect(-70, -cave.height - 50, 140, 35, 8);
        ctx.fill();
        
        // Рамка
        ctx.strokeStyle = '#darkred';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText('⚠️ ОПАСНО!', 0, -cave.height - 40);
        ctx.fillText('Пещера неандертальцев', 0, -cave.height - 25);
    }
    
    ctx.restore();
}

function drawDeer(deer) {
    const screenX = deer.x - camera.x;
    const screenY = deer.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Тело оленя - коричневое
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова оленя
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-15, -8, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Рога оленя
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Левый рог
    ctx.moveTo(-20, -12);
    ctx.lineTo(-25, -20);
    ctx.moveTo(-22, -16);
    ctx.lineTo(-28, -18);
    // Правый рог
    ctx.moveTo(-10, -12);
    ctx.lineTo(-5, -20);
    ctx.moveTo(-8, -16);
    ctx.lineTo(-2, -18);
    ctx.stroke();
    
    // Ноги оленя
    ctx.fillStyle = '#654321';
    const legPositions = [
        [-8, 8], [8, 8], [-5, 10], [5, 10]
    ];
    legPositions.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Хвост
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(18, -2, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-18, -10, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawMammoth(mammoth) {
    const screenX = mammoth.x - camera.x;
    const screenY = mammoth.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Используем изображения если они загружены
    const imageToUse = mammoth.angry ? angryMammothImage : mammothImage;
    const imageLoaded = mammoth.angry ? angryMammothImageLoaded : mammothImageLoaded;
    
    if (imageLoaded) {
        // Рисуем изображение мамонта
        const imageWidth = 210;  // Размер мамонта увеличен в 3 раза (70 * 3)
        const imageHeight = 150;  // Размер мамонта увеличен в 3 раза (50 * 3)
        ctx.drawImage(imageToUse, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
    } else {
        // Фолбэк - рисуем мамонта как раньше
        // Тело мамонта - большое и коричневое
        ctx.fillStyle = mammoth.angry ? '#654321' : '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, 0, 35, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Шерсть мамонта (лохматость)
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 32;
            const y = Math.sin(angle) * 22;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Голова мамонта
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(-25, -15, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Бивни мамонта
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.ellipse(-35, -10, 12, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-35, -5, 12, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Хобот
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(-40, 0, 15, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        
        // Ноги мамонта
        ctx.fillStyle = '#654321';
        [[-15, 20], [15, 20], [-10, 18], [10, 18]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.ellipse(x, y, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Глаза
        ctx.fillStyle = mammoth.angry ? '#FF0000' : '#000';
        ctx.beginPath();
        ctx.arc(-30, -20, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Полоска здоровья
    if (mammoth.health < mammoth.maxHealth) {
        const barWidth = 50;
        const barHeight = 6;
        const barX = -barWidth / 2;
        const barY = -45;
        
        // Фон полоски здоровья
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Полоска здоровья
        const healthPercent = mammoth.health / mammoth.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
    
    ctx.restore();
}

function drawSteppeMammoth(mammoth) {
    const screenX = mammoth.x - camera.x;
    const screenY = mammoth.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Используем изображения степного мамонта если они загружены
    const imageToUse = mammoth.angry ? angrySteppeMammothImage : steppeMammothImage;
    const imageLoaded = mammoth.angry ? angrySteppeMammothImageLoaded : steppeMammothImageLoaded;
    
    if (imageLoaded) {
        // Рисуем изображение степного мамонта (больше обычного)
        const imageWidth = 280;  // Больше обычного мамонта (210 * 1.33)
        const imageHeight = 200;  // Больше обычного мамонта (150 * 1.33)
        ctx.drawImage(imageToUse, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
    } else {
        // Фолбэк - рисуем степного мамонта как увеличенную версию обычного
        // Тело степного мамонта - огромное и темно-коричневое
        ctx.fillStyle = mammoth.angry ? '#4A4A4A' : '#654321';
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 35, 0, 0, Math.PI * 2); // Больше обычного
        ctx.fill();
        
        // Шерсть степного мамонта (более густая)
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 42;
            const y = Math.sin(angle) * 32;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Голова степного мамонта (больше)
        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.ellipse(-35, -20, 24, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Бивни степного мамонта (массивные)
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.ellipse(-50, -15, 18, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-50, -8, 18, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Хобот (толще)
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(-55, 0, 20, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        
        // Ноги степного мамонта (толще)
        ctx.fillStyle = '#4A4A4A';
        [[-20, 28], [20, 28], [-15, 25], [15, 25]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.ellipse(x, y, 8, 16, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Глаза (больше и злее)
        ctx.fillStyle = mammoth.angry ? '#FF4500' : '#8B0000';
        ctx.beginPath();
        ctx.arc(-42, -28, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Полоска здоровья (больше для степного мамонта)
    if (mammoth.health < mammoth.maxHealth) {
        const barWidth = 80; // Шире полоска
        const barHeight = 8;  // Выше полоска
        const barX = -barWidth / 2;
        const barY = -60; // Выше над мамонтом
        
        // Фон полоски здоровья
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Полоска здоровья
        const healthPercent = mammoth.health / mammoth.maxHealth;
        ctx.fillStyle = healthPercent > 0.6 ? '#27ae60' : healthPercent > 0.3 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Маркер степного мамонта
        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('♦', 0, -70);
    }
    
    ctx.restore();
}

function drawDeerCarcass(carcass) {
    const screenX = carcass.x - camera.x;
    const screenY = carcass.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Туша оленя - лежит на боку
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, 5, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова оленя (лежит)
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(-12, 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Рога оленя (лежат)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Рога лежат на земле
    ctx.moveTo(-18, -2);
    ctx.lineTo(-22, -8);
    ctx.moveTo(-20, -4);
    ctx.lineTo(-24, -6);
    ctx.moveTo(-8, -2);
    ctx.lineTo(-4, -8);
    ctx.moveTo(-6, -4);
    ctx.lineTo(-2, -6);
    ctx.stroke();
    
    // Ноги оленя (подогнуты)
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(-5, 12, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 12, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Индикатор что это туша (можно собрать)
    if (carcass.food > 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#27ae60';
        ctx.textAlign = 'center';
        ctx.fillText('🥩', 0, -15);
        
        // Показываем количество пищи
        ctx.font = '10px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeText(`${carcass.food}`, 15, -10);
        ctx.fillText(`${carcass.food}`, 15, -10);
    }
    
    ctx.restore();
}

function drawMammothCarcass(carcass) {
    const screenX = carcass.x - camera.x;
    const screenY = carcass.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Используем изображение туши мамонта если оно загружено
    if (mammothBodyImageLoaded) {
        const imageWidth = 180;  // Большая туша мамонта
        const imageHeight = 120;
        ctx.drawImage(mammothBodyImage, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
    } else {
        // Фолбэк - рисуем тушу мамонта как раньше
        // Большое тело мамонта (лежит на боку)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(0, 10, 50, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова мамонта (лежит)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(-35, 5, 25, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Бивни мамонта (лежат)
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.ellipse(-50, 0, 15, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-50, 10, 15, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Хобот (лежит)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(-55, 15, 8, 15, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Ноги мамонта (подогнуты)
        ctx.fillStyle = '#654321';
        [[-20, 35], [20, 35], [-15, 32], [15, 32]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.ellipse(x, y, 8, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Индикатор что это туша мамонта (можно собрать)
    if (carcass.food > 0) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#27ae60';
        ctx.textAlign = 'center';
        ctx.fillText('🥩', 0, -40);
        
        // Показываем количество пищи
        ctx.font = '14px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(`${carcass.food}`, 25, -35);
        ctx.fillText(`${carcass.food}`, 25, -35);
    }
    
    ctx.restore();
}

function drawSteppeMammothCarcass(carcass) {
    const screenX = carcass.x - camera.x;
    const screenY = carcass.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Используем изображение туши степного мамонта если оно загружено
    if (steppeMammothBodyImageLoaded) {
        const imageWidth = 240;  // Огромная туша степного мамонта (больше обычной)
        const imageHeight = 160;
        ctx.drawImage(steppeMammothBodyImage, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
    } else {
        // Фолбэк - рисуем тушу степного мамонта как увеличенную версию обычной
        // Огромное тело степного мамонта (лежит на боку)
        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.ellipse(0, 12, 65, 40, 0, 0, Math.PI * 2); // Больше обычной туши
        ctx.fill();
        
        // Голова степного мамонта (лежит, огромная)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(-45, 8, 35, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Бивни степного мамонта (лежат, массивные)
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.ellipse(-70, 0, 20, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-70, 15, 20, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Хобот (лежит, толстый)
        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.ellipse(-75, 20, 12, 20, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Ноги степного мамонта (подогнуты, толстые)
        ctx.fillStyle = '#4A4A4A';
        [[-25, 45], [25, 45], [-20, 42], [20, 42]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.ellipse(x, y, 12, 20, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Индикатор что это туша степного мамонта (можно собрать)
    if (carcass.food > 0) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#27ae60';
        ctx.textAlign = 'center';
        ctx.fillText('🥩', 0, -50);
        
        // Маркер степного мамонта
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('♦', -30, -50);
        
        // Показываем количество пищи (больше чем у обычных)
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(`${carcass.food}`, 35, -45);
        ctx.fillText(`${carcass.food}`, 35, -45);
    }
    
    ctx.restore();
}

function drawSabertoothTiger(tiger) {
    const screenX = tiger.x - camera.x;
    const screenY = tiger.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Тело тигра (овальное)
    ctx.fillStyle = '#cd853f'; // Песочно-коричневый цвет
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Полосы тигра
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(-8, -3, 3, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -2, 3, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-15, 2, 2, 8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Голова тигра
    ctx.fillStyle = '#cd853f';
    ctx.beginPath();
    ctx.arc(-20, -5, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Уши
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(-25, -12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15, -12, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Внутренняя часть ушей
    ctx.fillStyle = '#deb887';
    ctx.beginPath();
    ctx.arc(-25, -12, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15, -12, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза (злые красные)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-25, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Зрачки
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-25, -8, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-15, -8, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Нос
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-20, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // САБЛЕЗУБЫЕ КЛЫКИ - главная особенность!
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    
    // Левый клык
    ctx.beginPath();
    ctx.moveTo(-23, 0);
    ctx.lineTo(-25, 8);
    ctx.lineTo(-21, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Правый клык
    ctx.beginPath();
    ctx.moveTo(-17, 0);
    ctx.lineTo(-19, 8);
    ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Лапы
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(-10, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Когти
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let paw of [-10, 0, 10, 20]) {
        for (let claw of [-1, 0, 1]) {
            ctx.beginPath();
            ctx.moveTo(paw + claw, 12);
            ctx.lineTo(paw + claw, 16);
            ctx.stroke();
        }
    }
    
    // Хвост
    ctx.strokeStyle = '#cd853f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.quadraticCurveTo(35, -10, 30, -20);
    ctx.stroke();
    
    // Кончик хвоста
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(30, -20, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Индикатор здоровья тигра
    if (tiger.health < tiger.maxHealth) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX - 20, screenY - 35, 40, 6);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - 19, screenY - 34, 38 * (tiger.health / tiger.maxHealth), 4);
        ctx.restore();
    }
}

function drawNeanderthal(neanderthal) {
    const screenX = neanderthal.x - camera.x;
    const screenY = neanderthal.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    // Тело неандертальца - более крупное и мускулистое
    ctx.fillStyle = '#d4a574'; // Загорелая кожа
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2); // Больше чем у обычного человека
    ctx.fill();
    ctx.strokeStyle = '#a0845c';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Волосатая грудь и руки
    ctx.fillStyle = '#654321';
    for (let i = 0; i < 10; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 25;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Голова - больше и приплюснутая
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.ellipse(0, -25, 10, 8, 0, 0, Math.PI * 2); // Вытянутая голова
    ctx.fill();
    ctx.stroke();
    
    // Длинные волосы
    ctx.fillStyle = '#4a3c28';
    ctx.beginPath();
    ctx.ellipse(0, -25, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза - более глубоко посаженные
    ctx.fillStyle = '#8b0000'; // Красные злые глаза
    ctx.beginPath();
    ctx.arc(-4, -25, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -25, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Выступающие надбровные дуги
    ctx.strokeStyle = '#a0845c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -28);
    ctx.lineTo(8, -28);
    ctx.stroke();
    
    // Каменное оружие - булава
    ctx.save();
    ctx.translate(15, -10);
    
    // Рукоять булавы
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 25);
    ctx.stroke();
    
    // Каменная головка булавы
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
    // Шкуры на теле
    ctx.fillStyle = 'rgba(101, 67, 33, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-5, 5, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Индикатор здоровья неандертальца
    if (neanderthal.health < neanderthal.maxHealth) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX - 20, screenY - 45, 40, 6);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(screenX - 19, screenY - 44, 38 * (neanderthal.health / neanderthal.maxHealth), 4);
        ctx.restore();
    }
}

// Система саблезубых тигров
let sabertoothTigers = [];

// Система пещер
let caves = [];

// Система неандертальцев
let neanderthals = [];

// Система оленей
let deer = [];

// Система мамонтов
let mammoths = [];

// Система степных мамонтов
let steppeMammoths = [];
let steppeMammothCarcasses = [];

// Система туш оленей
let deerCarcasses = [];

// Система туш мамонтов
let mammothCarcasses = [];

// Система летящих копий
let flyingSpears = [];

// Система камней
let stones = [];

// Система кустов
let bushes = [];
let mouseX = 0, mouseY = 0;
let showBushInfo = false;
let bushInfoTimer = 0;
let generationCounter = 0; // Счетчик для принудительной генерации

// Система зданий
let buildings = [];

// Система яблонь
let appleTrees = [];

// Система сообщений для панели населения
let populationMessages = [];

function generateBushes() {
    // Улучшенная система генерации кустов только вокруг игроков
    const generationRadius = 800; // Меньший радиус для генерации только рядом с игроками
    const minDistanceBetweenBushes = 180; // Минимальное расстояние между кустами
    const minDistanceFromHut = 150; // Минимальное расстояние от шалаша
    const minDistanceFromBuildings = 120; // Минимальное расстояние от зданий
    const minDistanceFromPlayers = 50; // Минимальное расстояние от игроков
    
    // Для каждого игрока генерируем кусты вокруг него
    people.forEach(player => {
        // Проверяем область вокруг игрока на наличие кустов
        const bushesAroundPlayer = bushes.filter(bush => {
            const distance = Math.sqrt((bush.x - player.x) ** 2 + (bush.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Проверяем область вокруг игрока на наличие яблонь
        const treesAroundPlayer = appleTrees.filter(tree => {
            const distance = Math.sqrt((tree.x - player.x) ** 2 + (tree.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Целевое количество кустов вокруг игрока
        const targetBushesAroundPlayer = 15;
        const bushesToAdd = Math.max(0, targetBushesAroundPlayer - bushesAroundPlayer.length);
        
        // Целевое количество яблонь вокруг игрока (реже чем кусты)
        const targetTreesAroundPlayer = 3;
        const treesToAdd = Math.max(0, targetTreesAroundPlayer - treesAroundPlayer.length);
        
        // Добавляем недостающие кусты
        for (let i = 0; i < bushesToAdd; i++) {
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Случайная позиция в кольце вокруг игрока
                const angle = Math.random() * Math.PI * 2;
                const distance = minDistanceFromPlayers + Math.random() * (generationRadius - minDistanceFromPlayers);
                const newX = player.x + Math.cos(angle) * distance;
                const newY = player.y + Math.sin(angle) * distance;
                
                if (isValidPosition(newX, newY, minDistanceBetweenBushes, 'bush')) {
                    bushes.push({
                        x: newX,
                        y: newY,
                        durability: 10,
                        r: 75
                    });
                    break;
                }
            }
        }
        
        // Добавляем недостающие яблони
        for (let i = 0; i < treesToAdd; i++) {
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Случайная позиция в кольце вокруг игрока
                const angle = Math.random() * Math.PI * 2;
                const distance = minDistanceFromPlayers + Math.random() * (generationRadius - minDistanceFromPlayers);
                const newX = player.x + Math.cos(angle) * distance;
                const newY = player.y + Math.sin(angle) * distance;
                
                if (isValidPosition(newX, newY, 200, 'tree')) { // Больше расстояние для яблонь
                    appleTrees.push({
                        x: newX,
                        y: newY,
                        food: 5,
                        maxFood: 5,
                        lastHarvest: 0,
                        r: 45
                    });
                    break;
                }
            }
        }
        
        // Проверяем область вокруг игрока на наличие камней
        const stonesAroundPlayer = stones.filter(stone => {
            const distance = Math.sqrt((stone.x - player.x) ** 2 + (stone.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Целевое количество камней вокруг игрока
        const targetStonesAroundPlayer = 8;
        const stonesToAdd = Math.max(0, targetStonesAroundPlayer - stonesAroundPlayer.length);
        
        // Добавляем недостающие камни
        for (let i = 0; i < stonesToAdd; i++) {
            let attempts = 0;
            const maxAttempts = 25;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Случайная позиция в кольце вокруг игрока
                const angle = Math.random() * Math.PI * 2;
                const distance = minDistanceFromPlayers + Math.random() * (generationRadius - minDistanceFromPlayers);
                const newX = player.x + Math.cos(angle) * distance;
                const newY = player.y + Math.sin(angle) * distance;
                
                if (isValidPosition(newX, newY, 120, 'stone')) {
                    stones.push({
                        x: newX,
                        y: newY,
                        amount: Math.floor(Math.random() * 3) + 2, // 2-4 камня
                        size: Math.random() * 0.5 + 0.8, // Размер от 0.8 до 1.3
                        r: 25
                    });
                    break;
                }
            }
        }
        
        // Проверяем область вокруг игрока на наличие тигров
        const tigersAroundPlayer = sabertoothTigers.filter(tiger => {
            const distance = Math.sqrt((tiger.x - player.x) ** 2 + (tiger.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Целевое количество тигров вокруг игрока (редко)
        const targetTigersAroundPlayer = 1; // Только 1 тигр на область
        const tigersToAdd = Math.max(0, targetTigersAroundPlayer - tigersAroundPlayer.length);
        
        // Добавляем недостающих тигров (с вероятностью)
        for (let i = 0; i < tigersToAdd; i++) {
            // Низкая вероятность появления тигра
            if (Math.random() < 0.1) { // 10% шанс
                let attempts = 0;
                const maxAttempts = 15;
                
                while (attempts < maxAttempts) {
                    attempts++;
                    
                    // Случайная позиция в кольце вокруг игрока (дальше от игрока)
                    const angle = Math.random() * Math.PI * 2;
                    const distance = generationRadius * 0.6 + Math.random() * (generationRadius * 0.4);
                    const newX = player.x + Math.cos(angle) * distance;
                    const newY = player.y + Math.sin(angle) * distance;
                    
                    if (isValidPosition(newX, newY, 200, 'tiger')) {
                        sabertoothTigers.push({
                            x: newX,
                            y: newY,
                            health: 100,
                            maxHealth: 100,
                            target: null,
                            attackCooldown: 0,
                            speed: 1.2,
                            detectionRange: 180,
                            attackRange: 35,
                            damage: 20,
                            lastAttack: 0
                        });
                        break;
                    }
                }
            }
        }
        
        // Проверяем область вокруг игрока на наличие оленей
        const deerAroundPlayer = deer.filter(deerAnimal => {
            const distance = Math.sqrt((deerAnimal.x - player.x) ** 2 + (deerAnimal.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Целевое количество групп оленей вокруг игрока
        const hasDeersNearby = deerAroundPlayer.length > 0;
        
        // Спавним группу оленей только если их нет рядом и с малой вероятностью
        if (!hasDeersNearby && Math.random() < 0.05) { // 5% шанс появления группы
            const groupSize = Math.floor(Math.random() * 3) + 3; // Группа из 3-5 оленей
            
            // Находим позицию для центра группы
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Случайная позиция в кольце вокруг игрока
                const angle = Math.random() * Math.PI * 2;
                const distance = generationRadius * 0.4 + Math.random() * (generationRadius * 0.5);
                const groupCenterX = player.x + Math.cos(angle) * distance;
                const groupCenterY = player.y + Math.sin(angle) * distance;
                
                if (isValidPosition(groupCenterX, groupCenterY, 200, 'deer')) {
                    // Создаем группу оленей вокруг центра
                    for (let i = 0; i < groupSize; i++) {
                        const deerAngle = (i / groupSize) * Math.PI * 2 + Math.random() * 0.5;
                        const deerDistance = Math.random() * 80 + 20; // Радиус группы 20-100 пикселей
                        const deerX = groupCenterX + Math.cos(deerAngle) * deerDistance;
                        const deerY = groupCenterY + Math.sin(deerAngle) * deerDistance;
                        
                        if (isValidPosition(deerX, deerY, 100, 'deer')) {
                            deer.push({
                                x: deerX,
                                y: deerY,
                                health: 50,
                                maxHealth: 50,
                                speed: 2.5, // Быстрее людей
                                detectionRange: 120, // Видят людей издалека
                                fleeRange: 200, // Убегают далеко
                                fleeing: false,
                                fleeTarget: null,
                                grazing: true,
                                grazingTimer: Math.random() * 300 + 60
                            });
                        }
                    }
                    break;
                }
            }
        }
        
        // Проверяем область вокруг игрока на наличие мамонтов
        const mammothsAroundPlayer = mammoths.filter(mammoth => {
            const distance = Math.sqrt((mammoth.x - player.x) ** 2 + (mammoth.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Очень редкий спавн мамонтов (максимум 1 на большую область)
        const hasMammothsNearby = mammothsAroundPlayer.length > 0;
        
        if (!hasMammothsNearby && Math.random() < 0.003) { // 0.3% шанс появления мамонта (уменьшено с 1%)
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Случайная позиция далеко от игрока
                const angle = Math.random() * Math.PI * 2;
                const distance = generationRadius * 0.6 + Math.random() * (generationRadius * 0.4);
                const mammothX = player.x + Math.cos(angle) * distance;
                const mammothY = player.y + Math.sin(angle) * distance;
                
                if (isValidPosition(mammothX, mammothY, 300, 'mammoth')) {
                    mammoths.push({
                        x: mammothX,
                        y: mammothY,
                        health: 200, // Очень много здоровья
                        maxHealth: 200,
                        speed: 1.0, // Медленные
                        detectionRange: 150, // Хорошо видят угрозы
                        attackRange: 50, // Большой радиус атаки
                        damage: 60, // Очень опасные
                        lastAttack: 0,
                        fleeing: false,
                        angry: false, // Могут разозлиться при атаке
                        grazing: true,
                        grazingTimer: Math.random() * 600 + 120 // Долго пасутся
                    });
                    break;
                }
            }
        }

        // Очень редкий спавн императорских мамонтов (в 100 раз реже обычных)
        const steppeMammothsAroundPlayer = steppeMammoths.filter(mammoth => {
            const distance = Math.sqrt((mammoth.x - player.x) ** 2 + (mammoth.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        const hasSteppeMammothsNearby = steppeMammothsAroundPlayer.length > 0;
        
        if (!hasSteppeMammothsNearby && Math.random() < 0.00003) { // Увеличенный шанс для тестирования (в 100 раз реже мамонтов)
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                attempts++;
                
                // Случайная позиция далеко от игрока
                const angle = Math.random() * Math.PI * 2;
                const distance = generationRadius * 0.7 + Math.random() * (generationRadius * 0.3);
                const mammothX = player.x + Math.cos(angle) * distance;
                const mammothY = player.y + Math.sin(angle) * distance;
                
                if (isValidPosition(mammothX, mammothY, 400, 'mammoth')) {
                    steppeMammoths.push({
                        x: mammothX,
                        y: mammothY,
                        health: 800, // Огромное количество здоровья
                        maxHealth: 800,
                        speed: 0.8, // Еще медленнее обычных
                        detectionRange: 200, // Отличное зрение
                        attackRange: 70, // Больший радиус атаки
                        damage: 100, // Огромный урон
                        lastAttack: 0,
                        fleeing: false,
                        angry: false,
                        grazing: true,
                        grazingTimer: Math.random() * 900 + 180, // Очень долго пасутся
                        isSteppe: true // Маркер императорского мамонта
                    });
                    break;
                }
            }
        }

        // Проверяем область вокруг игрока на наличие пещер
        const cavesAroundPlayer = caves.filter(cave => {
            const distance = Math.sqrt((cave.x - player.x) ** 2 + (cave.y - player.y) ** 2);
            return distance <= generationRadius;
        });
        
        // Целевое количество пещер вокруг игрока (очень редко)
        const targetCavesAroundPlayer = 1; // Только 1 пещера на большую область
        const cavesToAdd = Math.max(0, targetCavesAroundPlayer - cavesAroundPlayer.length);
        
        // Добавляем недостающие пещеры (с очень низкой вероятностью)
        for (let i = 0; i < cavesToAdd; i++) {
            // Очень низкая вероятность появления пещеры
            if (Math.random() < 0.05) { // 5% шанс
                let attempts = 0;
                const maxAttempts = 20;
                
                while (attempts < maxAttempts) {
                    attempts++;
                    
                    // Случайная позиция в кольце вокруг игрока (далеко от игрока)
                    const angle = Math.random() * Math.PI * 2;
                    const distance = generationRadius * 0.8 + Math.random() * (generationRadius * 0.2);
                    const newX = player.x + Math.cos(angle) * distance;
                    const newY = player.y + Math.sin(angle) * distance;
                    
                    if (isValidPosition(newX, newY, 300, 'cave')) { // Большое расстояние между пещерами
                        caves.push({
                            x: newX,
                            y: newY,
                            width: 40 + Math.random() * 20, // Размер от 40 до 60
                            height: 30 + Math.random() * 15, // Размер от 30 до 45
                            hasBeenEntered: false,
                            neanderthalCount: 2 + Math.floor(Math.random() * 3) // 2-4 неандертальца
                        });
                        break;
                    }
                }
            }
        }
    });
    
    // Удаляем кусты и яблони, которые очень далеко от всех игроков
    bushes = bushes.filter(bush => {
        let closestDistance = Infinity;
        for (let player of people) {
            const distance = Math.sqrt((bush.x - player.x) ** 2 + (bush.y - player.y) ** 2);
            closestDistance = Math.min(closestDistance, distance);
        }
        return closestDistance < generationRadius * 3;
    });
    
    appleTrees = appleTrees.filter(tree => {
        let closestDistance = Infinity;
        for (let player of people) {
            const distance = Math.sqrt((tree.x - player.x) ** 2 + (tree.y - player.y) ** 2);
            closestDistance = Math.min(closestDistance, distance);
        }
        return closestDistance < generationRadius * 3;
    });
    
    stones = stones.filter(stone => {
        let closestDistance = Infinity;
        for (let player of people) {
            const distance = Math.sqrt((stone.x - player.x) ** 2 + (stone.y - player.y) ** 2);
            closestDistance = Math.min(closestDistance, distance);
        }
        return closestDistance < generationRadius * 3;
    });
    
    sabertoothTigers = sabertoothTigers.filter(tiger => {
        let closestDistance = Infinity;
        for (let player of people) {
            const distance = Math.sqrt((tiger.x - player.x) ** 2 + (tiger.y - player.y) ** 2);
            closestDistance = Math.min(closestDistance, distance);
        }
        return closestDistance < generationRadius * 3;
    });
    
    deer = deer.filter(deerAnimal => {
        let closestDistance = Infinity;
        for (let player of people) {
            const distance = Math.sqrt((deerAnimal.x - player.x) ** 2 + (deerAnimal.y - player.y) ** 2);
            closestDistance = Math.min(closestDistance, distance);
        }
        return closestDistance < generationRadius * 3;
    });
    
    caves = caves.filter(cave => {
        let closestDistance = Infinity;
        for (let player of people) {
            const distance = Math.sqrt((cave.x - player.x) ** 2 + (cave.y - player.y) ** 2);
            closestDistance = Math.min(closestDistance, distance);
        }
        return closestDistance < generationRadius * 3;
    });
}

// Вспомогательная функция для проверки валидности позиции
function isValidPosition(x, y, minDistance, type) {
    // Проверяем расстояние до стартового шалаша
    const distanceToHut = Math.sqrt((x - 400) ** 2 + (y - 350) ** 2);
    if (distanceToHut < 150) return false;
    
    // Проверяем расстояние до всех игроков
    for (let p of people) {
        const distanceToPlayer = Math.sqrt((x - p.x) ** 2 + (p.y - y) ** 2);
        if (distanceToPlayer < 50) return false;
    }
    
    // Проверяем расстояние до всех зданий
    for (let building of buildings) {
        const distanceToBuilding = Math.sqrt((x - building.x) ** 2 + (y - building.y) ** 2);
        if (distanceToBuilding < 120) return false;
    }
    
    // Проверяем расстояние до кустов
    for (let bush of bushes) {
        const distance = Math.sqrt((x - bush.x) ** 2 + (y - bush.y) ** 2);
        if (distance < minDistance) return false;
    }
    
    // Проверяем расстояние до яблонь
    for (let tree of appleTrees) {
        const distance = Math.sqrt((x - tree.x) ** 2 + (y - tree.y) ** 2);
        if (distance < minDistance) return false;
    }
    
    // Проверяем расстояние до камней
    for (let stone of stones) {
        const distance = Math.sqrt((x - stone.x) ** 2 + (y - stone.y) ** 2);
        if (distance < minDistance) return false;
    }
    
    // Проверяем расстояние до тигров (кроме случая, когда мы размещаем тигра)
    if (type !== 'tiger') {
        for (let tiger of sabertoothTigers) {
            const distance = Math.sqrt((x - tiger.x) ** 2 + (y - tiger.y) ** 2);
            if (distance < 100) return false; // Тигры не должны появляться слишком близко к другим объектам
        }
    }
    
    // Проверяем расстояние до пещер (кроме случая, когда мы размещаем пещеру)
    if (type !== 'cave') {
        for (let cave of caves) {
            const distance = Math.sqrt((x - cave.x) ** 2 + (y - cave.y) ** 2);
            if (distance < cave.width + 50) return false; // Пещеры должны быть изолированы
        }
    }
    
    return true;
}

// Человечки
let people = [
    { x: 200, y: 150, target: null, hasAxe: false, choppingTimer: 0, currentBush: null, harvestingTreePos: null, harvestTimer: 0, statusDisplayTimer: 0, type: 'civilian', collectingStonePos: null, collectTimer: 0, lastAction: null, health: 100, maxHealth: 100, targetStone: null },
    { x: 250, y: 200, target: null, hasAxe: false, choppingTimer: 0, currentBush: null, harvestingTreePos: null, harvestTimer: 0, statusDisplayTimer: 0, type: 'civilian', collectingStonePos: null, collectTimer: 0, lastAction: null, health: 100, maxHealth: 100, targetStone: null },
    { x: 220, y: 250, target: null, hasAxe: false, choppingTimer: 0, currentBush: null, harvestingTreePos: null, harvestTimer: 0, statusDisplayTimer: 0, type: 'civilian', collectingStonePos: null, collectTimer: 0, lastAction: null, health: 100, maxHealth: 100, targetStone: null },
    { x: 180, y: 220, target: null, hasAxe: false, choppingTimer: 0, currentBush: null, harvestingTreePos: null, harvestTimer: 0, statusDisplayTimer: 0, type: 'civilian', collectingStonePos: null, collectTimer: 0, lastAction: null, health: 100, maxHealth: 100, targetStone: null },
    { x: 230, y: 180, target: null, hasAxe: false, choppingTimer: 0, currentBush: null, harvestingTreePos: null, harvestTimer: 0, statusDisplayTimer: 0, type: 'civilian', collectingStonePos: null, collectTimer: 0, lastAction: null, health: 100, maxHealth: 100, targetStone: null }
];
let selectedPeople = []; // Массив индексов выделенных персонажей

// Функция для обновления списка выделенных персонажей при удалении персонажа
function updateSelectedPeopleAfterRemoval(removedIndex) {
    selectedPeople = selectedPeople
        .filter(idx => idx !== removedIndex) // Убираем удаленного персонажа
        .map(idx => idx > removedIndex ? idx - 1 : idx); // Сдвигаем индексы
}

// Система населения
let maxPopulation = 5; // Начальный лимит населения


function drawResources() {
    // Проверяем мобильный режим более надежно
    // Приоритет флагу showMobileControls, затем другие факторы
    const screenRatio = window.innerWidth / window.innerHeight;
    const isPortraitMode = screenRatio < 1.2; // Портретная ориентация или почти квадратный экран
    const isSmallScreen = window.innerWidth <= 1024 || canvas.width <= 1024;
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Если включен мобильный режим - всегда мобильная версия
    const isMobileDevice = showMobileControls || 
                          isSmallScreen || 
                          (isPortraitMode && window.innerWidth <= 1200) || 
                          (hasTouchSupport && window.innerWidth <= 1366) ||
                          (window.innerWidth <= 800) || // Дополнительная проверка для узких экранов
                          (canvas.width <= 800); // И дополнительная проверка canvas
    
    const fontSize = isMobileDevice ? 14 : 20;
    const resourceHeight = isMobileDevice ? 40 : 60;
    const yPosition = isMobileDevice ? resourceHeight/2 : 30;
    
    // Отладка (только в первый раз)
    if (!window.resourceDebugShown) {
        console.log('=== RESOURCE BAR DEBUG ===');
        console.log('Window size:', window.innerWidth, 'x', window.innerHeight);
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        console.log('Screen ratio:', (window.innerWidth / window.innerHeight).toFixed(2));
        console.log('showMobileControls:', showMobileControls);
        console.log('isPortraitMode:', isPortraitMode);
        console.log('isSmallScreen:', isSmallScreen);
        console.log('hasTouchSupport:', hasTouchSupport);
        console.log('Final isMobileDevice:', isMobileDevice);
        console.log('fontSize:', fontSize, 'height:', resourceHeight);
        console.log('========================');
        window.resourceDebugShown = true;
    }
    
    // Фон для ресурсов
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, resourceHeight);
    
    ctx.save();
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    if (isMobileDevice) {
        // Мобильная версия - компактная
        // Дерево
        ctx.fillStyle = '#8B4513';
        ctx.fillText('🌳', 10, yPosition);
        ctx.fillStyle = '#fff';
        ctx.fillText(resources.wood.toString(), 30, yPosition);
        
        // Камень
        ctx.fillStyle = '#696969';
        ctx.fillText('🪨', 70, yPosition);
        ctx.fillStyle = '#fff';
        ctx.fillText(resources.stone.toString(), 90, yPosition);
        
        // Пища
        ctx.fillStyle = '#FF6B35';
        ctx.fillText('🍎', 130, yPosition);
        ctx.fillStyle = '#fff';
        ctx.fillText(resources.food.toString(), 150, yPosition);
        
        // Эпоха - рядом с ресурсами (ближе к центру)
        ctx.font = `bold ${fontSize-2}px Arial`;
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'left';
        ctx.fillText(`${eras[currentEra].name}`, 190, yPosition);
    } else {
        // Десктопная версия - полная
        // Дерево
        ctx.fillStyle = '#8B4513';
        ctx.fillText('🌳', 20, yPosition);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Дерево: ${resources.wood}`, 60, yPosition);
        
        // Камень
        ctx.fillStyle = '#696969';
        ctx.fillText('🪨', 250, yPosition);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Камень: ${resources.stone}`, 290, yPosition);
        
        // Пища
        ctx.fillStyle = '#FF6B35';
        ctx.fillText('🍎', 450, yPosition);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Пища: ${resources.food}`, 490, yPosition);
        
        // Подсказки управления
        ctx.font = '11px Arial';
        ctx.fillStyle = '#ccc';
        ctx.fillText('Ctrl+клик - множественное выделение | ПКМ - сброс выделения', 10, canvas.height - 10);
        
        // Эпоха
        const eraX = 650;
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'left';
        ctx.fillText(`Эпоха: ${eras[currentEra].name}`, eraX, yPosition);
    }
    
    ctx.restore();
}

// Система строительства
let buildingMode = false;
let buildingType = null;
let selectedBuilding = null;
let showBuildingModal = false; // Модальное окно для мобильных устройств

function drawBuildingPanel() {
    // Показываем панель строительства только если выбран хотя бы один гражданский персонаж
    if (selectedPeople.length === 0) return;
    const hasAnyBuilders = selectedPeople.some(idx => people[idx] && people[idx].type === 'civilian');
    if (!hasAnyBuilders) return;
    
    // Адаптивная высота панели для мобильных устройств
    const isMobile = showMobileControls || window.innerWidth <= 800;
    const panelHeight = isMobile ? 80 : 120; // Уменьшили с 120 до 80 для мобильных
    const panelY = canvas.height - panelHeight;
    
    // Отладка мобильного режима (только первый раз)
    if (!window.buildingPanelDebugShown) {
        console.log('=== BUILDING PANEL DEBUG ===');
        console.log('showMobileControls:', showMobileControls);
        console.log('window.innerWidth:', window.innerWidth);
        console.log('isMobile:', isMobile);
        console.log('========================');
        window.buildingPanelDebugShown = true;
    }
    
    // Фон панели
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, panelY, canvas.width, panelHeight);
    
    ctx.save();
    
    // Заголовок вкладки
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Строительство', 20, panelY + 25);
    
    if (isMobile) {
        // Мобильная версия - только кнопка "ОТКРЫТЬ"
        const openButtonX = 20;
        const openButtonY = panelY + 35;
        const openButtonWidth = 120;
        const openButtonHeight = 30;
        
        // Фон кнопки "ОТКРЫТЬ"
        ctx.fillStyle = '#3498db';
        ctx.fillRect(openButtonX, openButtonY, openButtonWidth, openButtonHeight);
        
        // Рамка кнопки
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(openButtonX, openButtonY, openButtonWidth, openButtonHeight);
        
        // Текст кнопки
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('ОТКРЫТЬ', openButtonX + openButtonWidth/2, openButtonY + openButtonHeight/2 + 5);
        
        // Сохраняем координаты кнопки для обработки кликов
        window.openBuildingModalButton = {
            x: openButtonX,
            y: openButtonY,
            width: openButtonWidth,
            height: openButtonHeight
        };
    } else {
        // Десктопная версия - обычные кнопки зданий
        const buttonWidth = 120;
        const buttonHeight = 35;
        
        // Кнопка жилища
        const houseButtonX = 20;
        const houseButtonY = panelY + 40;
        
        // Проверяем, достаточно ли ресурсов для жилища (требуется 10 дерева)
        const canBuildHouse = resources.wood >= 10;
    
    // Фон кнопки
    ctx.fillStyle = canBuildHouse ? (buildingMode && buildingType === 'house' ? '#27ae60' : '#34495e') : '#7f8c8d';
    ctx.fillRect(houseButtonX, houseButtonY, buttonWidth, buttonHeight);
    
    // Рамка кнопки
    ctx.strokeStyle = canBuildHouse ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(houseButtonX, houseButtonY, buttonWidth, buttonHeight);
    
    // Текст кнопки
    ctx.font = '14px Arial';
    ctx.fillStyle = canBuildHouse ? '#fff' : '#95a5a6';
    ctx.textAlign = 'center';
    ctx.fillText('🏠 Жилище', houseButtonX + buttonWidth/2, houseButtonY + 22);
    
    // Стоимость
    ctx.font = '12px Arial';
    ctx.fillStyle = canBuildHouse ? '#bdc3c7' : '#7f8c8d';
    ctx.fillText('10 дерева', houseButtonX + buttonWidth/2, houseButtonY + buttonHeight + 15);
    
    // Кнопка дома размножения
    const reproductionHouseButtonX = isMobile ? 130 : 160; // Адаптивная позиция X
    const reproductionHouseButtonY = panelY + (isMobile ? 30 : 40);
    
    // Проверяем, достаточно ли ресурсов для дома размножения (требуется 15 дерева и 5 камня)
    const canBuildReproductionHouse = resources.wood >= 15 && resources.stone >= 5;
    
    // Фон кнопки
    ctx.fillStyle = canBuildReproductionHouse ? (buildingMode && buildingType === 'reproduction_house' ? '#27ae60' : '#34495e') : '#7f8c8d';
    ctx.fillRect(reproductionHouseButtonX, reproductionHouseButtonY, buttonWidth, buttonHeight);
    
    // Рамка кнопки
    ctx.strokeStyle = canBuildReproductionHouse ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(reproductionHouseButtonX, reproductionHouseButtonY, buttonWidth, buttonHeight);
    
    // Текст кнопки
    ctx.font = '14px Arial';
    ctx.fillStyle = canBuildReproductionHouse ? '#fff' : '#95a5a6';
    ctx.textAlign = 'center';
    ctx.fillText('🏘️ Хижина рода', reproductionHouseButtonX + buttonWidth/2, reproductionHouseButtonY + 22);
    
    // Стоимость
    ctx.font = '12px Arial';
    ctx.fillStyle = canBuildReproductionHouse ? '#bdc3c7' : '#7f8c8d';
    ctx.fillText('15 дерева, 5 камня', reproductionHouseButtonX + buttonWidth/2, reproductionHouseButtonY + buttonHeight + 15);
    
    // Кнопка лагеря воинов
    const warriorCampButtonX = isMobile ? 240 : 300; // Адаптивная позиция X
    const warriorCampButtonY = panelY + (isMobile ? 30 : 40);
    
    // Проверяем, достаточно ли ресурсов для лагеря воинов (требуется 20 дерева и 10 камня)
    const canBuildWarriorCamp = resources.wood >= 20 && resources.stone >= 10;
    
    // Фон кнопки
    ctx.fillStyle = canBuildWarriorCamp ? (buildingMode && buildingType === 'warrior_camp' ? '#27ae60' : '#34495e') : '#7f8c8d';
    ctx.fillRect(warriorCampButtonX, warriorCampButtonY, buttonWidth, buttonHeight);
    
    // Рамка кнопки
    ctx.strokeStyle = canBuildWarriorCamp ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(warriorCampButtonX, warriorCampButtonY, buttonWidth, buttonHeight);
    
    // Текст кнопки
    ctx.font = '14px Arial';
    ctx.fillStyle = canBuildWarriorCamp ? '#fff' : '#95a5a6';
    ctx.textAlign = 'center';
    ctx.fillText('⚔️ Лагерь воинов', warriorCampButtonX + buttonWidth/2, warriorCampButtonY + 22);
    
    // Стоимость
    ctx.font = '12px Arial';
    ctx.fillStyle = canBuildWarriorCamp ? '#bdc3c7' : '#7f8c8d';
    ctx.fillText('20 дерева, 10 камня', warriorCampButtonX + buttonWidth/2, warriorCampButtonY + buttonHeight + 15);
    
    // Кнопка костра (только в новокаменном веке)
    if (canBuildInCurrentEra('bonfire')) {
        const bonfireButtonX = isMobile ? 350 : 440; // Адаптивная позиция X
        const bonfireButtonY = panelY + (isMobile ? 30 : 40);
        
        // Проверяем, достаточно ли ресурсов для костра (требуется 10 дерева и 5 камня)
        const canBuildBonfire = resources.wood >= 10 && resources.stone >= 5;
        
        // Фон кнопки
        ctx.fillStyle = canBuildBonfire ? (buildingMode && buildingType === 'bonfire' ? '#27ae60' : '#34495e') : '#7f8c8d';
        ctx.fillRect(bonfireButtonX, bonfireButtonY, buttonWidth, buttonHeight);
        
        // Рамка кнопки
        ctx.strokeStyle = canBuildBonfire ? '#fff' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(bonfireButtonX, bonfireButtonY, buttonWidth, buttonHeight);
        
        // Текст кнопки
        ctx.font = '14px Arial';
        ctx.fillStyle = canBuildBonfire ? '#fff' : '#95a5a6';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 Костер', bonfireButtonX + buttonWidth/2, bonfireButtonY + 22);
        
        // Стоимость
        ctx.font = '12px Arial';
        ctx.fillStyle = canBuildBonfire ? '#bdc3c7' : '#7f8c8d';
        ctx.fillText('10 дерева, 5 камня', bonfireButtonX + buttonWidth/2, bonfireButtonY + buttonHeight + 15);
        
        // Сохраняем координаты кнопки костра для обработки кликов
        window.bonfireButtonBounds = {
            x: bonfireButtonX,
            y: bonfireButtonY,
            width: buttonWidth,
            height: buttonHeight,
            canBuild: canBuildBonfire
        };
    }
    
    // Кнопка фермы (только в новокаменном веке)
    if (canBuildInCurrentEra('farm')) {
        const farmButtonX = isMobile ? 460 : 580; // Адаптивная позиция X
        const farmButtonY = panelY + (isMobile ? 30 : 40);
        
        // Проверяем, достаточно ли ресурсов для фермы (требуется 10 дерева)
        const canBuildFarm = resources.wood >= 10;
        
        // Фон кнопки
        ctx.fillStyle = canBuildFarm ? (buildingMode && buildingType === 'farm' ? '#27ae60' : '#34495e') : '#7f8c8d';
        ctx.fillRect(farmButtonX, farmButtonY, buttonWidth, buttonHeight);
        
        // Рамка кнопки
        ctx.strokeStyle = canBuildFarm ? '#fff' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(farmButtonX, farmButtonY, buttonWidth, buttonHeight);
        
        // Текст кнопки
        ctx.font = '14px Arial';
        ctx.fillStyle = canBuildFarm ? '#fff' : '#95a5a6';
        ctx.textAlign = 'center';
        ctx.fillText('🌾 Ферма', farmButtonX + buttonWidth/2, farmButtonY + 22);
        
        // Стоимость
        ctx.font = '12px Arial';
        ctx.fillStyle = canBuildFarm ? '#bdc3c7' : '#7f8c8d';
        ctx.fillText('10 дерева', farmButtonX + buttonWidth/2, farmButtonY + buttonHeight + 15);
        
        // Сохраняем координаты кнопки фермы для обработки кликов
        window.farmButtonBounds = {
            x: farmButtonX,
            y: farmButtonY,
            width: buttonWidth,
            height: buttonHeight,
            canBuild: canBuildFarm
        };
    }
    
    // Сохраняем координаты кнопок для обработки кликов
    window.houseButtonBounds = {
        x: houseButtonX,
        y: houseButtonY,
        width: buttonWidth,
        height: buttonHeight,
        canBuild: canBuildHouse
    };
    
    window.reproductionHouseButtonBounds = {
        x: reproductionHouseButtonX,
        y: reproductionHouseButtonY,
        width: buttonWidth,
        height: buttonHeight,
        canBuild: canBuildReproductionHouse
    };
    
    window.warriorCampButtonBounds = {
        x: warriorCampButtonX,
        y: warriorCampButtonY,
        width: buttonWidth,
        height: buttonHeight,
        canBuild: canBuildWarriorCamp
    };
    
    } // Закрываем блок else для десктопа
    
    ctx.restore();
}

// Функция для отображения центрированных сообщений о строительстве
function drawBuildingMessage() {
    if (!buildingMode || !buildingType) return;
    
    // Показываем сообщения и на мобильных устройствах
    let message = '';
    let color = '#fff';
    
    switch(buildingType) {
        case 'house':
            message = window.innerWidth <= 800 ? 'Тапните для постройки жилища' : 'Кликните на карту, чтобы построить жилище (+5 места)';
            color = '#f39c12';
            break;
        case 'reproduction_house':
            message = window.innerWidth <= 800 ? 'Тапните для постройки хижины рода' : 'Кликните на карту, чтобы построить хижину рода (разрешает найм)';
            color = '#e74c3c';
            break;
        case 'warrior_camp':
            message = window.innerWidth <= 800 ? 'Тапните для постройки лагеря воинов' : 'Кликните на карту, чтобы построить лагерь воинов (найм воинов)';
            color = '#8e44ad';
            break;
        case 'bonfire':
            message = window.innerWidth <= 800 ? 'Тапните для постройки костра' : 'Кликните на карту, чтобы построить костер (найм факельщиков)';
            color = '#e67e22';
            break;
        case 'farm':
            message = window.innerWidth <= 800 ? 'Тапните для постройки фермы' : 'Кликните на карту, чтобы построить ферму (производство еды)';
            color = '#27ae60';
            break;
    }
    
    if (message) {
        ctx.save();
        
        // Полупрозрачный фон для сообщения
        const messageWidth = ctx.measureText(message).width + 40;
        const messageHeight = 50;
        const messageX = (canvas.width - messageWidth) / 2;
        const messageY = (canvas.height - messageHeight) / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(messageX, messageY, messageWidth, messageHeight);
        
        // Убрали рамку - оставляем только фон и текст
        
        // Центрированный текст
        const fontSize = window.innerWidth <= 800 ? '14px' : '16px';
        ctx.font = `${fontSize} Arial`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        
        ctx.restore();
    }
}

// Функция для отображения модального окна с сеткой зданий (для мобильных)
function drawBuildingModal() {
    if (!showBuildingModal) return;
    
    ctx.save();
    
    // Полупрозрачный фон
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Размеры модального окна - адаптированы для мобильных устройств
    const modalWidth = Math.min(400, canvas.width - 20);  // Вернули ширину для 2 колонок
    const modalHeight = Math.min(400, canvas.height - 60); // Увеличили высоту для 4 строк
    const modalX = (canvas.width - modalWidth) / 2;
    const modalY = (canvas.height - modalHeight) / 2;
    
    // Фон модального окна
    ctx.fillStyle = 'rgba(40, 40, 40, 0.95)';
    ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
    
    // Рамка модального окна
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
    
    // Заголовок
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Строительство', modalX + modalWidth/2, modalY + 30);
    
    // Сетка зданий 2x4 (вертикальная)
    const gridStartX = modalX + 20;  
    const gridStartY = modalY + 60;
    const cellSpacing = 8;           
    const availableWidth = modalWidth - 40; // Отступы слева и справа
    const availableHeight = modalHeight - 120; // Отступы сверху и снизу (заголовок + кнопка)
    
    // Рассчитываем размер ячейки исходя из доступного места
    const cellWidth = (availableWidth - cellSpacing) / 2; // 2 колонки
    const cellHeight = (availableHeight - 3 * cellSpacing) / 4; // 4 строки
    const cellSize = Math.min(cellWidth, cellHeight * 1.4); // Ограничиваем размер
    
    // Определяем доступные здания в зависимости от эпохи
    const buildings = [
        { 
            type: 'house', 
            icon: '🏠', 
            name: 'Жилище', 
            cost: '10 дерева', 
            canBuildEra: true,
            canBuildResources: resources.wood >= 10,
            canBuild: resources.wood >= 10 
        },
        { 
            type: 'reproduction_house', 
            icon: '🏘️', 
            name: 'Хижина рода', 
            cost: '15 дерева, 5 камня', 
            canBuildEra: true,
            canBuildResources: resources.wood >= 15 && resources.stone >= 5,
            canBuild: resources.wood >= 15 && resources.stone >= 5 
        },
        { 
            type: 'warrior_camp', 
            icon: '⚔️', 
            name: 'Лагерь воинов', 
            cost: '20 дерева, 10 камня', 
            canBuildEra: true,
            canBuildResources: resources.wood >= 20 && resources.stone >= 10,
            canBuild: resources.wood >= 20 && resources.stone >= 10 
        },
        { 
            type: 'bonfire', 
            icon: '🔥', 
            name: 'Костер', 
            cost: '10 дерева, 5 камня', 
            canBuildEra: canBuildInCurrentEra('bonfire'),
            canBuildResources: resources.wood >= 10 && resources.stone >= 5,
            canBuild: canBuildInCurrentEra('bonfire') && resources.wood >= 10 && resources.stone >= 5 
        },
        { 
            type: 'farm', 
            icon: '🌾', 
            name: 'Ферма', 
            cost: '10 дерева', 
            canBuildEra: canBuildInCurrentEra('farm'),
            canBuildResources: resources.wood >= 10,
            canBuild: canBuildInCurrentEra('farm') && resources.wood >= 10 
        },
        null, // Пустая ячейка
        null, // Пустая ячейка
        null  // Пустая ячейка
    ];
    
    // Сохраняем координаты кнопок для обработки кликов
    window.buildingModalButtons = [];
    
    // Рисуем сетку зданий
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
            const index = row * 2 + col;
            const building = buildings[index];
            
            const cellX = gridStartX + col * (cellWidth + cellSpacing);
            const cellY = gridStartY + row * (cellHeight + cellSpacing);
            const cellW = cellWidth;
            const cellH = cellHeight;
            
            if (building) {
                // Определяем тип недоступности
                const isLockedByEra = !building.canBuildEra;
                const isLockedByResources = building.canBuildEra && !building.canBuildResources;
                const isAvailable = building.canBuild;
                
                // Фон ячейки
                if (isLockedByEra) {
                    ctx.fillStyle = '#2c2c2c'; // Черный фон для заблокированных эпохой
                } else if (isLockedByResources) {
                    ctx.fillStyle = '#c0c0c0'; // Серый фон для недостатка ресурсов
                } else {
                    ctx.fillStyle = '#e8e8e8'; // Светлый фон для доступных
                }
                ctx.fillRect(cellX, cellY, cellW, cellH);
                
                // Рамка ячейки
                ctx.strokeStyle = isAvailable ? '#333' : '#666';
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX, cellY, cellW, cellH);
                
                if (isLockedByEra) {
                    // Для заблокированных эпохой - показываем замок
                    ctx.font = `${Math.min(20, cellW * 0.3)}px Arial`;
                    ctx.fillStyle = '#888';
                    ctx.textAlign = 'center';
                    ctx.fillText('🔒', cellX + cellW/2, cellY + cellH * 0.4);
                    
                    // Название здания серым цветом
                    ctx.font = `${Math.min(8, cellW * 0.11)}px Arial`;
                    ctx.fillStyle = '#888';
                    ctx.fillText(building.name, cellX + cellW/2, cellY + cellH * 0.7);
                } else {
                    // Обычное отображение для доступных или недоступных только по ресурсам
                    
                    // Иконка здания
                    ctx.font = `${Math.min(16, cellW * 0.25)}px Arial`;
                    ctx.fillStyle = isAvailable ? '#000' : '#666';
                    ctx.textAlign = 'center';
                    ctx.fillText(building.icon, cellX + cellW/2, cellY + cellH * 0.25);
                    
                    // Название здания
                    ctx.font = `${Math.min(9, cellW * 0.12)}px Arial`;
                    ctx.fillStyle = isAvailable ? '#000' : '#666';
                    ctx.fillText(building.name, cellX + cellW/2, cellY + cellH * 0.5);
                    
                    // Стоимость
                    ctx.font = `${Math.min(7, cellW * 0.1)}px Arial`;
                    ctx.fillStyle = isAvailable ? '#333' : '#666';
                    ctx.fillText(building.cost, cellX + cellW/2, cellY + cellH * 0.75);
                }
                
                // Сохраняем координаты для обработки кликов
                window.buildingModalButtons.push({
                    type: building.type,
                    x: cellX,
                    y: cellY,
                    width: cellW,
                    height: cellH,
                    canBuild: building.canBuild
                });
            } else {
                // Пустая ячейка
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(cellX, cellY, cellW, cellH);
                
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX, cellY, cellW, cellH);
                
                // Знак пустой ячейки
                ctx.font = `${Math.min(12, cellW * 0.2)}px Arial`;
                ctx.fillStyle = '#999';
                ctx.textAlign = 'center';
                ctx.fillText('—', cellX + cellW/2, cellY + cellH/2 + 3);
            }
        }
    }
    
    // Общая рамка вокруг всей таблицы зданий (2 столбца x 4 строки)
    const tableWidth = 2 * cellWidth + cellSpacing; // размер двух ячеек + отступ между ними
    const tableHeight = 4 * cellHeight + 3 * cellSpacing; // размер четырех ячеек + отступы между ними
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(gridStartX, gridStartY, tableWidth, tableHeight);
    
    // Кнопка закрытия
    const closeButtonX = modalX + modalWidth - 40;
    const closeButtonY = modalY + 10;
    const closeButtonSize = 30;
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('×', closeButtonX + closeButtonSize/2, closeButtonY + closeButtonSize/2 + 5);
    
    // Сохраняем координаты кнопки закрытия
    window.buildingModalCloseButton = {
        x: closeButtonX,
        y: closeButtonY,
        width: closeButtonSize,
        height: closeButtonSize
    };
    
    ctx.restore();
}

// Функция для добавления сообщений в панель населения
function addPopulationMessage(message, duration = 180) { // 3 секунды при 60 FPS
    populationMessages.push({
        text: message,
        timer: duration,
        id: Date.now() + Math.random() // Уникальный ID
    });
    
    // Ограничиваем количество сообщений до 3
    if (populationMessages.length > 3) {
        populationMessages.shift();
    }
}

function drawReproductionHousePanel() {
    if (!selectedBuilding || selectedBuilding.type !== 'reproduction_house') {
        // Очищаем кнопки если панель не активна
        window.reproductionHouseHireButton = null;
        window.reproductionHouseHunterButton = null;
        window.reproductionHouseTechButton = null;
        window.reproductionHouseCloseButton = null;
        return;
    }
    
    const panelWidth = 200;
    const panelHeight = 240; // Увеличили высоту для кнопки технологии
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = canvas.height / 2 - panelHeight / 2;
    
    // Фон панели
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.save();
    
    // Заголовок
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🏘️ Хижина рода', panelX + panelWidth / 2, panelY + 25);
    
    // Кнопка найма
    const buttonX = panelX + 40;
    const buttonY = panelY + 40;
    const buttonWidth = 120;
    const buttonHeight = 50;
    
    // Проверяем возможность найма
    const canHire = people.length < maxPopulation && resources.food >= 5;
    
    // Фон кнопки
    ctx.fillStyle = canHire ? '#27ae60' : '#7f8c8d';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = canHire ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Рисуем человечка в центре кнопки
    ctx.fillStyle = canHire ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(buttonX + buttonWidth/2, buttonY + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Текст кнопки под человечком
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = canHire ? '#fff' : '#000';
    ctx.fillText('Человек', buttonX + buttonWidth/2, buttonY + 30);
    ctx.fillText('(5 пищи)', buttonX + buttonWidth/2, buttonY + 42);
    
    // Сохраняем координаты для кликов
    window.reproductionHouseHireButton = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        canHire: canHire
    };
    
    // Кнопка найма охотника
    const hunterButtonX = panelX + 40;
    const hunterButtonY = panelY + 100;
    const hunterButtonWidth = 120;
    const hunterButtonHeight = 50;
    
    // Проверяем возможность найма охотника
    const canHireHunter = people.length < maxPopulation && resources.wood >= 5 && resources.food >= 3;
    
    // Фон кнопки охотника
    ctx.fillStyle = canHireHunter ? '#e67e22' : '#7f8c8d';
    ctx.fillRect(hunterButtonX, hunterButtonY, hunterButtonWidth, hunterButtonHeight);
    ctx.strokeStyle = canHireHunter ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(hunterButtonX, hunterButtonY, hunterButtonWidth, hunterButtonHeight);
    
    // Рисуем охотника в центре кнопки
    ctx.fillStyle = canHireHunter ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(hunterButtonX + hunterButtonWidth/2, hunterButtonY + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Рисуем лук охотника
    ctx.strokeStyle = canHireHunter ? '#fff' : '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hunterButtonX + hunterButtonWidth/2 + 12, hunterButtonY + 12, 6, Math.PI * 0.3, Math.PI * 1.7);
    ctx.stroke();
    
    // Текст кнопки охотника
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = canHireHunter ? '#fff' : '#000';
    ctx.fillText('Охотник', hunterButtonX + hunterButtonWidth/2, hunterButtonY + 30);
    ctx.fillText('(5 дерева, 3 пищи)', hunterButtonX + hunterButtonWidth/2, hunterButtonY + 42);
    
    // Сохраняем координаты для кликов
    window.reproductionHouseHunterButton = {
        x: hunterButtonX,
        y: hunterButtonY,
        width: hunterButtonWidth,
        height: hunterButtonHeight,
        canHire: canHireHunter
    };
    
    // Кнопка технологии "Неолитическая революция"
    if (currentEra === 'stone_age') {
        const techButtonX = panelX + 40;
        const techButtonY = panelY + 160;
        const techButtonWidth = 120;
        const techButtonHeight = 50;
        
        // Проверяем возможность изучения технологии
        const canResearchTech = resources.food >= 200;
        
        // Фон кнопки технологии
        ctx.fillStyle = canResearchTech ? '#9b59b6' : '#7f8c8d';
        ctx.fillRect(techButtonX, techButtonY, techButtonWidth, techButtonHeight);
        ctx.strokeStyle = canResearchTech ? '#fff' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(techButtonX, techButtonY, techButtonWidth, techButtonHeight);
        
        // Рисуем иконку технологии (кость)
        ctx.fillStyle = canResearchTech ? '#fff' : '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦴', techButtonX + techButtonWidth/2, techButtonY + 20);
        
        // Текст кнопки технологии
        ctx.font = '9px Arial';
        ctx.fillStyle = canResearchTech ? '#fff' : '#000';
        ctx.fillText('Неолитическая', techButtonX + techButtonWidth/2, techButtonY + 30);
        ctx.fillText('революция', techButtonX + techButtonWidth/2, techButtonY + 40);
        ctx.fillText('(200 пищи)', techButtonX + techButtonWidth/2, techButtonY + 48);
        
        // Сохраняем координаты для кликов
        window.reproductionHouseTechButton = {
            x: techButtonX,
            y: techButtonY,
            width: techButtonWidth,
            height: techButtonHeight,
            canResearch: canResearchTech
        };
    } else {
        window.reproductionHouseTechButton = null;
    }
    
    // Кнопка закрытия (всегда показываем)
    const closeButtonSize = 30;
    const closeButtonX = panelX + panelWidth - closeButtonSize - 5;
    const closeButtonY = panelY + 5;
    
    // Красный квадрат
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    // Белая рамка
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    // Белый крестик
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeButtonX + closeButtonSize/2, closeButtonY + closeButtonSize/2);
    
    // Сохраняем координаты для обработки кликов
    window.reproductionHouseCloseButton = {
        x: closeButtonX,
        y: closeButtonY,
        width: closeButtonSize,
        height: closeButtonSize
    };
    
    ctx.restore();
}

function drawWarriorCampPanel() {
    if (!selectedBuilding || selectedBuilding.type !== 'warrior_camp') {
        // Очищаем кнопки если панель не активна
        window.warriorCampHireButton = null;
        window.warriorCampHireSpearmanButton = null;
        window.warriorCampCloseButton = null;
        return;
    }
    
    const panelWidth = 300;
    const panelHeight = 140;
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = canvas.height / 2 - panelHeight / 2;
    
    // Фон панели
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.save();
    
    // Заголовок
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('⚔️ Лагерь воинов', panelX + panelWidth / 2, panelY + 25);
    
    // Кнопка найма воина
    const buttonX1 = panelX + 20;
    const buttonY = panelY + 40;
    const buttonWidth = 120;
    const buttonHeight = 50;
    
    // Проверяем возможность найма воина
    const canHireWarrior = people.length < maxPopulation && resources.wood >= 10 && resources.food >= 3;
    
    // Фон кнопки воина
    ctx.fillStyle = canHireWarrior ? '#8e44ad' : '#7f8c8d';
    ctx.fillRect(buttonX1, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = canHireWarrior ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX1, buttonY, buttonWidth, buttonHeight);
    
    // Рисуем воина в центре кнопки
    ctx.fillStyle = canHireWarrior ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(buttonX1 + buttonWidth/2, buttonY + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Дубинка воина
    ctx.strokeStyle = canHireWarrior ? '#fff' : '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(buttonX1 + buttonWidth/2 + 8, buttonY + 12);
    ctx.lineTo(buttonX1 + buttonWidth/2 + 18, buttonY + 12);
    ctx.stroke();
    ctx.fillStyle = canHireWarrior ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(buttonX1 + buttonWidth/2 + 18, buttonY + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Текст кнопки под воином
    ctx.font = '12px Arial';
    ctx.fillStyle = canHireWarrior ? '#fff' : '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Воин', buttonX1 + buttonWidth/2, buttonY + 30);
    ctx.fillText('(10 дерева, 3 пищи)', buttonX1 + buttonWidth/2, buttonY + 42);
    
    // Сохраняем координаты для кликов
    window.warriorCampHireButton = {
        x: buttonX1,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        canHire: canHireWarrior
    };
    
    // Кнопка найма метателя копья
    const buttonX2 = panelX + 160;
    
    // Проверяем возможность найма метателя копья (только в новокаменном веке)
    const canHireSpearman = people.length < maxPopulation && resources.wood >= 15 && resources.stone >= 5 && currentEra === 'bone_age';
    
    // Фон кнопки метателя копья
    ctx.fillStyle = canHireSpearman ? '#27ae60' : '#7f8c8d';
    ctx.fillRect(buttonX2, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = canHireSpearman ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX2, buttonY, buttonWidth, buttonHeight);
    
    // Рисуем метателя копья в центре кнопки
    ctx.fillStyle = canHireSpearman ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(buttonX2 + buttonWidth/2, buttonY + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Копье метателя
    ctx.strokeStyle = canHireSpearman ? '#fff' : '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(buttonX2 + buttonWidth/2 - 15, buttonY + 8);
    ctx.lineTo(buttonX2 + buttonWidth/2 + 15, buttonY + 16);
    ctx.stroke();
    
    // Наконечник копья
    ctx.fillStyle = canHireSpearman ? '#fff' : '#000';
    ctx.beginPath();
    ctx.moveTo(buttonX2 + buttonWidth/2 + 15, buttonY + 16);
    ctx.lineTo(buttonX2 + buttonWidth/2 + 12, buttonY + 13);
    ctx.lineTo(buttonX2 + buttonWidth/2 + 12, buttonY + 19);
    ctx.closePath();
    ctx.fill();
    
    // Текст кнопки под метателем копья
    ctx.font = '12px Arial';
    ctx.fillStyle = canHireSpearman ? '#fff' : '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Копейщик', buttonX2 + buttonWidth/2, buttonY + 30);
    if (currentEra === 'bone_age') {
        ctx.fillText('(15 дерева, 5 камня)', buttonX2 + buttonWidth/2, buttonY + 42);
    } else {
        ctx.fillText('(нужен новокаменный век)', buttonX2 + buttonWidth/2, buttonY + 42);
    }
    
    // Сохраняем координаты для кликов
    window.warriorCampHireSpearmanButton = {
        x: buttonX2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        canHire: canHireSpearman
    };
    
    // Кнопка закрытия (всегда показываем)
    const closeButtonSize = 30;
    const closeButtonX = panelX + panelWidth - closeButtonSize - 5;
    const closeButtonY = panelY + 5;
    
    // Красный квадрат
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    // Белая рамка
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    // Белый крестик
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeButtonX + closeButtonSize/2, closeButtonY + closeButtonSize/2);
    
    // Сохраняем координаты для обработки кликов
    window.warriorCampCloseButton = {
        x: closeButtonX,
        y: closeButtonY,
        width: closeButtonSize,
        height: closeButtonSize
    };
    
    ctx.restore();
}

function drawBonfirePanel() {
    if (!selectedBuilding || selectedBuilding.type !== 'bonfire') {
        // Очищаем кнопки если панель не активна
        window.bonfireHireTorchbearerButton = null;
        window.bonfireCloseButton = null;
        return;
    }
    
    const panelWidth = 200;
    const panelHeight = 120;
    const panelX = canvas.width / 2 - panelWidth / 2;
    const panelY = canvas.height / 2 - panelHeight / 2;
    
    // Фон панели
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.save();
    
    // Заголовок
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 Костер', panelX + panelWidth / 2, panelY + 25);
    
    // Кнопка найма факельщика
    const buttonX = panelX + 40;
    const buttonY = panelY + 40;
    const buttonWidth = 120;
    const buttonHeight = 50;
    
    // Проверяем возможность найма факельщика
    const canHire = people.length < maxPopulation && resources.wood >= 5 && resources.food >= 5;
    
    // Фон кнопки
    ctx.fillStyle = canHire ? '#e67e22' : '#7f8c8d';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = canHire ? '#fff' : '#95a5a6';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Рисуем факельщика в центре кнопки
    ctx.fillStyle = canHire ? '#fff' : '#000';
    ctx.beginPath();
    ctx.arc(buttonX + buttonWidth/2, buttonY + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Рисуем факел
    ctx.strokeStyle = canHire ? '#fff' : '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(buttonX + buttonWidth/2 + 8, buttonY + 12);
    ctx.lineTo(buttonX + buttonWidth/2 + 18, buttonY + 5);
    ctx.stroke();
    // Огонь на факеле
    ctx.fillStyle = canHire ? '#ff6b35' : '#000';
    ctx.beginPath();
    ctx.arc(buttonX + buttonWidth/2 + 18, buttonY + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Текст кнопки
    ctx.font = '12px Arial';
    ctx.fillStyle = canHire ? '#fff' : '#000';
    ctx.textAlign = 'center';
    ctx.fillText('Факельщик', buttonX + buttonWidth/2, buttonY + 30);
    ctx.fillText('(5 дерева, 5 пищи)', buttonX + buttonWidth/2, buttonY + 42);
    
    // Сохраняем координаты для кликов
    window.bonfireHireTorchbearerButton = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        canHire: canHire
    };
    
    // Кнопка закрытия (всегда показываем)
    const closeButtonSize = 30;
    const closeButtonX = panelX + panelWidth - closeButtonSize - 5;
    const closeButtonY = panelY + 5;
    
    // Красный квадрат
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    // Белая рамка
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    // Белый крестик
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeButtonX + closeButtonSize/2, closeButtonY + closeButtonSize/2);
    
    // Сохраняем координаты для обработки кликов
    window.bonfireCloseButton = {
        x: closeButtonX,
        y: closeButtonY,
        width: closeButtonSize,
        height: closeButtonSize
    };
    
    ctx.restore();
}

function drawPopulation() {
    // Адаптивная панель населения справа
    const isMobile = showMobileControls;
    const panelWidth = isMobile ? 120 : 160; // Уменьшаем ширину для мобильных
    const itemHeight = isMobile ? 28 : 35; // Уменьшаем высоту элемента для мобильных
    const panelHeight = people.length * itemHeight + 
        (isMobile ? 
            (people.length > 0 ? (selectedPeople.length > 0 ? 65 : 53) : 50) : // Дополнительное место для кнопки на мобиле
            60); // Меньший отступ для мобильных
    const panelX = canvas.width - panelWidth - 10;
    const panelY = 80;
    
    // Фон панели
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Заголовок с счетчиком населения
    ctx.save();
    ctx.font = isMobile ? 'bold 12px Arial' : 'bold 16px Arial'; // Меньший шрифт для мобильных
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`Население: ${people.length}/${maxPopulation}`, panelX + panelWidth / 2, panelY + (isMobile ? 15 : 20));
    
    // Показываем количество выделенных персонажей
    if (selectedPeople.length > 0) {
        ctx.font = isMobile ? 'bold 10px Arial' : 'bold 12px Arial'; // Меньший шрифт для мобильных
        ctx.fillStyle = '#3498db';
        ctx.fillText(`Выделено: ${selectedPeople.length}`, panelX + panelWidth / 2, panelY + (isMobile ? 28 : 35));
    }
    
    // Кнопка "Выделить всё" для мобильных устройств
    if (isMobile && people.length > 0) {
        const buttonY = panelY + (selectedPeople.length > 0 ? 40 : 28);
        const buttonHeight = 12;
        const buttonWidth = panelWidth - 20;
        const buttonX = panelX + 10;
        
        // Фон кнопки
        const allSelected = selectedPeople.length === people.length;
        ctx.fillStyle = allSelected ? '#27ae60' : '#3498db';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Рамка кнопки
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Текст кнопки
        ctx.font = 'bold 8px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(allSelected ? 'СНЯТЬ ВЫДЕЛЕНИЕ' : 'ВЫДЕЛИТЬ ВСЁ', buttonX + buttonWidth/2, buttonY + 8);
        
        // Сохраняем координаты кнопки для обработки тапов
        window.selectAllButton = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            allSelected: allSelected
        };
        
        console.log('Mobile - Отрисована кнопка "Выделить всё":', {
            coords: window.selectAllButton,
            peopleCount: people.length,
            selectedCount: selectedPeople.length,
            showMobileControls: showMobileControls
        });
    } else {
        window.selectAllButton = null;
    }
    
    // Список людей
    ctx.font = isMobile ? '10px Arial' : '12px Arial'; // Меньший шрифт для мобильных
    ctx.textAlign = 'left';
    
    people.forEach((person, idx) => {
        const listStartY = isMobile && people.length > 0 ? 
            (selectedPeople.length > 0 ? 55 : 43) : // Больше места если есть кнопка
            (isMobile ? 40 : 50);
        const itemY = panelY + listStartY + idx * itemHeight;
        
        // Фон для персонажа (подсвечиваем выделенных)
        if (selectedPeople.includes(idx)) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            ctx.fillRect(panelX + 5, itemY, panelWidth - 10, itemHeight);
        }
        
        // Маленькая иконка персонажа
        const iconRadius = isMobile ? 6 : 8; // Меньший радиус для мобильных
        ctx.beginPath();
        ctx.arc(panelX + (isMobile ? 15 : 20), itemY + itemHeight/2, iconRadius, 0, Math.PI * 2);
        
        // Разные цвета для разных типов
        if (person.type === 'warrior') {
            ctx.fillStyle = selectedPeople.includes(idx) ? '#e74c3c' : '#c0392b'; // Красный для воинов
        } else if (person.type === 'hunter') {
            ctx.fillStyle = selectedPeople.includes(idx) ? '#ff8c00' : '#ff6600'; // Оранжевый для охотников
        } else if (person.type === 'torchbearer') {
            ctx.fillStyle = selectedPeople.includes(idx) ? '#f1c40f' : '#f39c12'; // Золотисто-желтый для факельщиков
        } else if (person.type === 'spearman') {
            ctx.fillStyle = selectedPeople.includes(idx) ? '#00ff9dff' : '#00ab69ff'; // Синий для метателей копья
        } else {
            ctx.fillStyle = selectedPeople.includes(idx) ? '#3498db' : '#f5e642'; // Жёлтый для обычных людей
        }
        
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Компактная информация о персонаже
        ctx.fillStyle = '#fff';
        let personTitle;
        if (person.type === 'warrior') {
            personTitle = isMobile ? `В${idx + 1}` : `Воин ${idx + 1}`; // Короткие названия для мобильных
        } else if (person.type === 'hunter') {
            personTitle = isMobile ? `О${idx + 1}` : `Охотник ${idx + 1}`;
        } else if (person.type === 'torchbearer') {
            personTitle = isMobile ? `Ф${idx + 1}` : `Факельщик ${idx + 1}`;
        } else if (person.type === 'spearman') {
            personTitle = isMobile ? `К${idx + 1}` : `Копейщик ${idx + 1}`;
        } else {
            personTitle = isMobile ? `Ч${idx + 1}` : `Человек ${idx + 1}`;
        }
        ctx.fillText(personTitle, panelX + (isMobile ? 25 : 35), itemY + (isMobile ? 10 : 12));
        
        // Статус одной строкой (для мобильных - короче)
        let status = isMobile ? 'Ожидает' : 'Ожидает';
        if (person.butchering) {
            status = isMobile ? 'Разделка' : 'Разделывает тушу';
        } else if (person.target) {
            status = 'Идет';
        } else if (person.hasAxe) {
            status = 'Рубит';
        } else if (person.harvestingTreePos && person.harvestTimer > 0) {
            status = isMobile ? 'Еда' : 'Собирает еду';
        } else if (person.collectingStonePos && person.collectTimer > 0) {
            status = isMobile ? 'Камни' : 'Собирает камни';
        } else if (person.statusDisplayTimer > 0) {
            // Показываем статус на основе последнего действия
            if (person.lastAction === 'stone') {
                status = isMobile ? 'Камни' : 'Собирает камни';
            } else if (person.lastAction === 'food') {
                status = isMobile ? 'Еда' : 'Собирает еду';
            } else if (person.lastAction === 'Разделывает тушу') {
                status = isMobile ? 'Разделка' : 'Разделывает тушу';
            }
        }
        ctx.fillStyle = '#ccc';
        ctx.fillText(status, panelX + (isMobile ? 25 : 35), itemY + (isMobile ? 20 : 25));
        
        // Сохраняем координаты для кликов
        person.uiX = panelX + 5;
        person.uiY = itemY;
        person.uiWidth = panelWidth - 10;
        person.uiHeight = itemHeight;
    });
    
    // Отображение сообщений под панелью населения
    if (populationMessages.length > 0) {
        const messagesY = panelY + panelHeight + 10;
        populationMessages.forEach((message, idx) => {
            const messageY = messagesY + idx * (isMobile ? 20 : 25); // Меньше места для мобильных
            
            // Фон сообщения
            ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
            ctx.fillRect(panelX, messageY, panelWidth, isMobile ? 18 : 22);
            
            // Текст сообщения
            ctx.font = isMobile ? '9px Arial' : '11px Arial'; // Меньший шрифт для мобильных
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(message.text, panelX + panelWidth / 2, messageY + (isMobile ? 12 : 15));
        });
    }
    
    ctx.restore();
}

function drawPeople() {
    const currentTime = Date.now(); // Для анимации ножа
    
    people.forEach((p, idx) => {
        const screenX = p.x - camera.x;
        const screenY = p.y - camera.y;
        
        ctx.save();
        
        // Рисуем неандертальцев
        if (p.type === 'warrior') {
            // Мускулистое тело воина-неандертальца
            ctx.fillStyle = selectedPeople.includes(idx) ? '#d4a574' : '#cd853f';
            ctx.fillRect(screenX - 8, screenY - 10, 16, 22); // Более широкое тело
            
            // Мускулистые руки
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 16, screenY - 8, 8, 14); // Левая рука - толще
            ctx.fillRect(screenX + 8, screenY - 8, 8, 14);  // Правая рука - толще
            
            // Сильные ноги
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(screenX - 7, screenY + 12, 6, 16); // Левая нога
            ctx.fillRect(screenX + 1, screenY + 12, 6, 16); // Правая нога
            
            // Голова неандертальца (более крупная)
            ctx.fillStyle = '#d2b48c';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Тяжелые брови
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX - 8, screenY - 28, 16, 4);
            
            // Глаза под бровями
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 4, screenY - 24, 2, 2);
            ctx.fillRect(screenX + 2, screenY - 24, 2, 2);
            
            // Широкий нос
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 2, screenY - 22, 4, 3);
            
            // Рот
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 18, 3, 0, Math.PI);
            ctx.stroke();
            
            // Длинные волосы и борода
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 12, 0, Math.PI); // Волосы
            ctx.fill();
            ctx.fillRect(screenX - 6, screenY - 15, 12, 8); // Борода
            
            // Костяная броня вместо металла
            ctx.strokeStyle = '#f5deb3';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(screenX - 6, screenY - 6 + i * 6);
                ctx.lineTo(screenX + 6, screenY - 6 + i * 6);
                ctx.stroke();
            }
            
            // Деревянный щит с костями
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX - 22, screenY - 5, 10, 14);
            ctx.strokeStyle = '#f5deb3';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - 22, screenY - 5, 10, 14);
            
        } else if (p.type === 'hunter') {
            // Тело охотника-неандертальца
            ctx.fillStyle = selectedPeople.includes(idx) ? '#daa574' : '#cd853f';
            ctx.fillRect(screenX - 7, screenY - 10, 14, 22);
            
            // Мускулистые руки
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 14, screenY - 8, 7, 14); // Левая рука
            ctx.fillRect(screenX + 7, screenY - 8, 7, 14);  // Правая рука
            
            // Сильные ноги
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(screenX - 6, screenY + 12, 5, 16); // Левая нога
            ctx.fillRect(screenX + 1, screenY + 12, 5, 16); // Правая нога
            
            // Голова охотника-неандертальца
            ctx.fillStyle = '#d2b48c';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 9, 0, Math.PI * 2);
            ctx.fill();
            
            // Тяжелые брови
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX - 7, screenY - 27, 14, 3);
            
            // Глаза
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 3, screenY - 24, 2, 2);
            ctx.fillRect(screenX + 1, screenY - 24, 2, 2);
            
            // Широкий нос
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 2, screenY - 22, 4, 3);
            
            // Рот
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 18, 2, 0, Math.PI);
            ctx.stroke();
            
            // Длинные волосы
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 11, 0, Math.PI);
            ctx.fill();
            ctx.fillRect(screenX - 8, screenY - 16, 16, 6); // Волосы на плечах
            
            // Борода
            ctx.fillRect(screenX - 5, screenY - 16, 10, 6);
            
            // Кожаная одежда из шкур
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - 7, screenY - 10, 14, 22);
            
            // Меховые вставки
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX - 6, screenY - 2, 12, 3);
            ctx.fillRect(screenX - 6, screenY + 4, 12, 3);
            
            // Примитивный колчан из шкуры
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 8, screenY - 18, 5, 16);
            
            // Костяные стрелы
            ctx.strokeStyle = '#f5deb3';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(screenX + 9 + i, screenY - 15);
                ctx.lineTo(screenX + 9 + i, screenY - 8);
                ctx.stroke();
            }
            
        } else if (p.type === 'torchbearer') {
            // Тело шамана-неандертальца
            ctx.fillStyle = selectedPeople.includes(idx) ? '#daa520' : '#cd853f';
            ctx.fillRect(screenX - 7, screenY - 10, 14, 22);
            
            // Руки шамана
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 14, screenY - 8, 7, 14); // Левая рука
            ctx.fillRect(screenX + 7, screenY - 8, 7, 14);  // Правая рука
            
            // Ноги
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(screenX - 6, screenY + 12, 5, 16); // Левая нога
            ctx.fillRect(screenX + 1, screenY + 12, 5, 16); // Правая нога
            
            // Голова шамана
            ctx.fillStyle = '#d2b48c';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 9, 0, Math.PI * 2);
            ctx.fill();
            
            // Более выраженные брови шамана
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX - 7, screenY - 27, 14, 4);
            
            // Мудрые глаза
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 3, screenY - 24, 2, 2);
            ctx.fillRect(screenX + 1, screenY - 24, 2, 2);
            
            // Широкий нос
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 2, screenY - 22, 4, 3);
            
            // Рот
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 18, 2, 0, Math.PI);
            ctx.stroke();
            
            // Очень длинные волосы шамана
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 12, 0, Math.PI);
            ctx.fill();
            ctx.fillRect(screenX - 10, screenY - 16, 20, 8); // Длинные волосы
            
            // Длинная борода
            ctx.fillRect(screenX - 6, screenY - 16, 12, 10);
            
            // Шаманская накидка из шкур
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.moveTo(screenX - 14, screenY - 6);
            ctx.lineTo(screenX + 14, screenY - 6);
            ctx.lineTo(screenX + 12, screenY + 18);
            ctx.lineTo(screenX - 12, screenY + 18);
            ctx.closePath();
            ctx.fill();
            
            // Костяные украшения на накидке
            ctx.fillStyle = '#f5deb3';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(screenX - 8 + i * 4, screenY + 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Шаманский капюшон из меха
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 13, Math.PI * 1.1, Math.PI * 1.9);
            ctx.fill();
            
        } else if (p.type === 'spearman') {
            // Метатель копья-неандерталец
            ctx.fillStyle = selectedPeople.includes(idx) ? '#3498db' : '#2980b9';
            ctx.fillRect(screenX - 7, screenY - 10, 14, 22);
            
            // Мускулистые руки
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 14, screenY - 8, 7, 14); // Левая рука
            ctx.fillRect(screenX + 7, screenY - 8, 7, 14);  // Правая рука
            
            // Сильные ноги
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(screenX - 6, screenY + 12, 5, 16); // Левая нога
            ctx.fillRect(screenX + 1, screenY + 12, 5, 16); // Правая нога
            
            // Голова метателя
            ctx.fillStyle = '#d2b48c';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 9, 0, Math.PI * 2);
            ctx.fill();
            
            // Тяжелые брови
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX - 7, screenY - 27, 14, 3);
            
            // Глаза
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 3, screenY - 24, 2, 2);
            ctx.fillRect(screenX + 1, screenY - 24, 2, 2);
            
            // Широкий нос
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 2, screenY - 22, 4, 3);
            
            // Рот
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 18, 2, 0, Math.PI);
            ctx.stroke();
            
            // Длинные волосы охотника
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 22, 11, 0, Math.PI);
            ctx.fill();
            ctx.fillRect(screenX - 8, screenY - 16, 16, 6); // Волосы на плечах
            
            // Борода
            ctx.fillRect(screenX - 5, screenY - 16, 10, 6);
            
            // Кожаная одежда охотника с синими элементами
            ctx.strokeStyle = '#2980b9';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - 7, screenY - 10, 14, 22);
            
            // Синие полосы на одежде (отличие от охотника)
            ctx.fillStyle = '#3498db';
            ctx.fillRect(screenX - 6, screenY - 2, 12, 2);
            ctx.fillRect(screenX - 6, screenY + 4, 12, 2);
            ctx.fillRect(screenX - 6, screenY + 8, 12, 2);
            
            // Колчан с копьями на спине
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX + 8, screenY - 18, 6, 18);
            
            // Копья в колчане (более толстые чем стрелы)
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(screenX + 9 + i * 2, screenY - 16);
                ctx.lineTo(screenX + 9 + i * 2, screenY - 6);
                ctx.stroke();
                
                // Наконечники копий
                ctx.fillStyle = '#696969';
                ctx.beginPath();
                ctx.moveTo(screenX + 9 + i * 2, screenY - 16);
                ctx.lineTo(screenX + 7 + i * 2, screenY - 14);
                ctx.lineTo(screenX + 11 + i * 2, screenY - 14);
                ctx.closePath();
                ctx.fill();
            }
            
        } else {
            // Обычный неандерталец
            ctx.fillStyle = selectedPeople.includes(idx) ? '#deb887' : '#cd853f';
            ctx.fillRect(screenX - 6, screenY - 10, 12, 20);
            
            // Руки
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 12, screenY - 8, 6, 12); // Левая рука
            ctx.fillRect(screenX + 6, screenY - 8, 6, 12);  // Правая рука
            
            // Ноги
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(screenX - 6, screenY + 10, 5, 14); // Левая нога
            ctx.fillRect(screenX + 1, screenY + 10, 5, 14); // Правая нога
            
            // Голова неандертальца
            ctx.fillStyle = '#d2b48c';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 20, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Тяжелые брови
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX - 6, screenY - 25, 12, 3);
            
            // Глаза
            ctx.fillStyle = '#000';
            ctx.fillRect(screenX - 3, screenY - 22, 2, 2);
            ctx.fillRect(screenX + 1, screenY - 22, 2, 2);
            
            // Широкий нос
            ctx.fillStyle = '#cd853f';
            ctx.fillRect(screenX - 2, screenY - 20, 4, 3);
            
            // Рот
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY - 16, 2, 0, Math.PI);
            ctx.stroke();
            
            // Длинные неухоженные волосы
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(screenX, screenY - 20, 10, 0, Math.PI);
            ctx.fill();
            ctx.fillRect(screenX - 8, screenY - 14, 16, 4); // Волосы на плечах
            
            // Борода
            ctx.fillRect(screenX - 4, screenY - 16, 8, 6);
            
            // Простая шкура вместо шапки
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(screenX - 8, screenY - 8, 16, 4);
            
            // Примитивный пояс из шкуры
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(screenX - 6, screenY + 2);
            ctx.lineTo(screenX + 6, screenY + 2);
            ctx.stroke();
            
            // Костяные украшения на поясе
            ctx.fillStyle = '#f5deb3';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(screenX - 4 + i * 4, screenY + 2, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
        
        // Если у человека есть топор, нарисовать его
        if (p.hasAxe) {
            ctx.save();
            ctx.translate(screenX + 15, screenY - 10);
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 15);
            ctx.stroke();
            ctx.fillStyle = '#696969';
            ctx.fillRect(-3, -5, 6, 8);
            ctx.restore();
        }
        
        // Если это воин, нарисовать дубинку
        if (p.type === 'warrior') {
            ctx.save();
            ctx.translate(screenX + 15, screenY - 5);
            
            // Рукоять дубинки
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 20);
            ctx.stroke();
            
            // Утолщение на конце дубинки (красный если в бою)
            ctx.fillStyle = p.combatTarget ? '#e74c3c' : '#654321';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            
            // Индикатор боя
            if (p.combatTarget) {
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#e74c3c';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.fillText('⚔️', screenX, screenY - 35);
                ctx.restore();
            }
        }
        
        // Если это метатель копья, нарисовать копье в руке
        if (p.type === 'spearman') {
            // Проверяем анимацию броска
            let throwOffset = 0;
            let showSpear = true;
            const currentTime = Date.now();
            
            if (p.throwAnimation) {
                const animProgress = (currentTime - p.throwAnimation.startTime) / p.throwAnimation.duration;
                if (animProgress < 1) {
                    // Анимация броска - рука отводится назад, затем вперед
                    if (animProgress < 0.5) {
                        // Замах назад
                        throwOffset = -animProgress * 40;
                    } else {
                        // Бросок вперед
                        throwOffset = -(1 - animProgress) * 80;
                        if (animProgress > 0.7) {
                            showSpear = false; // Копье уже брошено
                        }
                    }
                } else {
                    // Анимация завершена
                    p.throwAnimation = null;
                }
            }
            
            if (showSpear) {
                ctx.save();
                ctx.translate(screenX + 18 + throwOffset, screenY - 8);
                
                // Древко копья
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 30);
                ctx.stroke();
                
                // Наконечник копья (красный если в бою)
                ctx.fillStyle = p.combatTarget ? '#e74c3c' : '#696969';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-4, -8);
                ctx.lineTo(4, -8);
                ctx.closePath();
                ctx.fill();
                
                // Обмотка на древке
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 5 + i * 8, 3, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                ctx.restore();
            }
            
            // Индикатор дальнего боя
            if (p.combatTarget) {
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#3498db';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.fillText('🏹', screenX, screenY - 35);
                ctx.restore();
            }
        }
        
        // Если это охотник, нарисовать лук (но не во время разделки)
        if (p.type === 'hunter' && !p.butchering) {
            ctx.save();
            ctx.translate(screenX + 15, screenY - 5);
            
            // Тетива лука
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 10, 12, Math.PI * 0.2, Math.PI * 1.8);
            ctx.stroke();
            
            // Рукоять лука
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-2, 5);
            ctx.lineTo(-2, 15);
            ctx.stroke();
            
            // Если охотник в бою, показать стрелу
            if (p.combatTarget) {
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-8, 10);
                ctx.lineTo(8, 10);
                ctx.stroke();
                
                // Наконечник стрелы
                ctx.fillStyle = '#696969';
                ctx.beginPath();
                ctx.moveTo(8, 10);
                ctx.lineTo(6, 8);
                ctx.lineTo(6, 12);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
            
            // Индикатор охоты/боя
            if (p.combatTarget && !p.butchering) {
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#e67e22';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.fillText('🏹', screenX, screenY - 35);
                ctx.restore();
            }
        }
        
        // Если это факельщик, нарисовать факел
        if (p.type === 'torchbearer') {
            ctx.save();
            ctx.translate(screenX + 15, screenY - 5);
            
            // Рукоять факела
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 20);
            ctx.stroke();
            
            // Огонь факела (анимированный)
            const fireTime = (currentTime % 1000) / 1000; // Цикл анимации 1 секунда
            const fireFlicker = Math.sin(fireTime * Math.PI * 4) * 0.3 + 1; // Мерцание огня
            
            // Основной огонь
            ctx.fillStyle = `rgba(255, 107, 53, ${0.8 * fireFlicker})`;
            ctx.beginPath();
            ctx.arc(0, -5, 6 * fireFlicker, 0, Math.PI * 2);
            ctx.fill();
            
            // Желтое ядро огня
            ctx.fillStyle = `rgba(255, 215, 0, ${0.9 * fireFlicker})`;
            ctx.beginPath();
            ctx.arc(0, -5, 3 * fireFlicker, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            
            // Индикатор отпугивания (если рядом есть мамонты или тигры)
            const nearbyThreats = [...mammoths, ...sabertoothTigers].some(threat => {
                const distance = Math.sqrt((threat.x - p.x) ** 2 + (threat.y - p.y) ** 2);
                return distance < p.scaringRange;
            });
            
            if (nearbyThreats) {
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#f39c12';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 4;
                ctx.fillText('🔥', screenX, screenY - 35);
                ctx.restore();
            }
        }
        
        // Если охотник разделывает тушу, показать нож
        if (p.type === 'hunter' && p.butchering && p.butcherStartTime) {
            ctx.save();
            ctx.translate(screenX + 15, screenY - 5);
            
            // Анимация движения ножа
            const animTime = (currentTime - p.butcherStartTime) % 500; // Цикл 0.5 сек
            const offset = Math.sin(animTime / 500 * Math.PI * 2) * 3;
            ctx.translate(offset, 0);
            
            // Рукоять ножа
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 15);
            ctx.lineTo(0, 20);
            ctx.stroke();
            
            // Лезвие ножа
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(-1, 5, 2, 10);
            
            ctx.restore();
            
            // Индикатор разделки
            ctx.save();
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#8B4513';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.fillText('🔪', screenX, screenY - 35);
            ctx.restore();
        }

        // Полоска здоровья
        if (p.health < p.maxHealth) {
            const barWidth = 30;
            const barHeight = 4;
            const barX = screenX - barWidth / 2;
            const barY = screenY - 30;
            
            // Фон полоски здоровья
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Полоска здоровья
            const healthPercent = p.health / p.maxHealth;
            const healthWidth = barWidth * healthPercent;
            
            if (healthPercent > 0.6) {
                ctx.fillStyle = '#2ecc71'; // Зеленый
            } else if (healthPercent > 0.3) {
                ctx.fillStyle = '#f39c12'; // Оранжевый
            } else {
                ctx.fillStyle = '#e74c3c'; // Красный
            }
            
            ctx.fillRect(barX, barY, healthWidth, barHeight);
        }
        
        // Без номеров
    });
}

function drawHut(x, y) {
    // Шалаш из веток (треугольник + линии) с учетом камеры
    ctx.save();
    ctx.translate(x - camera.x, y - camera.y);
    // Треугольник
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(-40, 40);
    ctx.lineTo(40, 40);
    ctx.closePath();
    ctx.fillStyle = '#8d6742';
    ctx.fill();
    ctx.strokeStyle = '#5a3c1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Ветки
    for (let i = -30; i <= 30; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 40);
        ctx.lineTo(0, -40);
        ctx.strokeStyle = '#5a3c1a';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
}

function drawBuilding(building) {
    const screenX = building.x - camera.x;
    const screenY = building.y - camera.y;
    
    ctx.save();
    ctx.translate(screenX, screenY);
    
    if (building.type === 'house') {
        // Жилище - такой же шалаш как стартовый
        // Треугольник
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(-40, 40);
        ctx.lineTo(40, 40);
        ctx.closePath();
        ctx.fillStyle = '#8d6742';
        ctx.fill();
        ctx.strokeStyle = '#5a3c1a';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Ветки
        for (let i = -30; i <= 30; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, 40);
            ctx.lineTo(0, -40);
            ctx.strokeStyle = '#5a3c1a';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    } else if (building.type === 'reproduction_house') {
        // Хижина рода - улучшенная хижина
        // Треугольник (как обычная хижина, но больше)
        ctx.beginPath();
        ctx.moveTo(0, -50);
        ctx.lineTo(-50, 50);
        ctx.lineTo(50, 50);
        ctx.closePath();
        ctx.fillStyle = '#a0723d'; // Чуть светлее обычной хижины
        ctx.fill();
        ctx.strokeStyle = '#5a3c1a';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Больше веток для лучшего вида
        for (let i = -40; i <= 40; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, 50);
            ctx.lineTo(0, -50);
            ctx.strokeStyle = '#5a3c1a';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Дополнительные элементы для "улучшенности"
        // Небольшое окно
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-8, 10, 16, 12);
        ctx.strokeStyle = '#d68910';
        ctx.lineWidth = 1;
        ctx.strokeRect(-8, 10, 16, 12);
        
        // Дымоход (стоит на наклонной крыше)
        // Рассчитываем положение на скате крыши
        const chimneyX = 20; // Позиция по X
        const roofY = -50 + (chimneyX / 50) * 100; // Y позиция на линии крыши
        
        ctx.fillStyle = '#7f8c8d';
        // Основание дымохода (трапециевидное, следует наклону крыши)
        ctx.beginPath();
        ctx.moveTo(chimneyX - 4, roofY);
        ctx.lineTo(chimneyX + 4, roofY);
        ctx.lineTo(chimneyX + 4, roofY - 25);
        ctx.lineTo(chimneyX - 4, roofY - 25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5a5a5a';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Дым
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.beginPath();
        ctx.arc(chimneyX, roofY - 30, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(chimneyX + 3, roofY - 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(chimneyX - 2, roofY - 40, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (building.type === 'warrior_camp') {
        // Лагерь воинов - военная постройка
        // Основная постройка - прямоугольная казарма
        ctx.fillStyle = '#654321';
        ctx.fillRect(-40, 20, 80, 40);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 3;
        ctx.strokeRect(-40, 20, 80, 40);
        
        // Крыша казармы
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.moveTo(-45, 20);
        ctx.lineTo(0, -10);
        ctx.lineTo(45, 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Дверь
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(-8, 35, 16, 25);
        ctx.strokeStyle = '#2e1a0f';
        ctx.lineWidth = 1;
        ctx.strokeRect(-8, 35, 16, 25);
        
        // Окна
        ctx.fillStyle = '#795548';
        ctx.fillRect(-30, 30, 12, 8);
        ctx.fillRect(18, 30, 12, 8);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1;
        ctx.strokeRect(-30, 30, 12, 8);
        ctx.strokeRect(18, 30, 12, 8);
        
        // Флагшток
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 60);
        ctx.lineTo(50, -30);
        ctx.stroke();
        
        // Флаг
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(50, -30);
        ctx.lineTo(70, -20);
        ctx.lineTo(50, -10);
        ctx.closePath();
        ctx.fill();
        
        // Тренировочные мишени
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        // Левая мишень
        ctx.beginPath();
        ctx.arc(-55, 45, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-55, 45, 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Правая мишень
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(65, 45, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(65, 45, 4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Стойка с оружием
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-20, 60);
        ctx.lineTo(-20, 10);
        ctx.stroke();
        
        // Дубинки на стойке
        for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.3;
            ctx.save();
            ctx.translate(-20, 20 + i * 8);
            ctx.rotate(angle);
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 0);
            ctx.stroke();
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(15, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    } else if (building.type === 'bonfire') {
        // Костер - используем изображение Campfire.png
        if (campfireImageLoaded) {
            // Рисуем изображение костра размером в 3 раза больше (180x180 вместо 60x60)
            ctx.drawImage(campfireImage, -90, -90, 180, 180);
        } else {
            // Fallback - рисуем простой костер если изображение не загружено
            // Основание костра - камни
            ctx.fillStyle = '#696969';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const stoneX = Math.cos(angle) * 25;
                const stoneY = Math.sin(angle) * 25;
                ctx.beginPath();
                ctx.arc(stoneX, stoneY, 6, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Дрова
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 4;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.save();
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(20, 0);
                ctx.stroke();
                ctx.restore();
            }
            
            // Огонь
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.moveTo(0, -10);
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 15 + Math.random() * 5;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius - 10;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Желтые языки пламени
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(0, -15);
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 8 + Math.random() * 3;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius - 15;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
    } else if (building.type === 'farm') {
        // Ферма - сельскохозяйственное здание
        
        // Основное здание фермы - амбар
        ctx.fillStyle = '#d2691e';
        ctx.fillRect(-50, 20, 100, 50);
        ctx.strokeStyle = '#a0522d';
        ctx.lineWidth = 3;
        ctx.strokeRect(-50, 20, 100, 50);
        
        // Крыша амбара
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.moveTo(-55, 20);
        ctx.lineTo(0, -20);
        ctx.lineTo(55, 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Большие двери амбара
        ctx.fillStyle = '#654321';
        ctx.fillRect(-20, 35, 40, 35);
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.strokeRect(-20, 35, 40, 35);
        
        // Ручки дверей
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(-10, 50, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, 50, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Поля вокруг фермы
        // Левое поле
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-90, 45, 35, 30);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        // Борозды на поле
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-90, 45 + i * 6);
            ctx.lineTo(-55, 45 + i * 6);
            ctx.stroke();
        }
        
        // Правое поле
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(55, 45, 35, 30);
        // Борозды на поле
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(55, 45 + i * 6);
            ctx.lineTo(90, 45 + i * 6);
            ctx.stroke();
        }
        
        // Растения на полях
        ctx.fillStyle = '#27ae60';
        // Левое поле - растения
        for (let x = -85; x < -60; x += 8) {
            for (let y = 50; y < 70; y += 8) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Правое поле - растения  
        for (let x = 60; x < 85; x += 8) {
            for (let y = 50; y < 70; y += 8) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Забор вокруг фермы
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        // Горизонтальные линии забора
        ctx.beginPath();
        ctx.moveTo(-100, 80);
        ctx.lineTo(100, 80);
        ctx.stroke();
        
        // Вертикальные столбики забора
        for (let x = -90; x <= 90; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 75);
            ctx.lineTo(x, 85);
            ctx.stroke();
        }
        
        // Показываем количество работников и производство
        if (building.workers && building.workers.length > 0) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#27ae60';
            ctx.textAlign = 'center';
            ctx.fillText(`👨‍🌾 ${building.workers.length}`, 0, -30);
            
            // Показываем производство еды
            const productionRate = building.workers.length * 5; // 5 еды за работника в минуту
            ctx.font = '12px Arial';
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`+${productionRate}/мин`, 0, -15);
        }
    }
    
    ctx.restore();
}

function drawBuildings() {
    // Рисуем здания
    buildings.forEach(building => {
        const screenX = building.x - camera.x;
        const screenY = building.y - camera.y;
        // Рисуем только здания в области видимости
        if (screenX > -100 && screenX < canvas.width + 100 && 
            screenY > -100 && screenY < canvas.height + 100) {
            drawBuilding(building);
        }
    });
}


function updateCamera() {
    let targetX, targetY;
    
    // Если есть выделенные персонажи, следуем за первым из них
    if (selectedPeople.length > 0 && people[selectedPeople[0]]) {
        targetX = people[selectedPeople[0]].x;
        targetY = people[selectedPeople[0]].y;
    } else {
        // Ищем персонажа, который движется (имеет цель)
        let movingPerson = people.find(p => p.target !== null);
        if (movingPerson) {
            targetX = movingPerson.x;
            targetY = movingPerson.y;
        } else {
            // Если никто не движется, следуем за центром группы
            let avgX = 0, avgY = 0;
            people.forEach(p => {
                avgX += p.x;
                avgY += p.y;
            });
            targetX = avgX / people.length;
            targetY = avgY / people.length;
        }
    }
    
    // Камера мгновенно центрируется на целевом персонаже
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    camera.x = targetX - centerX;
    camera.y = targetY - centerY;
}

function draw() {
    drawSurface();
}

function drawSurface() {
    drawGrass();
    
    // Генерируем кусты каждый кадр для максимально быстрого открытия мира
    generateBushes();
    
    // Рисуем кусты в расширенной области видимости
    bushes.forEach(bush => {
        if (bush.durability > 0) {
            const screenX = bush.x - camera.x;
            const screenY = bush.y - camera.y;
            // Увеличиваем область отображения с большим запасом
            if (screenX > -500 && screenX < canvas.width + 500 && 
                screenY > -500 && screenY < canvas.height + 500) {
                drawBush(bush.x, bush.y, bush.durability);
            }
        }
    });
    
    // Рисуем яблони
    appleTrees.forEach(tree => {
        const screenX = tree.x - camera.x;
        const screenY = tree.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawAppleTree(tree);
        }
    });
    
    // Рисуем камни
    stones.forEach(stone => {
        const screenX = stone.x - camera.x;
        const screenY = stone.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawStone(stone);
        }
    });
    
    // Рисуем пещеры
    caves.forEach(cave => {
        const screenX = cave.x - camera.x;
        const screenY = cave.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawCave(cave);
        }
    });
    
    // Рисуем неандертальцев
    neanderthals.forEach(neanderthal => {
        const screenX = neanderthal.x - camera.x;
        const screenY = neanderthal.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawNeanderthal(neanderthal);
        }
    });
    
    // Рисуем неандертальцев
    neanderthals.forEach(neanderthal => {
        const screenX = neanderthal.x - camera.x;
        const screenY = neanderthal.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawNeanderthal(neanderthal);
        }
    });
    
    // Рисуем саблезубых тигров
    sabertoothTigers.forEach(tiger => {
        const screenX = tiger.x - camera.x;
        const screenY = tiger.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawSabertoothTiger(tiger);
        }
    });
    
    // Рисуем оленей (только в области видимости)
    deer.forEach(deerAnimal => {
        const screenX = deerAnimal.x - camera.x;
        const screenY = deerAnimal.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawDeer(deerAnimal);
        }
    });
    
    // Рисуем мамонтов (только в области видимости)
    mammoths.forEach(mammoth => {
        const screenX = mammoth.x - camera.x;
        const screenY = mammoth.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawMammoth(mammoth);
        }
    });

    // Рисуем степных мамонтов (только в области видимости)
    steppeMammoths.forEach(mammoth => {
        const screenX = mammoth.x - camera.x;
        const screenY = mammoth.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawSteppeMammoth(mammoth);
        }
    });

    // Рисуем туши оленей (только в области видимости)
    deerCarcasses.forEach(carcass => {
        const screenX = carcass.x - camera.x;
        const screenY = carcass.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawDeerCarcass(carcass);
        }
    });
    
    // Рисуем туши мамонтов (только в области видимости)
    mammothCarcasses.forEach(carcass => {
        const screenX = carcass.x - camera.x;
        const screenY = carcass.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawMammothCarcass(carcass);
        }
    });
    
    // Рисуем туши степных мамонтов (только в области видимости)
    steppeMammothCarcasses.forEach(carcass => {
        const screenX = carcass.x - camera.x;
        const screenY = carcass.y - camera.y;
        if (screenX > -500 && screenX < canvas.width + 500 && 
            screenY > -500 && screenY < canvas.height + 500) {
            drawSteppeMammothCarcass(carcass);
        }
    });
    
    drawBuildings(); // Рисуем построенные здания (включая стартовую хижину рода)
    drawPeople();
    drawFlyingSpears(); // Рисуем летящие копья
    drawResources(); // Рисуем ресурсы поверх всего
    drawPopulation(); // Рисуем панель населения
    drawBuildingPanel(); // Рисуем панель строительства
    drawBuildingMessage(); // Рисуем центрированное сообщение о строительстве
    drawBuildingModal(); // Рисуем модальное окно для мобильных
    drawReproductionHousePanel(); // Рисуем панель хижины рода
    drawWarriorCampPanel(); // Рисуем панель лагеря воинов
    drawBonfirePanel(); // Рисуем панель костра
    drawEraNotifications(); // Уведомления об эпохах
    
    // Мобильные элементы управления поверх всего
    drawMobileControls();

    // Показать прочность куста во время рубки
    bushes.forEach(bush => {
        const anyoneChopping = people.some(p => p.hasAxe && p.currentBush === bush);
        if (anyoneChopping && bush.durability > 0) {
            ctx.save();
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 8;
            const screenX = bush.x - camera.x;
            const screenY = bush.y - camera.y;
            ctx.fillText(`${bush.durability} дерева`, screenX, screenY - bush.r - 60);
            ctx.restore();
        }
    });
}

function drawCaveWorld() {
    drawCaveBackground();
    
    // Рисуем только персонажей и неандертальцев в пещере
    drawPeople();
    
    // Рисуем неандертальцев (только тех, кто в пещере)
    neanderthals.forEach(neanderthal => {
        if (neanderthal.inCave) {
            const screenX = neanderthal.x - camera.x;
            const screenY = neanderthal.y - camera.y;
            if (screenX > -500 && screenX < canvas.width + 500 && 
                screenY > -500 && screenY < canvas.height + 500) {
                drawNeanderthal(neanderthal);
            }
        }
    });
    
    // Рисуем выход из пещеры
    ctx.save();
    ctx.fillStyle = '#ffff99';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    
    // Световой круг выхода
    ctx.fillStyle = 'rgba(255, 255, 153, 0.5)';
    ctx.beginPath();
    ctx.arc(400 - camera.x, 100 - camera.y, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Текст выхода
    ctx.fillStyle = '#fff';
    ctx.fillText('🌅 ВЫХОД', 400 - camera.x, 100 - camera.y);
    ctx.fillText('(подойди сюда)', 400 - camera.x, 120 - camera.y);
    
    ctx.restore();
    
    // Рисуем ресурсы и UI поверх всего
    drawResources();
    drawPopulation();
    drawBuildingPanel();
    drawBuildingMessage(); // Рисуем центрированное сообщение о строительстве
    drawBuildingModal(); // Рисуем модальное окно для мобильных
    drawReproductionHousePanel();
    drawWarriorCampPanel();
    drawBonfirePanel();
    drawEraNotifications(); // Уведомления об эпохах
    
    // Мобильные элементы управления поверх всего
    drawMobileControls();
}

// Система эпох
function checkEraUnlocks() {
    // Автоматическое открытие эпох отключено - теперь открывается через технологии
    // Новокаменный век открывается через технологию "Неолитическая революция" за 200 пищи в жилище рода
}

function showEraNotification(eraKey) {
    const era = eras[eraKey];
    // Создаем улучшенное уведомление
    const notification = {
        message: `🎉 РАЗБЛОКИРОВАНА НОВАЯ ЭПОХА: ${era.name.toUpperCase()}!`,
        description: era.description,
        timer: 600, // 10 секунд при 60 FPS
        type: 'era',
        eraKey: eraKey
    };
    
    // Добавляем в существующую систему сообщений
    populationMessages.push(notification);
    
    console.log(`🎉 Поздравляем! Разблокирована эпоха: ${era.name}`);
}

function canBuildInCurrentEra(buildingType) {
    return eras[currentEra].buildings.includes(buildingType);
}

function drawEraInfo() {
    // Информация об эпохе в правом верхнем углу (увеличенная панель для изображения)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(canvas.width - 300, 10, 290, 120);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 300, 10, 290, 120);
    
    // Отображение эпохи - только текст
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Эпоха: ${eras[currentEra].name}`, canvas.width - 290, 35);
    
    // Описание эпохи
    ctx.font = '11px Arial';
    ctx.fillStyle = '#bdc3c7';
    ctx.fillText(eras[currentEra].description, canvas.width - 290, 55);
    
    // Прогресс к следующей эпохе
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    if (currentEra === 'stone_age') {
        const progress = Math.min(100, (totalFoodCollected / 200) * 100);
        ctx.fillText(`Прогресс к Новокаменному веку:`, canvas.width - 290, 85);
        
        // Прогресс-бар
        const barWidth = 200;
        const barHeight = 8;
        const barX = canvas.width - 290;
        const barY = 95;
        
        // Фон прогресс-бара
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Заполнение прогресс-бара
        ctx.fillStyle = progress >= 100 ? '#27ae60' : '#f39c12';
        ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);
        
        // Текст прогресса
        ctx.font = '11px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${totalFoodCollected}/200 пищи (${Math.floor(progress)}%)`, canvas.width - 290, 115);
    } else {
        ctx.fillText(`Все эпохи разблокированы!`, canvas.width - 290, 85);
        
        // Показываем достижение
        ctx.font = '11px Arial';
        ctx.fillStyle = '#27ae60';
        ctx.fillText(`🏆 Вы достигли высшей эпохи!`, canvas.width - 290, 105);
    }
    
    ctx.restore();
}

function drawEraNotifications() {
    // Рисуем центральные уведомления об эпохах
    const eraNotifications = populationMessages.filter(msg => msg.type === 'era');
    
    eraNotifications.forEach((notification, index) => {
        ctx.save();
        
        // Центрируем уведомление
        const centerX = canvas.width / 2;
        const centerY = (canvas.height / 2) - 100 + (index * 140);
        
        // Анимация появления
        const fadeProgress = Math.min(1, (600 - notification.timer) / 60); // Первую секунду фейдим
        const alpha = notification.timer < 60 ? notification.timer / 60 : fadeProgress; // Последнюю секунду тоже фейдим
        
        // Фон уведомления
        ctx.fillStyle = `rgba(0, 0, 0, ${0.9 * alpha})`;
        ctx.fillRect(centerX - 200, centerY - 60, 400, 120);
        
        // Рамка
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`; // Золотая рамка
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - 200, centerY - 60, 400, 120);
        
        // Иконка эпохи (текстовая)
        if (notification.eraKey) {
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.textAlign = 'center';
            const eraIcon = notification.eraKey === 'stone_age' ? '🗿' : '🦴';
            ctx.fillText(eraIcon, centerX - 160, centerY - 20);
        }
        
        // Заголовок
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(notification.message, centerX, centerY - 20);
        
        // Описание
        if (notification.description) {
            ctx.font = '14px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(notification.description, centerX, centerY + 10);
        }
        
        // Дополнительная информация
        ctx.font = '12px Arial';
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.fillText('Новые возможности разблокированы!', centerX, centerY + 35);
        
        ctx.restore();
    });
}

// Анимация движения человечков
function updatePeople() {
    people.forEach((p, idx) => {
        // Воины - боевая логика против тигров
        if (p.type === 'warrior') {
            // Инициализируем боевые свойства если их нет
            if (!p.combatTarget) p.combatTarget = null;
            if (!p.attackCooldown) p.attackCooldown = 0;
            if (!p.detectionRange) p.detectionRange = 220; // Больше радиус чем у тигров
            if (!p.attackRange) p.attackRange = 45; // Больше радиус атаки
            if (!p.damage) p.damage = 35; // Больше урона
            if (!p.lastAttack) p.lastAttack = 0;
            
            const currentTime = Date.now();
            
            // Поиск ближайшего врага для атаки (тигры, мамонты и неандертальцы)
            if (!p.combatTarget || p.combatTarget.health <= 0) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                // Проверяем тигров
                sabertoothTigers.forEach(tiger => {
                    const distance = Math.sqrt((p.x - tiger.x) ** 2 + (p.y - tiger.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = tiger;
                        closestDistance = distance;
                    }
                });
                
                // Проверяем мамонтов
                mammoths.forEach(mammoth => {
                    const distance = Math.sqrt((p.x - mammoth.x) ** 2 + (p.y - mammoth.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = mammoth;
                        closestDistance = distance;
                    }
                });
                
                // Проверяем степных мамонтов
                steppeMammoths.forEach(mammoth => {
                    const distance = Math.sqrt((p.x - mammoth.x) ** 2 + (p.y - mammoth.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = mammoth;
                        closestDistance = distance;
                    }
                });
                
                // Проверяем неандертальцев
                neanderthals.forEach(neanderthal => {
                    const distance = Math.sqrt((p.x - neanderthal.x) ** 2 + (p.y - neanderthal.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = neanderthal;
                        closestDistance = distance;
                    }
                });
                
                p.combatTarget = closestEnemy;
            }
            
            // Если есть боевая цель
            if (p.combatTarget) {
                const dx = p.combatTarget.x - p.x;
                const dy = p.combatTarget.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > p.attackRange) {
                    // Движение к тигру
                    const moveX = (dx / distance) * 2; // Воины движутся быстро к бою
                    const moveY = (dy / distance) * 2;
                    
                    p.x += moveX;
                    p.y += moveY;
                } else {
                    // Атака тигра
                    if (currentTime - p.lastAttack > 1000) { // Атака каждую секунду
                        p.lastAttack = currentTime;
                        
                        if (p.combatTarget.health) {
                            p.combatTarget.health -= p.damage;
                            
                            // Эффект атаки - воин двигается к тигру
                            const attackDx = (dx / distance) * 5;
                            const attackDy = (dy / distance) * 5;
                            p.x += attackDx;
                            p.y += attackDy;
                            
                            // Если враг убит
                            if (p.combatTarget.health <= 0) {
                                // Проверяем тип врага и удаляем из соответствующего массива
                                const tigerIndex = sabertoothTigers.indexOf(p.combatTarget);
                                const mammothIndex = mammoths.indexOf(p.combatTarget);
                                const steppeMammothIndex = steppeMammoths.indexOf(p.combatTarget);
                                const neanderthalIndex = neanderthals.indexOf(p.combatTarget);
                                
                                if (tigerIndex > -1) {
                                    sabertoothTigers.splice(tigerIndex, 1);
                                } else if (mammothIndex > -1) {
                                    // Создаем тушу мамонта
                                    mammothCarcasses.push({
                                        x: p.combatTarget.x,
                                        y: p.combatTarget.y,
                                        food: 75 // 75 единиц мяса
                                    });
                                    mammoths.splice(mammothIndex, 1);
                                } else if (steppeMammothIndex > -1) {
                                    // Создаем тушу степного мамонта (огромное количество еды)
                                    steppeMammothCarcasses.push({
                                        x: p.combatTarget.x,
                                        y: p.combatTarget.y,
                                        food: 200 // 200 единиц мяса
                                    });
                                    steppeMammoths.splice(steppeMammothIndex, 1);
                                } else if (neanderthalIndex > -1) {
                                    neanderthals.splice(neanderthalIndex, 1);
                                }
                                
                                p.combatTarget = null;
                            }
                        }
                    }
                }
            } else if (p.target) {
                // Если нет боевых целей, выполнить обычное движение к цели
                const dx = p.target.x - p.x;
                const dy = p.target.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 2) {
                    p.x += dx / dist * 1.5;
                    p.y += dy / dist * 1.5;
                } else {
                    p.x = p.target.x;
                    p.y = p.target.y;
                    p.target = null;
                }
            }
            return; // Пропускаем остальную логику для воинов
        }
        
        // Метатели копья - дальняя боевая логика
        if (p.type === 'spearman') {
            // Инициализируем боевые свойства если их нет
            if (!p.combatTarget) p.combatTarget = null;
            if (!p.attackCooldown) p.attackCooldown = 0;
            if (!p.detectionRange) p.detectionRange = 300; // Очень большой радиус обнаружения
            if (!p.attackRange) p.attackRange = 120; // Дальняя атака копьем
            if (!p.damage) p.damage = 25; // Хороший урон
            if (!p.lastAttack) p.lastAttack = 0;
            if (!p.throwCooldown) p.throwCooldown = 0;
            
            const currentTime = Date.now();
            
            // Поиск ближайшего врага для атаки
            if (!p.combatTarget || p.combatTarget.health <= 0) {
                let closestEnemy = null;
                let closestDistance = Infinity;
                
                // Проверяем тигров
                sabertoothTigers.forEach(tiger => {
                    const distance = Math.sqrt((p.x - tiger.x) ** 2 + (p.y - tiger.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = tiger;
                        closestDistance = distance;
                    }
                });
                
                // Проверяем мамонтов
                mammoths.forEach(mammoth => {
                    const distance = Math.sqrt((p.x - mammoth.x) ** 2 + (p.y - mammoth.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = mammoth;
                        closestDistance = distance;
                    }
                });
                
                // Проверяем неандертальцев
                neanderthals.forEach(neanderthal => {
                    const distance = Math.sqrt((p.x - neanderthal.x) ** 2 + (p.y - neanderthal.y) ** 2);
                    if (distance < p.detectionRange && distance < closestDistance) {
                        closestEnemy = neanderthal;
                        closestDistance = distance;
                    }
                });
                
                if (closestEnemy) {
                    p.combatTarget = closestEnemy;
                }
            }
            
            // Если есть цель для атаки
            if (p.combatTarget && p.combatTarget.health > 0) {
                const dx = p.combatTarget.x - p.x;
                const dy = p.combatTarget.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Если цель в радиусе атаки - метаем копье
                if (distance <= p.attackRange) {
                    if (currentTime - p.lastAttack > 1500) { // Атака каждые 1.5 секунды
                        p.lastAttack = currentTime;
                        
                        // Создаем летящее копье
                        flyingSpears.push({
                            startX: p.x,
                            startY: p.y,
                            targetX: p.combatTarget.x,
                            targetY: p.combatTarget.y,
                            currentX: p.x,
                            currentY: p.y,
                            target: p.combatTarget,
                            damage: p.damage,
                            thrower: p,
                            startTime: currentTime,
                            speed: 8 // Скорость полета копья
                        });
                        
                        // Анимация броска - копейщик отклоняется назад
                        p.throwAnimation = {
                            startTime: currentTime,
                            duration: 300 // 300мс анимация броска
                        };
                    }
                } else {
                    // Двигаемся к цели, но держим дистанцию (не слишком близко)
                    if (distance > p.attackRange * 0.8) {
                        p.x += (dx / distance) * 1.0; // Медленнее чем воины
                        p.y += (dy / distance) * 1.0;
                    }
                }
            } else if (p.target) {
                // Если нет боевых целей, выполнить обычное движение к цели
                const dx = p.target.x - p.x;
                const dy = p.target.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 2) {
                    p.x += dx / dist * 1.2;
                    p.y += dy / dist * 1.2;
                } else {
                    p.x = p.target.x;
                    p.y = p.target.y;
                    p.target = null;
                }
            }
            return; // Пропускаем остальную логику для метателей копья
        }
        
        // Охотники - специальная боевая логика
        if (p.type === 'hunter') {
            // Инициализируем боевые свойства если их нет
            if (!p.combatTarget) p.combatTarget = null;
            if (!p.attackCooldown) p.attackCooldown = 0;
            if (!p.detectionRange) p.detectionRange = 200;
            if (!p.attackRange) p.attackRange = 60; // Дальняя атака
            if (!p.damage) p.damage = 25; // Хороший урон против тигров
            if (!p.lastAttack) p.lastAttack = 0;
            if (!p.speed) p.speed = 3.0;
            if (!p.huntTarget) p.huntTarget = null;
            
            const currentTime = Date.now();
            
            // Приоритет 1: Разделка туши (если назначена цель)
            if (p.butcherTarget) {
                // Проверяем, что туша ещё существует (олень, мамонт или степной мамонт)
                const isDeerCarcass = deerCarcasses.includes(p.butcherTarget);
                const isMammothCarcass = mammothCarcasses.includes(p.butcherTarget);
                const isSteppeMammothCarcass = steppeMammothCarcasses.includes(p.butcherTarget);
                
                if (!isDeerCarcass && !isMammothCarcass && !isSteppeMammothCarcass) {
                    p.butcherTarget = null;
                    p.butchering = false;
                    p.butcherStartTime = null;
                    p.target = null;
                    return;
                }
                
                const dx = p.butcherTarget.x - p.x;
                const dy = p.butcherTarget.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= 30) {
                    // Близко к туше - начинаем разделку
                    if (!p.butchering) {
                        p.butchering = true;
                        p.butcherStartTime = currentTime;
                        console.log("Начинаем разделку туши, butchering = true");
                    }
                    
                    // Время разделки зависит от типа туши: 3 секунды для оленя, 15 секунд для мамонта, 25 секунд для степного мамонта
                    const isDeerCarcass = deerCarcasses.includes(p.butcherTarget);
                    const isSteppeMammothCarcass = steppeMammothCarcasses.includes(p.butcherTarget);
                    let butcherTime;
                    if (isDeerCarcass) {
                        butcherTime = 3000; // 3 секунды для оленя
                    } else if (isSteppeMammothCarcass) {
                        butcherTime = 25000; // 25 секунд для степного мамонта
                    } else {
                        butcherTime = 15000; // 15 секунд для обычного мамонта
                    }
                    const timeElapsed = currentTime - p.butcherStartTime;
                    const progress = Math.min(100, (timeElapsed / butcherTime) * 100);
                    
                    // Постоянно обновляем статус во время разделки
                    p.lastAction = `Разделывает тушу (${Math.floor(progress)}%)`;
                    p.statusDisplayTimer = 180; // 3 секунды при 60 FPS
                    console.log(`Охотник разделывает, прогресс: ${Math.floor(progress)}%`);
                    
                    // Остановка на месте во время разделки - НЕ ДВИГАЕМСЯ!
                    
                    if (timeElapsed >= butcherTime) {
                        // Добавляем ВСЮ еду из туши за один подход
                        const harvestedFood = p.butcherTarget.food; // Собираем всю еду
                        resources.food += harvestedFood;
                        totalFoodCollected += harvestedFood; // Обновляем общий счетчик пищи
                        p.butcherTarget.food = 0; // Туша полностью разделана
                        console.log(`Собрано еды: ${harvestedFood}, туша полностью разделана`);
                        
                        // Проверяем разблокировку новых эпох
                        checkEraUnlocks();
                        
                        // Удаляем тушу из соответствующего массива
                        if (isDeerCarcass) {
                            const carcassIndex = deerCarcasses.indexOf(p.butcherTarget);
                            if (carcassIndex > -1) {
                                deerCarcasses.splice(carcassIndex, 1);
                            }
                        } else if (isSteppeMammothCarcass) {
                            const carcassIndex = steppeMammothCarcasses.indexOf(p.butcherTarget);
                            if (carcassIndex > -1) {
                                steppeMammothCarcasses.splice(carcassIndex, 1);
                            }
                        } else {
                            const carcassIndex = mammothCarcasses.indexOf(p.butcherTarget);
                            if (carcassIndex > -1) {
                                mammothCarcasses.splice(carcassIndex, 1);
                            }
                        }
                        console.log("Туша полностью разделана и убрана");
                        
                        // Завершаем разделку
                        p.butcherTarget = null;
                        p.butchering = false;
                        p.butcherStartTime = null;
                        p.target = null;
                        p.lastAction = 'Разделал тушу!';
                        p.statusDisplayTimer = 120;
                    }
                    
                    // Защита от зависания: если разделка длится слишком долго
                    let maxButcherTime;
                    if (isDeerCarcass) {
                        maxButcherTime = 12000; // 12 секунд для оленя
                    } else if (isSteppeMammothCarcass) {
                        maxButcherTime = 30000; // 30 секунд для степного мамонта
                    } else {
                        maxButcherTime = 18000; // 18 секунд для обычного мамонта
                    }
                    if (currentTime - p.butcherStartTime > maxButcherTime) {
                        console.log("Принудительное завершение разделки - слишком долго");
                        p.butcherTarget = null;
                        p.butchering = false;
                        p.butcherStartTime = null;
                        p.target = null;
                    }
                } else {
                    // Идем к туше
                    p.x += (dx / distance) * p.speed;
                    p.y += (dy / distance) * p.speed;
                }
                
                // Если разделываем тушу, не проверяем другие цели
                return;
            }

            // Приоритет 2: Охота на оленей (если назначена цель)
            if (p.huntTarget && p.huntTarget.health > 0) {
                const dx = p.huntTarget.x - p.x;
                const dy = p.huntTarget.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= p.attackRange) {
                    // В радиусе атаки - стреляем в оленя
                    if (currentTime - p.lastAttack > 1000) { // Атака каждую секунду
                        p.huntTarget.health -= p.damage;
                        p.lastAttack = currentTime;
                        
                        // Проверяем смерть оленя
                        if (p.huntTarget.health <= 0) {
                            // Создаем тушу оленя
                            deerCarcasses.push({
                                x: p.huntTarget.x,
                                y: p.huntTarget.y,
                                food: 15, // Количество пищи в туше
                                maxFood: 15
                            });
                            
                            // Удаляем оленя из массива
                            const deerIndex = deer.indexOf(p.huntTarget);
                            if (deerIndex > -1) {
                                deer.splice(deerIndex, 1);
                            }
                            
                            p.huntTarget = null;
                        }
                    }
                } else {
                    // Преследуем оленя
                    p.x += (dx / distance) * p.speed;
                    p.y += (dy / distance) * p.speed;
                }
                
                // Если охотимся на оленя, не проверяем другие цели
                return;
            }

            // Приоритет 3: Проверяем угрозы рядом - от неандертальцев убегаем!
            let closestNeanderthal = null;
            let closestNeanderthalDistance = Infinity;
            
            neanderthals.forEach(neanderthal => {
                const distance = Math.sqrt((p.x - neanderthal.x) ** 2 + (p.y - neanderthal.y) ** 2);
                if (distance < 100 && distance < closestNeanderthalDistance) {
                    closestNeanderthal = neanderthal;
                    closestNeanderthalDistance = distance;
                }
            });
            
            // Если рядом неандерталец - убегаем!
            if (closestNeanderthal) {
                const dx = p.x - closestNeanderthal.x;
                const dy = p.y - closestNeanderthal.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const fleeX = (dx / distance) * p.speed;
                    const fleeY = (dy / distance) * p.speed;
                    p.x += fleeX;
                    p.y += fleeY;
                }
                p.combatTarget = null; // Сбрасываем боевую цель во время бегства
                return;
            }
            
            // Ищем врагов для атаки (тигры и мамонты, только если нет неандертальцев рядом)
            if (!p.combatTarget || p.combatTarget.health <= 0) {
                let closestEnemy = null;
                let closestEnemyDistance = Infinity;
                
                // Проверяем тигров
                sabertoothTigers.forEach(tiger => {
                    const distance = Math.sqrt((p.x - tiger.x) ** 2 + (p.y - tiger.y) ** 2);
                    if (distance < p.detectionRange && distance < closestEnemyDistance) {
                        closestEnemy = tiger;
                        closestEnemyDistance = distance;
                    }
                });
                
                // Проверяем мамонтов (только если не нашли тигра или мамонт ближе)
                mammoths.forEach(mammoth => {
                    const distance = Math.sqrt((p.x - mammoth.x) ** 2 + (p.y - mammoth.y) ** 2);
                    if (distance < p.detectionRange && distance < closestEnemyDistance) {
                        closestEnemy = mammoth;
                        closestEnemyDistance = distance;
                    }
                });
                
                // Проверяем степных мамонтов
                steppeMammoths.forEach(mammoth => {
                    const distance = Math.sqrt((p.x - mammoth.x) ** 2 + (p.y - mammoth.y) ** 2);
                    if (distance < p.detectionRange && distance < closestEnemyDistance) {
                        closestEnemy = mammoth;
                        closestEnemyDistance = distance;
                    }
                });
                
                p.combatTarget = closestEnemy;
            }
            
            // Если есть боевая цель (тигр или мамонт)
            if (p.combatTarget && p.combatTarget.health > 0) {
                const dx = p.combatTarget.x - p.x;
                const dy = p.combatTarget.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= p.attackRange) {
                    // В радиусе атаки - стреляем из лука
                    if (currentTime - p.lastAttack > 1500) { // Атака каждые 1.5 секунды
                        p.combatTarget.health -= p.damage;
                        p.lastAttack = currentTime;
                        
                        // Проверяем смерть врага
                        if (p.combatTarget.health <= 0) {
                            // Удаляем мертвого врага из соответствующего массива
                            const tigerIndex = sabertoothTigers.indexOf(p.combatTarget);
                            const mammothIndex = mammoths.indexOf(p.combatTarget);
                            const steppeMammothIndex = steppeMammoths.indexOf(p.combatTarget);
                            
                            if (tigerIndex > -1) {
                                sabertoothTigers.splice(tigerIndex, 1);
                            } else if (mammothIndex > -1) {
                                // Создаем тушу мамонта
                                mammothCarcasses.push({
                                    x: p.combatTarget.x,
                                    y: p.combatTarget.y,
                                    food: 75 // 75 единиц мяса
                                });
                                mammoths.splice(mammothIndex, 1);
                            } else if (steppeMammothIndex > -1) {
                                // Создаем тушу степного мамонта (огромное количество еды)
                                steppeMammothCarcasses.push({
                                    x: p.combatTarget.x,
                                    y: p.combatTarget.y,
                                    food: 200 // 200 единиц мяса
                                });
                                steppeMammoths.splice(steppeMammothIndex, 1);
                            }
                            
                            // Сбрасываем боевую цель
                            p.combatTarget = null;
                        }
                    }
                } else {
                    // Приближаемся к цели, но не слишком близко (держим дистанцию)
                    if (distance > p.attackRange * 0.8) {
                        p.x += (dx / distance) * (p.speed * 0.8);
                        p.y += (dy / distance) * (p.speed * 0.8);
                    }
                }
            } else if (p.target) {
                // Если нет боевых целей, выполнить обычное движение к цели
                const dx = p.target.x - p.x;
                const dy = p.target.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 2) {
                    p.x += dx / dist * p.speed;
                    p.y += dy / dist * p.speed;
                } else {
                    p.x = p.target.x;
                    p.y = p.target.y;
                    p.target = null;
                }
            }
            return; // Пропускаем остальную логику для охотников
        }
        
        // Логика бегства для мирных жителей от неандертальцев
        if (p.type === 'civilian') {
            let closestNeanderthal = null;
            let closestDistance = Infinity;
            
            neanderthals.forEach(neanderthal => {
                const distance = Math.sqrt((p.x - neanderthal.x) ** 2 + (p.y - neanderthal.y) ** 2);
                if (distance < 80 && distance < closestDistance) { // Радиус страха 80 пикселей
                    closestNeanderthal = neanderthal;
                    closestDistance = distance;
                }
            });
            
            // Если рядом неандерталец - убегаем!
            if (closestNeanderthal) {
                const dx = p.x - closestNeanderthal.x; // Направление от неандертальца
                const dy = p.y - closestNeanderthal.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    // Бежим в противоположную сторону
                    const fleeX = (dx / distance) * 3; // Быстро убегаем
                    const fleeY = (dy / distance) * 3;
                    
                    p.x += fleeX;
                    p.y += fleeY;
                    
                    // Прерываем сбор ресурсов во время бегства
                    p.harvestingTreePos = null;
                    p.harvestTimer = 0;
                    p.hasAxe = false;
                    p.currentBush = null;
                    p.choppingTimer = 0;
                    
                    return; // Пропускаем остальную логику во время бегства
                }
            }
        }
        
        // Автоматический сбор пищи с яблонь (только для мирных жителей-civilians)
        if (p.type === 'civilian' && !p.hasAxe && !p.target) {
            // Сначала проверяем, нет ли поблизости опасности (неандертальцев)
            let isDangerous = false;
            neanderthals.forEach(neanderthal => {
                const distToNeanderthal = Math.sqrt((p.x - neanderthal.x) ** 2 + (p.y - neanderthal.y) ** 2);
                if (distToNeanderthal < 100) { // Если неандерталец в радиусе 100 пикселей
                    isDangerous = true;
                }
            });
            
            // Собираем пищу только если безопасно
            if (!isDangerous) {
                for (let tree of appleTrees) {
                    const distToTree = Math.sqrt((p.x - tree.x) ** 2 + (p.y - tree.y) ** 2);
                    if (distToTree < tree.r && tree.food > 0) {
                        // Начинаем сбор пищи только если еще не собираем
                        if (!p.harvestingTreePos) {
                            p.harvestingTreePos = {x: tree.x, y: tree.y}; // Сохраняем позицию вместо ссылки
                            p.harvestTimer = 60; // 1 секунда при 60 FPS
                        }
                        break;
                    }
                }
            }
        }
        
        // Процесс сбора пищи (только для civilians)
        if (p.type === 'civilian' && p.harvestingTreePos && p.harvestTimer > 0) {
            p.harvestTimer--;
            if (p.harvestTimer === 0) {
                // Ищем дерево по координатам
                const currentTree = appleTrees.find(tree => 
                    tree.x === p.harvestingTreePos.x && tree.y === p.harvestingTreePos.y
                );
                
                if (currentTree && currentTree.food > 0) {
                    currentTree.food--;
                    resources.food++;
                    
                    // Воспроизводим звук сбора яблок
                    if (appleSoundLoaded && userHasInteracted) {
                        try {
                            appleSound.currentTime = 0;
                            const playPromise = appleSound.play();
                            if (playPromise !== undefined) {
                                playPromise.then(() => {
                                    console.log('🍎 Apple sound played successfully');
                                }).catch(e => {
                                    console.log('🍎 Apple sound play failed:', e.name, e.message);
                                });
                            }
                        } catch (e) {
                            console.log('🍎 Error playing apple sound:', e.message);
                        }
                    }
                    
                    // Если дерево опустошено, запускаем таймер восстановления
                    if (currentTree.food === 0) {
                        currentTree.regenerationTimer = 1800; // 30 секунд при 60 FPS
                    }
                }
                // Завершаем сбор только после получения еды
                p.harvestingTreePos = null;
                p.harvestTimer = 0;
                // Устанавливаем таймер отображения статуса на 2 секунды
                p.statusDisplayTimer = 120; // 2 секунды при 60 FPS
                p.lastAction = 'food';
            }
        }
        
        // Проверяем, остался ли персонаж рядом с деревом (только если он не в процессе сбора)
        if (p.harvestingTreePos && p.harvestTimer === 0) {
            const currentTree = appleTrees.find(tree => 
                tree.x === p.harvestingTreePos.x && tree.y === p.harvestingTreePos.y
            );
            
            if (currentTree) {
                const distToTree = Math.sqrt((p.x - currentTree.x) ** 2 + (p.y - currentTree.y) ** 2);
                if (distToTree >= currentTree.r || currentTree.food === 0) {
                    // Персонаж ушел от дерева или дерево пустое - прекращаем сбор
                    p.harvestingTreePos = null;
                    p.harvestTimer = 0;
                }
            } else {
                // Дерево исчезло - прекращаем сбор
                p.harvestingTreePos = null;
                p.harvestTimer = 0;
            }
        }
        
        // Автоматический поиск камней для сбора (только для civilians)
        if (p.type === 'civilian' && !p.target && !p.harvestingTreePos) {
            for (let stone of stones) {
                const distToStone = Math.sqrt((p.x - stone.x) ** 2 + (p.y - stone.y) ** 2);
                if (distToStone < stone.r + 50 && stone.amount > 0) { // Расширенный радиус обнаружения
                    // Устанавливаем камень как цель для движения
                    if (!p.collectingStonePos) {
                        p.target = {x: stone.x, y: stone.y};
                        p.targetStone = {x: stone.x, y: stone.y}; // Запоминаем какой камень является целью
                    }
                    break;
                }
            }
        }
        
        // Процесс сбора камней (только для civilians)
        if (p.type === 'civilian' && p.collectingStonePos && p.collectTimer > 0) {
            p.collectTimer--;
            if (p.collectTimer === 0) {
                // Ищем камень по координатам
                const currentStone = stones.find(stone => 
                    stone.x === p.collectingStonePos.x && stone.y === p.collectingStonePos.y
                );
                
                if (currentStone && currentStone.amount > 0) {
                    currentStone.amount--;
                    resources.stone++;
                    
                    // Если камни закончились, удаляем месторождение
                    if (currentStone.amount === 0) {
                        const stoneIndex = stones.indexOf(currentStone);
                        if (stoneIndex > -1) {
                            stones.splice(stoneIndex, 1);
                        }
                    }
                }
                // Завершаем сбор только после получения камня
                stopStoneSoundForPerson(idx);
                p.collectingStonePos = null;
                p.collectTimer = 0;
                // Устанавливаем таймер отображения статуса на 2 секунды
                p.statusDisplayTimer = 120; // 2 секунды при 60 FPS
                p.lastAction = 'stone';
            }
        }
        
        // Проверяем, остался ли персонаж рядом с камнем (только если он не в процессе сбора)
        if (p.collectingStonePos && p.collectTimer === 0) {
            const currentStone = stones.find(stone => 
                stone.x === p.collectingStonePos.x && stone.y === p.collectingStonePos.y
            );
            
            if (currentStone) {
                const distToStone = Math.sqrt((p.x - currentStone.x) ** 2 + (p.y - currentStone.y) ** 2);
                if (distToStone >= currentStone.r || currentStone.amount === 0) {
                    // Персонаж ушел от камня или камни закончились - прекращаем сбор
                    stopStoneSoundForPerson(idx);
                    p.collectingStonePos = null;
                    p.collectTimer = 0;
                }
            } else {
                // Камень исчез - прекращаем сбор
                stopStoneSoundForPerson(idx);
                p.collectingStonePos = null;
                p.collectTimer = 0;
            }
        }
        
        // Автоматический сбор туш оленей (только для civilians, кроме охотников с заданием разделки)
        if (p.type === 'civilian' && !p.hasAxe && !p.target && !p.collectingStonePos && !p.butcherTarget) {
            for (let carcass of deerCarcasses) {
                const distToCarcass = Math.sqrt((p.x - carcass.x) ** 2 + (p.y - carcass.y) ** 2);
                if (distToCarcass < 30 && carcass.food > 0) {
                    // Начинаем сбор пищи с туши
                    if (!p.collectingCarcass) {
                        p.collectingCarcass = carcass;
                        p.carcassTimer = 60; // 1 секунда при 60 FPS
                        p.lastAction = 'Собирает мясо';
                        p.statusDisplayTimer = 120;
                    }
                    break;
                }
            }
        }
        
        // Обработка сбора мяса с туши (только для civilians)
        if (p.type === 'civilian' && p.collectingCarcass && p.carcassTimer > 0) {
            p.carcassTimer--;
            if (p.carcassTimer <= 0) {
                // Получаем пищу!
                const foodGained = Math.min(3, p.collectingCarcass.food); // Получаем до 3 пищи за раз
                resources.food += foodGained;
                totalFoodCollected += foodGained; // Обновляем общий счетчик пищи
                p.collectingCarcass.food -= foodGained;
                p.carcassTimer = 60; // Сбрасываем таймер на следующую секунду
                p.lastAction = 'Получил мясо!';
                p.statusDisplayTimer = 120;
                
                // Проверяем разблокировку новых эпох
                checkEraUnlocks();
                
                // Если туша пуста, удаляем её
                if (p.collectingCarcass.food <= 0) {
                    const carcassIndex = deerCarcasses.indexOf(p.collectingCarcass);
                    if (carcassIndex > -1) {
                        deerCarcasses.splice(carcassIndex, 1);
                    }
                    p.collectingCarcass = null;
                }
            }
        }
        
        // Если персонаж ушел от туши, прекращаем сбор
        if (p.collectingCarcass) {
            const distToCarcass = Math.sqrt((p.x - p.collectingCarcass.x) ** 2 + (p.y - p.collectingCarcass.y) ** 2);
            if (distToCarcass > 30) {
                p.collectingCarcass = null;
                p.carcassTimer = 0;
            }
        }
        
        if (p.target) {
            // Для мирных жителей: проверяем безопасность перед движением к цели
            if (p.type === 'civilian') {
                let isDangerous = false;
                neanderthals.forEach(neanderthal => {
                    const distToNeanderthal = Math.sqrt((p.target.x - neanderthal.x) ** 2 + (p.target.y - neanderthal.y) ** 2);
                    if (distToNeanderthal < 50) { // Если цель слишком близко к неандертальцу
                        isDangerous = true;
                    }
                });
                
                // Если цель опасна, отменяем движение
                if (isDangerous) {
                    p.target = null;
                    return;
                }
            }
            
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 2) {
                // Увеличиваем скорость движения персонажей для лучшего исследования
                p.x += dx / dist * 1;
                p.y += dy / dist * 1;
            } else {
                // Проверить, была ли цель - куст
                let targetBush = null;
                for (let bush of bushes) {
                    const distToBush = Math.sqrt((p.target.x - bush.x) ** 2 + (p.target.y - bush.y) ** 2);
                    if (distToBush < bush.r && bush.durability > 0) {
                        targetBush = bush;
                        break;
                    }
                }
                
                if (targetBush && p.type === 'civilian') { // Только civilians могут рубить
                    // Переместить человека в центр куста для рубки
                    p.x = targetBush.x;
                    p.y = targetBush.y;
                    p.hasAxe = true;
                    p.choppingTimer = 120; // 2 секунды при 60 FPS
                    p.currentBush = targetBush;
                    
                    // Запускаем непрерывный звук рубки для выбранного персонажа
                    startWoodSoundForSelectedPerson(idx);
                } else if (p.targetStone && p.type === 'civilian') {
                    // Проверить, есть ли камень в целевой позиции
                    let targetStone = null;
                    for (let stone of stones) {
                        const distToStone = Math.sqrt((p.targetStone.x - stone.x) ** 2 + (p.targetStone.y - stone.y) ** 2);
                        if (distToStone < stone.r && stone.amount > 0) {
                            targetStone = stone;
                            break;
                        }
                    }
                    
                    if (targetStone) {
                        // Начинаем сбор камней
                        console.log(`🪨 Person ${idx} starting stone collection!`);
                        p.collectingStonePos = {x: targetStone.x, y: targetStone.y};
                        p.collectTimer = 90; // 1.5 секунды при 60 FPS
                        
                        // Запускаем непрерывный звук добычи камня для выбранного персонажа
                        startStoneSoundForSelectedPerson(idx);
                    }
                    
                    p.x = p.target.x;
                    p.y = p.target.y;
                    p.targetStone = null;
                } else {
                    p.x = p.target.x;
                    p.y = p.target.y;
                }
                p.target = null;
            }
        }
        
        // Проверить, находится ли человек с топором в области куста
        if (p.hasAxe && p.currentBush) {
            const distToBush = Math.sqrt((p.x - p.currentBush.x) ** 2 + (p.y - p.currentBush.y) ** 2);
            if (distToBush > p.currentBush.r || p.currentBush.durability <= 0) {
                // Человек вышел за область куста или куст срублен - убрать топор
                stopWoodSoundForPerson(idx);
                p.hasAxe = false;
                p.choppingTimer = 0;
                p.currentBush = null;
            }
        }
        
        // Рубка куста
        if (p.hasAxe && p.choppingTimer > 0 && p.currentBush && p.currentBush.durability > 0) {
            p.choppingTimer--;
            if (p.choppingTimer === 0) {
                p.currentBush.durability--;
                resources.wood += 1; // Получаем 1 дерево за каждый удар
                totalWoodCollected += 1; // Обновляем общий счетчик дерева
                
                if (p.currentBush.durability > 0) {
                    p.choppingTimer = 120; // Следующий удар через 2 секунды
                } else {
                    // Куст срублен - останавливаем звук
                    stopWoodSoundForPerson(idx);
                    p.hasAxe = false;
                    p.currentBush.durability = 0;
                    p.currentBush = null;
                }
            }
        }
        
        // Обновляем таймер отображения статуса
        if (p.statusDisplayTimer > 0) {
            p.statusDisplayTimer--;
        }
    });
    
    // Проверяем приближение ЛЮБЫХ персонажей к пещерам для спавна неандертальцев
    caves.forEach(cave => {
        if (!cave.hasSpawnedNeanderthals) {
            // Проверяем всех персонажей (мирных жителей И воинов)
            const anyPersonNearCave = people.some(person => {
                const distanceToCave = Math.sqrt((person.x - cave.x) ** 2 + (person.y - cave.y) ** 2);
                return distanceToCave < 100; // Если ЛЮБОЙ персонаж подошел близко к пещере
            });
            
            if (anyPersonNearCave) {
                // Спавним неандертальцев рядом с пещерой
                cave.hasSpawnedNeanderthals = true;
                
                for (let i = 0; i < cave.neanderthalCount; i++) {
                    const angle = (i / cave.neanderthalCount) * Math.PI * 2;
                    const spawnDistance = 40 + Math.random() * 40; // Ближе к пещере (40-80 пикселей)
                    const neanderthalX = cave.x + Math.cos(angle) * spawnDistance;
                    const neanderthalY = cave.y + Math.sin(angle) * spawnDistance;
                    
                    neanderthals.push({
                        x: neanderthalX,
                        y: neanderthalY,
                        health: 80,
                        maxHealth: 80,
                        target: null,
                        attackCooldown: 0,
                        speed: 1.8,
                        detectionRange: 200, // Увеличенный радиус обнаружения
                        attackRange: 30,
                        damage: 25,
                        lastAttack: 0,
                        cave: cave,
                        inCave: false // Они на поверхности
                    });
                }
            }
        }
    });
    
    // Обновление ферм
    updateFarms();
    
    // Восстановление пищи в яблонях
    appleTrees.forEach(tree => {
        if (tree.food < tree.maxFood && tree.regenerationTimer > 0) {
            tree.regenerationTimer--;
            if (tree.regenerationTimer === 0) {
                tree.food = tree.maxFood; // Восстанавливаем всю пищу сразу
            }
        }
    });
    
    // Обновление таймеров сообщений
    populationMessages.forEach((message, index) => {
        message.timer--;
        if (message.timer <= 0) {
            populationMessages.splice(index, 1);
        }
    });
}

// Обновление ферм
function updateFarms() {
    buildings.forEach(building => {
        if (building.type === 'farm') {
            const currentTime = Date.now();
            
            // Автоматически назначаем ближайших безработных мирных жителей на ферму
            if (building.workers.length < 3) { // Максимум 3 работника на ферму
                people.forEach(person => {
                    if (person.type === 'civilian' && !person.target && !person.farmWork && 
                        !person.harvestingTreePos && !person.collectingStonePos && 
                        !person.butcherTarget && !person.collectingCarcass) {
                        
                        const distance = Math.sqrt((person.x - building.x) ** 2 + (person.y - building.y) ** 2);
                        if (distance < 200 && building.workers.length < 3) { // Радиус поиска работников
                            building.workers.push(person);
                            person.farmWork = building;
                            person.target = { x: building.x + (Math.random() - 0.5) * 160, y: building.y + 60 }; // Работа в поле
                            person.lastAction = 'Идет работать на ферму';
                            person.statusDisplayTimer = 120;
                        }
                    }
                });
            }
            
            // Производство еды каждые 60 секунд
            if (building.workers.length > 0) {
                if (!building.lastProduction) {
                    building.lastProduction = currentTime;
                }
                
                if (currentTime - building.lastProduction > 60000) { // 60 секунд
                    const foodProduced = building.workers.length * 5; // 5 еды за работника
                    resources.food += foodProduced;
                    totalFoodCollected += foodProduced;
                    building.lastProduction = currentTime;
                    
                    // Проверяем разблокировку новых эпох
                    checkEraUnlocks();
                    
                    // Уведомление о производстве
                    console.log(`Ферма произвела ${foodProduced} еды`);
                }
            }
            
            // Обновляем статус работников
            building.workers.forEach((worker, index) => {
                if (!worker || worker.health <= 0 || worker.farmWork !== building) {
                    // Удаляем мертвых или ушедших работников
                    building.workers.splice(index, 1);
                    return;
                }
                
                // Если работник далеко от фермы, направляем его обратно
                const distance = Math.sqrt((worker.x - building.x) ** 2 + (worker.y - building.y) ** 2);
                if (distance > 100 && !worker.target) {
                    worker.target = { x: building.x + (Math.random() - 0.5) * 160, y: building.y + 60 };
                    worker.lastAction = 'Возвращается на ферму';
                    worker.statusDisplayTimer = 120;
                }
                
                // Работники показывают что работают
                if (distance < 100) {
                    worker.lastAction = 'Работает на ферме';
                    worker.statusDisplayTimer = 120;
                }
            });
        }
    });
}

// Обновление летящих копий
function updateFlyingSpears() {
    const currentTime = Date.now();
    
    flyingSpears.forEach((spear, index) => {
        // Вычисляем направление и расстояние до цели
        const dx = spear.targetX - spear.startX;
        const dy = spear.targetY - spear.startY;
        const totalDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Время полета
        const flightTime = currentTime - spear.startTime;
        const progress = (flightTime * spear.speed) / (totalDistance * 10); // Нормализованный прогресс 0-1
        
        if (progress >= 1) {
            // Копье достигло цели
            if (spear.target && spear.target.health > 0) {
                // Наносим урон
                spear.target.health -= spear.damage;
                
                // Если враг убит
                if (spear.target.health <= 0) {
                    const tigerIndex = sabertoothTigers.indexOf(spear.target);
                    const mammothIndex = mammoths.indexOf(spear.target);
                    const steppeMammothIndex = steppeMammoths.indexOf(spear.target);
                    const neanderthalIndex = neanderthals.indexOf(spear.target);
                    
                    if (tigerIndex > -1) {
                        sabertoothTigers.splice(tigerIndex, 1);
                    } else if (mammothIndex > -1) {
                        // Создаем тушу мамонта
                        mammothCarcasses.push({
                            x: spear.target.x,
                            y: spear.target.y,
                            food: 75
                        });
                        mammoths.splice(mammothIndex, 1);
                    } else if (steppeMammothIndex > -1) {
                        // Создаем тушу степного мамонта (больше еды)
                        steppeMammothCarcasses.push({
                            x: spear.target.x,
                            y: spear.target.y,
                            food: 200 // Огромное количество еды
                        });
                        steppeMammoths.splice(steppeMammothIndex, 1);
                    } else if (neanderthalIndex > -1) {
                        neanderthals.splice(neanderthalIndex, 1);
                    }
                    
                    // Сбрасываем цель у метателя
                    if (spear.thrower) {
                        spear.thrower.combatTarget = null;
                    }
                }
            }
            
            // Удаляем копье из массива
            flyingSpears.splice(index, 1);
        } else {
            // Обновляем позицию копья
            spear.currentX = spear.startX + dx * progress;
            spear.currentY = spear.startY + dy * progress;
        }
    });
}

// Отрисовка летящих копий
function drawFlyingSpears() {
    flyingSpears.forEach(spear => {
        const screenX = spear.currentX - camera.x;
        const screenY = spear.currentY - camera.y;
        
        // Проверяем видимость
        if (screenX > -100 && screenX < canvas.width + 100 && 
            screenY > -100 && screenY < canvas.height + 100) {
            
            ctx.save();
            
            // Вычисляем угол поворота копья
            const dx = spear.targetX - spear.startX;
            const dy = spear.targetY - spear.startY;
            const angle = Math.atan2(dy, dx);
            
            // Поворачиваем копье по направлению полета
            ctx.translate(screenX, screenY);
            ctx.rotate(angle);
            
            // Рисуем древко копья
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(15, 0);
            ctx.stroke();
            
            // Рисуем наконечник копья
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(10, -4);
            ctx.lineTo(10, 4);
            ctx.closePath();
            ctx.fill();
            
            // Рисуем оперение копья
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-12, -2);
            ctx.lineTo(-12, 2);
            ctx.closePath();
            ctx.fill();
            
            // Эффект движения - размытие
            ctx.shadowColor = '#8B4513';
            ctx.shadowBlur = 5;
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-20, 0);
            ctx.lineTo(-15, 0);
            ctx.stroke();
            
            ctx.restore();
        }
    });
}


// Функция для обработки кликов в главном меню
function handleMenuClick(screenX, screenY) {
    console.log('Menu click at:', screenX, screenY);
    
    if (window.menuButtons) {
        console.log('menuButtons found');
        
        // Клик на "Новая игра"
        const newGameBtn = window.menuButtons.newGame;
        if (screenX >= newGameBtn.x && screenX <= newGameBtn.x + newGameBtn.width &&
            screenY >= newGameBtn.y && screenY <= newGameBtn.y + newGameBtn.height) {
            console.log('New game button clicked!');
            startNewGame();
            return true;
        }
        
        // Клик на "Продолжить"
        const continueBtn = window.menuButtons.continue;
        if (screenX >= continueBtn.x && screenX <= continueBtn.x + continueBtn.width &&
            screenY >= continueBtn.y && screenY <= continueBtn.y + continueBtn.height &&
            hasSavedGame()) { // Проверяем, есть ли сохранение
            console.log('Continue button clicked!');
            continueGame();
            return true;
        }
        
        // Клик на кнопку переключения управления
        const controlBtn = window.menuButtons.controlMode;
        if (screenX >= controlBtn.x && screenX <= controlBtn.x + controlBtn.width &&
            screenY >= controlBtn.y && screenY <= controlBtn.y + controlBtn.height) {
            console.log('Control mode button clicked!');
            toggleMobileControls();
            return true;
        }
        
        console.log('Click missed all buttons');
    } else {
        console.log('window.menuButtons not found!');
    }
    return false;
}

// Функция для обработки кликов в меню паузы
function handlePauseMenuClick(screenX, screenY) {
    if (window.pauseMenuButtons) {
        // Клик на "Продолжить"
        const continueBtn = window.pauseMenuButtons.continue;
        if (screenX >= continueBtn.x && screenX <= continueBtn.x + continueBtn.width &&
            screenY >= continueBtn.y && screenY <= continueBtn.y + continueBtn.height) {
            gameState = 'playing';
            return true;
        }
        
        // Клик на "Сохранить"
        const saveBtn = window.pauseMenuButtons.save;
        if (screenX >= saveBtn.x && screenX <= saveBtn.x + saveBtn.width &&
            screenY >= saveBtn.y && screenY <= saveBtn.y + saveBtn.height) {
            saveGameState();
            console.log('Игра сохранена через меню паузы');
            return true;
        }
        
        // Клик на "Главное меню"
        const mainMenuBtn = window.pauseMenuButtons.mainMenu;
        if (screenX >= mainMenuBtn.x && screenX <= mainMenuBtn.x + mainMenuBtn.width &&
            screenY >= mainMenuBtn.y && screenY <= mainMenuBtn.y + mainMenuBtn.height) {
            saveGameState(); // Автоматически сохраняем перед выходом
            
            // Сбрасываем флаг воспроизведения музыки главного меню для её возобновления
            mainMenuMusicPlaying = false;
            
            gameState = 'menu';
            return true;
        }
    }
    return false;
}

canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left + camera.x;
    mouseY = e.clientY - rect.top + camera.y;
});

// Отключаем контекстное меню браузера на правой кнопке мыши
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

canvas.addEventListener('mousedown', function(e) {
    // Обрабатываем первое взаимодействие пользователя
    handleFirstInteraction();
    
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const mx = screenX + camera.x;
    const my = screenY + camera.y;
    
    console.log('Mouse down at screen:', screenX, screenY, 'world:', mx, my);
    console.log('Game state:', gameState);
    
    // Обработка кликов в главном меню
    if (gameState === 'menu') {
        console.log('Processing menu click...');
        if (handleMenuClick(screenX, screenY)) {
            return;
        }
        return; // Игнорируем все остальные клики в меню
    }
    
    // Обработка кликов в меню паузы
    if (gameState === 'paused') {
        if (handlePauseMenuClick(screenX, screenY)) {
            return;
        }
        return; // Игнорируем все остальные клики в меню паузы
    }
    
    // Правая кнопка мыши - сбрасываем выделение
    if (e.button === 2) {
        selectedPeople = [];
        // Обновляем звук рубки после сброса выделения
        updateWoodSound();
        updateStoneSound();
        return;
    }
    
    // ===== ПРОВЕРКА КЛИКОВ ПО UI ПАНЕЛЯМ (ПРИОРИТЕТ) =====
    
    // Проверяем клик по кнопке "ОТКРЫТЬ" (для мобильных) - высший приоритет
    if (window.openBuildingModalButton) {
        const btn = window.openBuildingModalButton;
        console.log('Проверяем клик по кнопке ОТКРЫТЬ:', {
            screenX, screenY, 
            btnX: btn.x, btnY: btn.y, 
            btnWidth: btn.width, btnHeight: btn.height,
            inX: screenX >= btn.x && screenX <= btn.x + btn.width,
            inY: screenY >= btn.y && screenY <= btn.y + btn.height
        });
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height) {
            console.log('Клик по кнопке ОТКРЫТЬ! Открываем модальное окно');
            showBuildingModal = true;
            return;
        }
    }
    
    // Проверяем клик по панели строительства (для предотвращения движения людей)
    const isMobile = showMobileControls || window.innerWidth <= 800;
    const panelHeight = isMobile ? 80 : 120;
    const panelY = canvas.height - panelHeight;
    
    // Устанавливаем флаг клика по панели для последующей проверки
    let clickedOnBuildingPanel = false;
    if (screenY >= panelY && screenY <= canvas.height) {
        clickedOnBuildingPanel = true;
        console.log('Клик по панели строительства - блокируем движение');
    }
    
    // Проверяем клики по кнопкам закрытия модальных окон зданий (для мобильных)
    if (window.reproductionHouseCloseButton) {
        const btn = window.reproductionHouseCloseButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height) {
            selectedBuilding = null;
            return;
        }
    }
    
    if (window.warriorCampCloseButton) {
        const btn = window.warriorCampCloseButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height) {
            selectedBuilding = null;
            return;
        }
    }
    
    if (window.bonfireCloseButton) {
        const btn = window.bonfireCloseButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height) {
            selectedBuilding = null;
            return;
        }
    }
    
    // Проверяем клик на кнопку найма в интерфейсе хижины рода
    if (window.reproductionHouseHireButton) {
        const btn = window.reproductionHouseHireButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом
            if (people.length < maxPopulation && resources.food >= 5) {
                // Нанимаем нового человека рядом с хижиной рода
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'civilian',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 100,
                    maxHealth: 100,
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.food -= 5;
                selectedBuilding = null; // Закрываем панель после найма
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма охотника в интерфейсе хижины рода
    if (window.reproductionHouseHunterButton) {
        const btn = window.reproductionHouseHunterButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом охотника
            if (people.length < maxPopulation && resources.wood >= 5 && resources.food >= 3) {
                // Нанимаем нового охотника рядом с хижиной рода
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'hunter',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 120, // Больше здоровья чем у обычных людей
                    maxHealth: 120,
                    // Боевые характеристики охотника
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 200, // Хорошо видят врагов
                    attackRange: 60, // Дальняя атака (лук)
                    damage: 40, // Средний урон
                    lastAttack: 0,
                    speed: 3.0 // Быстрее оленей (2.5)
                });
                
                resources.wood -= 5;
                resources.food -= 3;
                selectedBuilding = null; // Закрываем панель после найма
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку технологии в интерфейсе хижины рода
    if (window.reproductionHouseTechButton) {
        const btn = window.reproductionHouseTechButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height && btn.canResearch) {
            
            // Дополнительная проверка ресурсов перед изучением технологии
            if (resources.food >= 200 && currentEra === 'stone_age') {
                // Тратим пищу и открываем новокаменный век
                resources.food -= 200;
                currentEra = 'bone_age';
                eras.bone_age.unlocked = true;
                
                // Добавляем уведомление об открытии новой эпохи
                eraNotifications.push({
                    message: `🌾 Новокаменный век открыт!`,
                    timer: 3000,
                    y: canvas.height / 2 - 60
                });
                
                selectedBuilding = null; // Закрываем панель после изучения
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма в интерфейсе лагеря воинов
    if (window.warriorCampHireButton) {
        const btn = window.warriorCampHireButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом
            if (people.length < maxPopulation && resources.wood >= 10 && resources.food >= 3) {
                // Нанимаем нового воина рядом с лагерем воинов
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'warrior',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 120,
                    maxHealth: 120,
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 220,
                    attackRange: 45,
                    damage: 35,
                    lastAttack: 0,
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.wood -= 10;
                resources.food -= 3;
                selectedBuilding = null; // Закрываем панель после найма
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма метателя копья в интерфейсе лагеря воинов
    if (window.warriorCampHireSpearmanButton) {
        const btn = window.warriorCampHireSpearmanButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов и эпохи перед наймом
            if (people.length < maxPopulation && resources.wood >= 15 && resources.stone >= 5 && currentEra === 'bone_age') {
                // Нанимаем нового метателя копья рядом с лагерем воинов
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'spearman',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 100,
                    maxHealth: 100,
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 300, // Больше дальность обнаружения
                    attackRange: 120,    // Дальняя атака копьем
                    damage: 25,
                    lastAttack: 0,
                    miningCave: null,
                    miningTimer: 0,
                    throwCooldown: 0     // Кулдаун для метания копья
                });
                
                resources.wood -= 15;
                resources.stone -= 5;
                selectedBuilding = null; // Закрываем панель после найма
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма факельщика в интерфейсе костра
    if (window.bonfireHireTorchbearerButton) {
        const btn = window.bonfireHireTorchbearerButton;
        if (screenX >= btn.x && screenX <= btn.x + btn.width && 
            screenY >= btn.y && screenY <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом факельщика
            if (people.length < maxPopulation && resources.wood >= 5 && resources.food >= 5) {
                // Нанимаем нового факельщика рядом с костром
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'torchbearer',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 80, // Меньше здоровья чем у других
                    maxHealth: 80,
                    // Боевые характеристики факельщика - слабые
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 150, // Средний радиус обнаружения
                    attackRange: 35, // Ближний бой
                    damage: 15, // Очень слабый урон
                    lastAttack: 0,
                    // Способность отпугивания
                    scaringRange: 200, // Увеличенный радиус отпугивания мамонтов и тигров
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.wood -= 5;
                resources.food -= 5;
                selectedBuilding = null; // Закрываем панель после найма
            }
            return;
        }
    }
    
    // Проверяем клики по панели строительства
    const hasBuilders = selectedPeople.some(idx => people[idx] && people[idx].type === 'civilian');
    if (hasBuilders) {
        // Кнопка жилища
        if (window.houseButtonBounds) {
            const btn = window.houseButtonBounds;
            if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                screenY >= btn.y && screenY <= btn.y + btn.height && btn.canBuild) {
                // Активируем режим строительства жилища
                buildingMode = true;
                buildingType = 'house';
                return;
            }
        }
        
        // Кнопка дома размножения
        if (window.reproductionHouseButtonBounds) {
            const btn = window.reproductionHouseButtonBounds;
            if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                screenY >= btn.y && screenY <= btn.y + btn.height && btn.canBuild) {
                // Активируем режим строительства дома размножения
                buildingMode = true;
                buildingType = 'reproduction_house';
                return;
            }
        }
        
        // Кнопка лагеря воинов
        if (window.warriorCampButtonBounds) {
            const btn = window.warriorCampButtonBounds;
            if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                screenY >= btn.y && screenY <= btn.y + btn.height && btn.canBuild) {
                // Активируем режим строительства лагеря воинов
                buildingMode = true;
                buildingType = 'warrior_camp';
                return;
            }
        }
        
        // Кнопка костра
        if (window.bonfireButtonBounds) {
            const btn = window.bonfireButtonBounds;
            if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                screenY >= btn.y && screenY <= btn.y + btn.height && btn.canBuild) {
                // Активируем режим строительства костра
                buildingMode = true;
                buildingType = 'bonfire';
                return;
            }
        }
        
        // Кнопка фермы
        if (window.farmButtonBounds) {
            const btn = window.farmButtonBounds;
            if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                screenY >= btn.y && screenY <= btn.y + btn.height && btn.canBuild) {
                // Активируем режим строительства фермы
                buildingMode = true;
                buildingType = 'farm';
                return;
            }
        }
    }
    
    // Если в режиме строительства, строим здание
    if (buildingMode && buildingType && hasBuilders) {
        if (buildingType === 'house' && resources.wood >= 10) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((mx - building.x) ** 2 + (my - building.y) ** 2);
                if (distance < 100) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((mx - 400) ** 2 + (my - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим жилище
                buildings.push({
                    x: mx,
                    y: my,
                    type: 'house'
                });
                resources.wood -= 10;
                
                // Увеличиваем максимальное население на 5 за каждый шалаш
                maxPopulation += 5;
                
                buildingMode = false;
                buildingType = null;
            }
        } else if (buildingType === 'reproduction_house' && resources.wood >= 15 && resources.stone >= 5) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((mx - building.x) ** 2 + (my - building.y) ** 2);
                if (distance < 120) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((mx - 400) ** 2 + (my - 350) ** 2);
            if (distanceToHut < 120) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим дом размножения
                buildings.push({
                    x: mx,
                    y: my,
                    type: 'reproduction_house'
                });
                resources.wood -= 15;
                resources.stone -= 5;
                
                buildingMode = false;
                buildingType = null;
            }
        } else if (buildingType === 'warrior_camp' && resources.wood >= 20 && resources.stone >= 10) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((mx - building.x) ** 2 + (my - building.y) ** 2);
                if (distance < 130) { // Лагерь воинов требует больше места
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((mx - 400) ** 2 + (my - 350) ** 2);
            if (distanceToHut < 130) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим лагерь воинов
                buildings.push({
                    x: mx,
                    y: my,
                    type: 'warrior_camp'
                });
                resources.wood -= 20;
                resources.stone -= 10;
                
                buildingMode = false;
                buildingType = null;
            }
        } else if (buildingType === 'bonfire' && resources.wood >= 10 && resources.stone >= 5) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((mx - building.x) ** 2 + (my - building.y) ** 2);
                if (distance < 100) { // Костер требует немного места
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((mx - 400) ** 2 + (my - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим костер
                buildings.push({
                    x: mx,
                    y: my,
                    type: 'bonfire'
                });
                resources.wood -= 10;
                resources.stone -= 5;
                
                buildingMode = false;
                buildingType = null;
            }
        } else if (buildingType === 'farm' && resources.wood >= 10) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((mx - building.x) ** 2 + (my - building.y) ** 2);
                if (distance < 150) { // Ферма требует много места
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((mx - 400) ** 2 + (my - 350) ** 2);
            if (distanceToHut < 150) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим ферму
                buildings.push({
                    x: mx,
                    y: my,
                    type: 'farm',
                    foodProduction: 0,
                    lastProduction: Date.now(),
                    workers: []
                });
                resources.wood -= 10;
                
                buildingMode = false;
                buildingType = null;
            }
        }
        return;
    }
    
    // Обработка кликов по модальному окну строительства (для мобильных)
    if (showBuildingModal) {
        // Проверяем клик на кнопку закрытия
        if (window.buildingModalCloseButton) {
            const btn = window.buildingModalCloseButton;
            if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                screenY >= btn.y && screenY <= btn.y + btn.height) {
                showBuildingModal = false;
                return;
            }
        }
        
        // Проверяем клики на здания в модальном окне
        if (window.buildingModalButtons) {
            for (const btn of window.buildingModalButtons) {
                if (screenX >= btn.x && screenX <= btn.x + btn.width && 
                    screenY >= btn.y && screenY <= btn.y + btn.height && btn.canBuild) {
                    // Активируем режим строительства выбранного здания
                    buildingMode = true;
                    buildingType = btn.type;
                    showBuildingModal = false; // Закрываем модальное окно
                    return;
                }
            }
        }
        
        // Если клик был в модальном окне, но не по кнопкам - игнорируем
        return;
    }
    
    
    // Проверяем клики по панели населения
    let clickedOnUI = false;
    people.forEach((p, idx) => {
        if (p.uiX && screenX >= p.uiX && screenX <= p.uiX + p.uiWidth && 
            screenY >= p.uiY && screenY <= p.uiY + p.uiHeight) {
            
            // Если зажат Ctrl ИЛИ это мобильное устройство, добавляем/убираем из выделения
            if (e.ctrlKey || showMobileControls) {
                const index = selectedPeople.indexOf(idx);
                if (index === -1) {
                    selectedPeople.push(idx); // Добавляем к выделению
                } else {
                    selectedPeople.splice(index, 1); // Убираем из выделения
                }
                console.log('Mouse - Переключено выделение персонажа', idx, 'Выделены:', selectedPeople);
            } else {
                // Обычный клик на десктопе - выделяем только этот персонаж
                selectedPeople = [idx];
                console.log('Mouse - Выделен только персонаж', idx);
            }
            
            buildingMode = false; // Сбрасываем режим строительства при выборе другого персонажа
            buildingType = null;
            
            // Очищаем кнопки найма при выборе персонажей
            window.reproductionHouseHireButton = null;
            window.reproductionHouseHunterButton = null;
            window.reproductionHouseTechButton = null;
            window.warriorCampHireButton = null;
            window.bonfireHireTorchbearerButton = null;
            
            clickedOnUI = true;
            return;
        }
    });
    
    if (clickedOnUI) return;
    
    // Затем проверяем выбор человечка на карте (приоритет)
    let found = false;
    people.forEach((p, idx) => {
        const d = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
        if (d < 18) {
            // Если зажат Ctrl, добавляем/убираем из выделения
            if (e.ctrlKey) {
                const index = selectedPeople.indexOf(idx);
                if (index === -1) {
                    selectedPeople.push(idx); // Добавляем к выделению
                } else {
                    selectedPeople.splice(index, 1); // Убираем из выделения
                }
            } else {
                // Обычный клик - выделяем только этот персонаж
                selectedPeople = [idx];
            }
            buildingMode = false; // Сбрасываем режим строительства
            buildingType = null;
            
            // Очищаем кнопки найма при выборе персонажей на карте
            window.reproductionHouseHireButton = null;
            window.reproductionHouseHunterButton = null;
            window.reproductionHouseTechButton = null;
            window.warriorCampHireButton = null;
            window.bonfireHireTorchbearerButton = null;
            
            found = true;
        }
    });
    
    // Если человек найден, выходим
    if (found) return;
    
    // Проверяем клик на здания
    buildings.forEach(building => {
        const distanceToBuilding = Math.sqrt((mx - building.x) ** 2 + (my - building.y) ** 2);
        if (distanceToBuilding < 60) { // Область клика по зданию
            selectedBuilding = building;
            buildingMode = false;
            buildingType = null;
            found = true;
            
            // Специальная обработка для фермы - назначаем работников
            if (building.type === 'farm' && selectedPeople.length > 0) {
                selectedPeople.forEach(personIdx => {
                    const person = people[personIdx];
                    if (person && person.type === 'civilian' && !person.farmWork) {
                        // Назначаем мирного жителя работать на ферму
                        if (building.workers.length < 3) { // Максимум 3 работника на ферму
                            building.workers.push(person);
                            person.farmWork = building;
                            person.target = { x: building.x + (Math.random() - 0.5) * 160, y: building.y + 60 };
                            person.lastAction = 'Идет работать на ферму';
                            person.statusDisplayTimer = 120;
                            console.log("Работник назначен на ферму");
                        }
                    }
                });
            }
        }
    });
    
    // Если здание найдено, выходим
    if (found) return;
    
    // Проверяем клик на оленей для охотников
    if (selectedPeople.length > 0) {
        // Проверяем есть ли охотники среди выбранных
        const hasHunters = selectedPeople.some(personIdx => 
            people[personIdx] && people[personIdx].type === 'hunter'
        );
        
        if (hasHunters) {
            // Проверяем клик на оленя
            for (let deerAnimal of deer) {
                const distToDeer = Math.sqrt((mx - deerAnimal.x) ** 2 + (my - deerAnimal.y) ** 2);
                if (distToDeer < 25) { // Клик по оленю
                    // Назначаем цель охоты только охотникам
                    selectedPeople.forEach(personIdx => {
                        if (people[personIdx] && people[personIdx].type === 'hunter') {
                            people[personIdx].huntTarget = deerAnimal;
                            people[personIdx].target = null; // Сбрасываем обычную цель
                        }
                    });
                    return; // Выходим, не назначая обычную цель движения
                }
            }
            
            // Проверяем клик на тушу оленя для разделки
            for (let carcass of deerCarcasses) {
                const distToCarcass = Math.sqrt((mx - carcass.x) ** 2 + (my - carcass.y) ** 2);
                if (distToCarcass < 30 && carcass.food > 0) { // Клик по туше с едой
                    // Назначаем цель разделки только охотникам
                    selectedPeople.forEach(personIdx => {
                        if (people[personIdx] && people[personIdx].type === 'hunter') {
                            people[personIdx].butcherTarget = carcass;
                            people[personIdx].target = { x: carcass.x, y: carcass.y };
                            people[personIdx].huntTarget = null; // Сбрасываем цель охоты
                            console.log("Назначена цель разделки охотнику");
                        }
                    });
                    return; // Выходим, не назначая обычную цель движения
                }
            }
            
            // Проверяем клик на тушу мамонта для разделки
            for (let carcass of mammothCarcasses) {
                const distToCarcass = Math.sqrt((mx - carcass.x) ** 2 + (my - carcass.y) ** 2);
                if (distToCarcass < 50 && carcass.food > 0) { // Клик по туше мамонта с едой (больший радиус)
                    // Назначаем цель разделки только охотникам
                    selectedPeople.forEach(personIdx => {
                        if (people[personIdx] && people[personIdx].type === 'hunter') {
                            people[personIdx].butcherTarget = carcass;
                            people[personIdx].target = { x: carcass.x, y: carcass.y };
                            people[personIdx].huntTarget = null; // Сбрасываем цель охоты
                            console.log("Назначена цель разделки мамонта охотнику");
                        }
                    });
                    return; // Выходим, не назначая обычную цель движения
                }
            }
            
            // Проверяем клик на тушу степного мамонта для разделки
            for (let carcass of steppeMammothCarcasses) {
                const distToCarcass = Math.sqrt((mx - carcass.x) ** 2 + (my - carcass.y) ** 2);
                if (distToCarcass < 70 && carcass.food > 0) { // Клик по туше степного мамонта (еще больший радиус)
                    // Назначаем цель разделки только охотникам
                    selectedPeople.forEach(personIdx => {
                        if (people[personIdx] && people[personIdx].type === 'hunter') {
                            people[personIdx].butcherTarget = carcass;
                            people[personIdx].target = { x: carcass.x, y: carcass.y };
                            people[personIdx].huntTarget = null; // Сбрасываем цель охоты
                            console.log("Назначена цель разделки степного мамонта охотнику");
                        }
                    });
                    return; // Выходим, не назначая обычную цель движения
                }
            }
        }
    }

    // Если не выбран человечек, а кто-то выбран — отправить их к точке
    if (selectedPeople.length > 0 && !clickedOnBuildingPanel) {
        // Назначаем цель всем выделенным персонажам с небольшим разбросом
        selectedPeople.forEach((personIdx, i) => {
            if (people[personIdx]) {
                // Добавляем небольшой разброс, чтобы персонажи не накладывались друг на друга
                const offset = 30; // Радиус разброса
                const angle = (i / selectedPeople.length) * Math.PI * 2;
                const offsetX = Math.cos(angle) * offset;
                const offsetY = Math.sin(angle) * offset;
                
                people[personIdx].target = { 
                    x: mx + offsetX, 
                    y: my + offsetY 
                };
            }
        });
        // НЕ сбрасываем выделение - оно остается активным
        return;
    }
    
    // Проверка клика по кусту (только если никто не выбран и не кликнули по человеку)
    for (let bush of bushes) {
        const distToBush = Math.sqrt((mx - bush.x) ** 2 + (my - bush.y) ** 2);
        if (distToBush < bush.r && bush.durability > 0) {
            showBushInfo = true;
            bushInfoTimer = 90; // Показать на 1.5 секунды (90 кадров при 60 FPS)
            break;
        }
    }
    
    // Сбрасываем выбранное здание при клике в пустое место
    selectedBuilding = null;
});

function updateSabertoothTigers() {
    const currentTime = Date.now();
    
    sabertoothTigers.forEach(tiger => {
        // Проверяем наличие факельщиков поблизости - они отпугивают тигров
        let nearestTorchbearer = null;
        let nearestTorchbearerDistance = Infinity;
        
        people.forEach(person => {
            if (person.type === 'torchbearer') {
                const distance = Math.sqrt((tiger.x - person.x) ** 2 + (tiger.y - person.y) ** 2);
                if (distance < person.scaringRange && distance < nearestTorchbearerDistance) {
                    nearestTorchbearer = person;
                    nearestTorchbearerDistance = distance;
                }
            }
        });
        
        // Если рядом есть факельщик - тигр убегает далеко
        if (nearestTorchbearer) {
            tiger.target = null; // Сбрасываем текущую цель
            
            // Убегаем от факельщика очень далеко и быстро
            const dx = tiger.x - nearestTorchbearer.x;
            const dy = tiger.y - nearestTorchbearer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Убегаем быстро и далеко пока не достигнем безопасного расстояния (350+ пикселей)
                if (distance < 350) {
                    tiger.x += (dx / distance) * tiger.speed * 3; // Очень быстро убегает
                    tiger.y += (dy / distance) * tiger.speed * 3;
                }
            }
            return; // Не обрабатываем другие действия если убегает
        }
        
        // Поиск ближайшей цели (любой персонаж)
        let closestTarget = null;
        let closestDistance = Infinity;
        
        people.forEach(person => {
            const distance = Math.sqrt((tiger.x - person.x) ** 2 + (tiger.y - person.y) ** 2);
            if (distance < tiger.detectionRange && distance < closestDistance) {
                closestTarget = person;
                closestDistance = distance;
            }
        });
        
        // Обновляем цель
        tiger.target = closestTarget;
        
        if (tiger.target && tiger.target.health > 0) {
            // Проверяем, что цель все еще существует в массиве people
            if (!people.includes(tiger.target)) {
                tiger.target = null;
                return;
            }
            // Движение к цели
            const dx = tiger.target.x - tiger.x;
            const dy = tiger.target.y - tiger.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > tiger.attackRange) {
                // Движение к цели
                const moveX = (dx / distance) * tiger.speed;
                const moveY = (dy / distance) * tiger.speed;
                
                tiger.x += moveX;
                tiger.y += moveY;
            } else {
                // Атака цели
                if (currentTime - tiger.lastAttack > 1500) { // Атака каждые 1.5 секунды
                    tiger.lastAttack = currentTime;
                    
                    // Нанести урон цели
                    if (tiger.target.health) {
                        tiger.target.health -= tiger.damage;
                        if (tiger.target.health <= 0) {
                            // Убить персонажа
                            const targetIndex = people.indexOf(tiger.target);
                            if (targetIndex > -1) {
                                people.splice(targetIndex, 1);
                                updateSelectedPeopleAfterRemoval(targetIndex);
                                tiger.target = null; // Очищаем цель после убийства
                            }
                        }
                    } else {
                        // Если у персонажа нет здоровья, просто убиваем его
                        const targetIndex = people.indexOf(tiger.target);
                        if (targetIndex > -1) {
                            people.splice(targetIndex, 1);
                            updateSelectedPeopleAfterRemoval(targetIndex);
                            tiger.target = null; // Очищаем цель после убийства
                        }
                    }
                }
            }
        } else {
            // Нет цели - патрулируем территорию
            // Инициализируем направление движения если его нет
            if (!tiger.wanderDirection) {
                tiger.wanderDirection = Math.random() * Math.PI * 2;
                tiger.wanderTimer = Math.random() * 120 + 60; // 1-3 секунды движения в одном направлении
            }
            
            // Движемся в случайном направлении
            if (tiger.wanderTimer > 0) {
                tiger.wanderTimer--;
                const moveX = Math.cos(tiger.wanderDirection) * (tiger.speed * 0.3); // Медленнее чем при охоте
                const moveY = Math.sin(tiger.wanderDirection) * (tiger.speed * 0.3);
                
                tiger.x += moveX;
                tiger.y += moveY;
            } else {
                // Меняем направление
                tiger.wanderDirection = Math.random() * Math.PI * 2;
                tiger.wanderTimer = Math.random() * 120 + 60;
            }
        }
        
        // Обновление кулдауна атаки
        if (tiger.attackCooldown > 0) {
            tiger.attackCooldown--;
        }
    });
}

function updateDeer() {
    deer.forEach(deerAnimal => {
        // Проверяем если олень мертв или не существует
        if (!deerAnimal || deerAnimal.health <= 0) {
            return;
        }
        
        // Поиск ближайшего человека для бегства
        let closestHuman = null;
        let closestDistance = Infinity;
        
        people.forEach(person => {
            const distance = Math.sqrt((deerAnimal.x - person.x) ** 2 + (deerAnimal.y - person.y) ** 2);
            if (distance < deerAnimal.detectionRange && distance < closestDistance) {
                closestHuman = person;
                closestDistance = distance;
            }
        });
        
        // Если видит человека - убегаем!
        if (closestHuman) {
            deerAnimal.fleeing = true;
            deerAnimal.fleeTarget = closestHuman;
            deerAnimal.grazing = false;
            
            // Направление от человека (убегаем в противоположную сторону)
            const dx = deerAnimal.x - closestHuman.x;
            const dy = deerAnimal.y - closestHuman.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Нормализуем направление и убегаем
                const fleeX = (dx / distance) * deerAnimal.speed;
                const fleeY = (dy / distance) * deerAnimal.speed;
                
                deerAnimal.x += fleeX;
                deerAnimal.y += fleeY;
            }
        } else {
            // Если никого нет - пасемся спокойно
            deerAnimal.fleeing = false;
            deerAnimal.fleeTarget = null;
            
            if (!deerAnimal.grazing) {
                deerAnimal.grazing = true;
                deerAnimal.grazingTimer = Math.random() * 300 + 60;
            }
            
            // Улучшенное групповое движение во время пастьбы
            if (deerAnimal.grazingTimer > 0) {
                deerAnimal.grazingTimer--;
                
                // Инициализируем направление движения если его нет
                if (!deerAnimal.wanderDirection) {
                    deerAnimal.wanderDirection = Math.random() * Math.PI * 2;
                    deerAnimal.wanderTimer = Math.random() * 180 + 60; // 1-4 секунды движения
                }
                
                // Стадное поведение - держимся рядом с другими оленями
                let groupCenterX = deerAnimal.x;
                let groupCenterY = deerAnimal.y;
                let nearbyDeer = 0;
                
                deer.forEach(otherDeer => {
                    if (otherDeer !== deerAnimal) {
                        const distance = Math.sqrt((deerAnimal.x - otherDeer.x) ** 2 + (deerAnimal.y - otherDeer.y) ** 2);
                        if (distance < 150) { // Радиус стада
                            groupCenterX += otherDeer.x;
                            groupCenterY += otherDeer.y;
                            nearbyDeer++;
                        }
                    }
                });
                
                if (nearbyDeer > 0) {
                    groupCenterX /= (nearbyDeer + 1);
                    groupCenterY /= (nearbyDeer + 1);
                    
                    // Слабое притяжение к центру группы
                    const toCenterX = groupCenterX - deerAnimal.x;
                    const toCenterY = groupCenterY - deerAnimal.y;
                    const toCenterDistance = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
                    
                    if (toCenterDistance > 80) { // Только если далеко от центра
                        deerAnimal.x += (toCenterX / toCenterDistance) * 0.2;
                        deerAnimal.y += (toCenterY / toCenterDistance) * 0.2;
                    }
                }
                
                // Случайное движение
                if (deerAnimal.wanderTimer > 0) {
                    deerAnimal.wanderTimer--;
                    const moveX = Math.cos(deerAnimal.wanderDirection) * 0.4; // Медленное движение
                    const moveY = Math.sin(deerAnimal.wanderDirection) * 0.4;
                    
                    deerAnimal.x += moveX;
                    deerAnimal.y += moveY;
                } else {
                    // Меняем направление
                    deerAnimal.wanderDirection = Math.random() * Math.PI * 2;
                    deerAnimal.wanderTimer = Math.random() * 180 + 60;
                }
            }
        }
    });
}

function updateMammoths() {
    const currentTime = Date.now();
    
    mammoths.forEach(mammoth => {
        // Проверяем если мамонт мертв
        if (!mammoth || mammoth.health <= 0) {
            return;
        }
        
        // Проверяем наличие факельщиков поблизости - они отпугивают мамонтов
        let nearestTorchbearer = null;
        let nearestTorchbearerDistance = Infinity;
        
        people.forEach(person => {
            if (person.type === 'torchbearer') {
                const distance = Math.sqrt((mammoth.x - person.x) ** 2 + (mammoth.y - person.y) ** 2);
                if (distance < person.scaringRange && distance < nearestTorchbearerDistance) {
                    nearestTorchbearer = person;
                    nearestTorchbearerDistance = distance;
                }
            }
        });
        
        // Если рядом есть факельщик - мамонт убегает далеко
        if (nearestTorchbearer) {
            mammoth.fleeing = true;
            mammoth.angry = false;
            
            // Убегаем от факельщика очень далеко и быстро
            const dx = mammoth.x - nearestTorchbearer.x;
            const dy = mammoth.y - nearestTorchbearer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Убегаем быстро и далеко пока не достигнем безопасного расстояния (300+ пикселей)
                if (distance < 300) {
                    mammoth.x += (dx / distance) * mammoth.speed * 3; // Очень быстро убегает
                    mammoth.y += (dy / distance) * mammoth.speed * 3;
                }
            }
            return; // Не обрабатываем другие действия если убегает
        }
        
        // Поиск ближайшего человека для определения угрозы
        let closestHuman = null;
        let closestDistance = Infinity;
        
        people.forEach(person => {
            const distance = Math.sqrt((mammoth.x - person.x) ** 2 + (mammoth.y - person.y) ** 2);
            if (distance < mammoth.detectionRange && distance < closestDistance) {
                closestHuman = person;
                closestDistance = distance;
            }
        });
        
        // Если человек очень близко - мамонт атакует
        if (closestHuman && closestDistance < 80) {
            mammoth.angry = true;
            mammoth.fleeing = false;
            
            // Движение к человеку для атаки
            const dx = closestHuman.x - mammoth.x;
            const dy = closestHuman.y - mammoth.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > mammoth.attackRange) {
                // Двигаемся к цели
                mammoth.x += (dx / distance) * mammoth.speed;
                mammoth.y += (dy / distance) * mammoth.speed;
            } else {
                // Атакуем
                if (currentTime - mammoth.lastAttack > 2000) { // Атака каждые 2 секунды
                    closestHuman.health -= mammoth.damage;
                    mammoth.lastAttack = currentTime;
                    
                    // Проверяем смерть человека
                    if (closestHuman.health <= 0) {
                        closestHuman.health = 0; // Фиксируем минимум на 0
                        // Удаляем мертвого человека из массива
                        const personIndex = people.indexOf(closestHuman);
                        if (personIndex > -1) {
                            people.splice(personIndex, 1);
                            // Также удаляем из выделенных, если был выделен
                            const selectedIndex = selectedPeople.indexOf(personIndex);
                            if (selectedIndex > -1) {
                                selectedPeople.splice(selectedIndex, 1);
                            }
                            // Корректируем индексы в selectedPeople
                            selectedPeople = selectedPeople.map(idx => idx > personIndex ? idx - 1 : idx);
                        }
                    }
                }
            }
        } 
        // Если человек на средней дистанции - мамонт убегает
        else if (closestHuman && closestDistance < 150) {
            mammoth.angry = false;
            mammoth.fleeing = true;
            
            // Убегаем от человека
            const dx = mammoth.x - closestHuman.x;
            const dy = mammoth.y - closestHuman.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const fleeX = (dx / distance) * mammoth.speed * 0.8;
                const fleeY = (dy / distance) * mammoth.speed * 0.8;
                mammoth.x += fleeX;
                mammoth.y += fleeY;
            }
        }
        // Если людей нет рядом - мирно пасется
        else {
            mammoth.angry = false;
            mammoth.fleeing = false;
            
            // Инициализируем направление движения если его нет
            if (!mammoth.wanderDirection) {
                mammoth.wanderDirection = Math.random() * Math.PI * 2;
                mammoth.wanderTimer = Math.random() * 240 + 120; // 2-6 секунд движения
                mammoth.pauseTimer = 0;
            }
            
            // Движение и остановки для пастьбы
            if (mammoth.pauseTimer > 0) {
                // Стоим на месте и пасемся
                mammoth.pauseTimer--;
            } else if (mammoth.wanderTimer > 0) {
                // Медленно движемся
                mammoth.wanderTimer--;
                const moveX = Math.cos(mammoth.wanderDirection) * (mammoth.speed * 0.4); // Медленное движение
                const moveY = Math.sin(mammoth.wanderDirection) * (mammoth.speed * 0.4);
                
                mammoth.x += moveX;
                mammoth.y += moveY;
            } else {
                // Либо меняем направление и продолжаем движение, либо останавливаемся
                if (Math.random() < 0.3) {
                    // Останавливаемся для пастьбы
                    mammoth.pauseTimer = Math.random() * 120 + 60; // 1-3 секунды остановки
                } else {
                    // Меняем направление
                    mammoth.wanderDirection = Math.random() * Math.PI * 2;
                    mammoth.wanderTimer = Math.random() * 240 + 120;
                }
            }
        }
    });
}

function updateSteppeMammoths() {
    const currentTime = Date.now();
    
    steppeMammoths.forEach((mammoth, index) => {
        // Проверяем если мамонт мертв
        if (!mammoth || mammoth.health <= 0) {
            return;
        }
        
        // Проверяем наличие факельщиков поблизости - они отпугивают мамонтов
        let nearestTorchbearer = null;
        let nearestTorchbearerDistance = Infinity;
        
        people.forEach(person => {
            if (person.type === 'torchbearer') {
                const distance = Math.sqrt((mammoth.x - person.x) ** 2 + (mammoth.y - person.y) ** 2);
                if (distance < person.scaringRange && distance < nearestTorchbearerDistance) {
                    nearestTorchbearer = person;
                    nearestTorchbearerDistance = distance;
                }
            }
        });
        
        // Если рядом есть факельщик - мамонт убегает далеко (но медленнее из-за размера)
        if (nearestTorchbearer) {
            mammoth.fleeing = true;
            mammoth.angry = false;
            
            // Убегаем от факельщика медленнее чем обычные мамонты
            const dx = mammoth.x - nearestTorchbearer.x;
            const dy = mammoth.y - nearestTorchbearer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                if (distance < 400) { // Больше дистанция страха
                    mammoth.x += (dx / distance) * mammoth.speed * 2; // Медленнее убегает
                    mammoth.y += (dy / distance) * mammoth.speed * 2;
                }
            }
            return;
        }
        
        // Поиск ближайшего человека для определения угрозы
        let closestHuman = null;
        let closestDistance = Infinity;
        
        people.forEach(person => {
            const distance = Math.sqrt((mammoth.x - person.x) ** 2 + (mammoth.y - person.y) ** 2);
            if (distance < mammoth.detectionRange && distance < closestDistance) {
                closestHuman = person;
                closestDistance = distance;
            }
        });
        
        // Степные мамонты более агрессивны и атакуют на большей дистанции
        if (closestHuman && closestDistance < 120) {
            mammoth.angry = true;
            mammoth.fleeing = false;
            
            // Движение к человеку для атаки
            const dx = closestHuman.x - mammoth.x;
            const dy = closestHuman.y - mammoth.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > mammoth.attackRange) {
                // Двигаемся к цели
                mammoth.x += (dx / distance) * mammoth.speed;
                mammoth.y += (dy / distance) * mammoth.speed;
            } else {
                // Атакуем с огромным уроном
                if (currentTime - mammoth.lastAttack > 1800) { // Атака каждые 1.8 секунд
                    closestHuman.health -= mammoth.damage;
                    mammoth.lastAttack = currentTime;
                    
                    // Проверяем смерть человека
                    if (closestHuman.health <= 0) {
                        closestHuman.health = 0;
                        const personIndex = people.indexOf(closestHuman);
                        if (personIndex > -1) {
                            people.splice(personIndex, 1);
                            const selectedIndex = selectedPeople.indexOf(personIndex);
                            if (selectedIndex > -1) {
                                selectedPeople.splice(selectedIndex, 1);
                            }
                            selectedPeople = selectedPeople.map(idx => idx > personIndex ? idx - 1 : idx);
                        }
                    }
                }
            }
        } 
        // Степные мамонты менее пугливы - убегают только на близкой дистанции
        else if (closestHuman && closestDistance < 80) {
            mammoth.angry = false;
            mammoth.fleeing = true;
            
            // Убегаем от человека
            const dx = mammoth.x - closestHuman.x;
            const dy = mammoth.y - closestHuman.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const fleeX = (dx / distance) * mammoth.speed * 0.6;
                const fleeY = (dy / distance) * mammoth.speed * 0.6;
                mammoth.x += fleeX;
                mammoth.y += fleeY;
            }
        }
        // Если людей нет рядом - мирно пасется
        else {
            mammoth.angry = false;
            mammoth.fleeing = false;
            
            // Инициализируем направление движения если его нет
            if (!mammoth.wanderDirection) {
                mammoth.wanderDirection = Math.random() * Math.PI * 2;
                mammoth.wanderTimer = Math.random() * 360 + 180; // Дольше движутся
                mammoth.pauseTimer = 0;
            }
            
            // Движение и остановки для пастьбы (дольше пасутся)
            if (mammoth.pauseTimer > 0) {
                mammoth.pauseTimer--;
            } else if (mammoth.wanderTimer > 0) {
                mammoth.wanderTimer--;
                const moveX = Math.cos(mammoth.wanderDirection) * (mammoth.speed * 0.3); // Еще медленнее
                const moveY = Math.sin(mammoth.wanderDirection) * (mammoth.speed * 0.3);
                
                mammoth.x += moveX;
                mammoth.y += moveY;
            } else {
                if (Math.random() < 0.4) { // Чаще останавливаются
                    mammoth.pauseTimer = Math.random() * 180 + 120; // Дольше пасутся
                } else {
                    mammoth.wanderDirection = Math.random() * Math.PI * 2;
                    mammoth.wanderTimer = Math.random() * 360 + 180;
                }
            }
        }
    });
}

function updateNeanderthals() {
    const currentTime = Date.now();
    
    neanderthals.forEach(neanderthal => {
        // Проверка валидности неандертальца
        if (!neanderthal || neanderthal.health <= 0) {
            return;
        }
        
        // Поиск ближайшей цели (любой персонаж - мирный житель или воин)
        let closestTarget = null;
        let closestDistance = Infinity;
        
        people.forEach(person => {
            if (person && person.health > 0) { // Только живые и валидные персонажи
                const distance = Math.sqrt((neanderthal.x - person.x) ** 2 + (neanderthal.y - person.y) ** 2);
                if (distance < neanderthal.detectionRange && distance < closestDistance) {
                    closestTarget = person;
                    closestDistance = distance;
                }
            }
        });
        
        // Обновляем цель
        neanderthal.target = closestTarget;
        
        if (neanderthal.target && neanderthal.target.health > 0) {
            // Проверяем, что цель все еще существует в массиве people
            if (!people.includes(neanderthal.target)) {
                neanderthal.target = null;
                return;
            }
            // Движение к цели
            const dx = neanderthal.target.x - neanderthal.x;
            const dy = neanderthal.target.y - neanderthal.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > neanderthal.attackRange) {
                // Движение к цели
                const moveX = (dx / distance) * neanderthal.speed;
                const moveY = (dy / distance) * neanderthal.speed;
                
                neanderthal.x += moveX;
                neanderthal.y += moveY;
            } else {
                // Атака цели
                if (currentTime - neanderthal.lastAttack > 1200) { // Атака каждые 1.2 секунды
                    neanderthal.lastAttack = currentTime;
                    
                    // Нанести урон цели
                    if (neanderthal.target.health) {
                        neanderthal.target.health -= neanderthal.damage;
                        if (neanderthal.target.health <= 0) {
                            // Убить персонажа
                            const targetIndex = people.indexOf(neanderthal.target);
                            if (targetIndex > -1) {
                                people.splice(targetIndex, 1);
                                updateSelectedPeopleAfterRemoval(targetIndex);
                                neanderthal.target = null; // Очищаем цель после убийства
                            }
                        }
                    } else {
                        // Если у персонажа нет здоровья, просто убиваем его
                        const targetIndex = people.indexOf(neanderthal.target);
                        if (targetIndex > -1) {
                            people.splice(targetIndex, 1);
                            updateSelectedPeopleAfterRemoval(targetIndex);
                            neanderthal.target = null; // Очищаем цель после убийства
                        }
                    }
                }
            }
        } else {
            // Если нет цели, патрулируем вокруг пещеры
            if (neanderthal.cave) {
                const distanceFromCave = Math.sqrt((neanderthal.x - neanderthal.cave.x) ** 2 + (neanderthal.y - neanderthal.cave.y) ** 2);
                
                if (distanceFromCave > 200) {
                    // Возвращаемся к пещере
                    const dx = neanderthal.cave.x - neanderthal.x;
                    const dy = neanderthal.cave.y - neanderthal.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const moveX = (dx / distance) * (neanderthal.speed * 0.5);
                    const moveY = (dy / distance) * (neanderthal.speed * 0.5);
                    
                    neanderthal.x += moveX;
                    neanderthal.y += moveY;
                } else {
                    // Патрулируем вокруг пещеры
                    // Инициализируем направление патрулирования если его нет
                    if (!neanderthal.patrolDirection) {
                        neanderthal.patrolDirection = Math.random() * Math.PI * 2;
                        neanderthal.patrolTimer = Math.random() * 180 + 120; // 2-5 секунд в одном направлении
                    }
                    
                    if (neanderthal.patrolTimer > 0) {
                        neanderthal.patrolTimer--;
                        
                        // Движемся по кругу вокруг пещеры
                        const patrolRadius = 150;
                        const currentAngle = Math.atan2(neanderthal.y - neanderthal.cave.y, neanderthal.x - neanderthal.cave.x);
                        const targetAngle = currentAngle + 0.02; // Медленно поворачиваем вокруг пещеры
                        
                        const targetX = neanderthal.cave.x + Math.cos(targetAngle) * patrolRadius;
                        const targetY = neanderthal.cave.y + Math.sin(targetAngle) * patrolRadius;
                        
                        const dx = targetX - neanderthal.x;
                        const dy = targetY - neanderthal.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 5) {
                            neanderthal.x += (dx / distance) * (neanderthal.speed * 0.3);
                            neanderthal.y += (dy / distance) * (neanderthal.speed * 0.3);
                        }
                    } else {
                        // Меняем направление патрулирования
                        neanderthal.patrolDirection = Math.random() * Math.PI * 2;
                        neanderthal.patrolTimer = Math.random() * 180 + 120;
                    }
                }
            }
        }
        
        // Обновление кулдауна атаки
        if (neanderthal.attackCooldown > 0) {
            neanderthal.attackCooldown--;
        }
    });
}


function saveGameState() {
    const gameData = {
        people: people,
        buildings: buildings,
        appleTrees: appleTrees,
        stones: stones,
        bushes: bushes,
        sabertoothTigers: sabertoothTigers,
        deer: deer,
        mammoths: mammoths,
        steppeMammoths: steppeMammoths,
        neanderthals: neanderthals,
        resources: resources,
        totalFoodCollected: totalFoodCollected,
        totalWoodCollected: totalWoodCollected,
        totalStoneCollected: totalStoneCollected,
        currentEra: currentEra,
        eras: eras,
        camera: camera,
        caves: caves,
        deerCarcasses: deerCarcasses,
        mammothCarcasses: mammothCarcasses,
        steppeMammothCarcasses: steppeMammothCarcasses,
        populationMessages: populationMessages,
        flyingSpears: flyingSpears,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('homoSapiensGameSave', JSON.stringify(gameData));
        console.log('Игра сохранена');
    } catch (error) {
        console.error('Ошибка при сохранении игры:', error);
    }
}

function loadGameState() {
    try {
        const savedData = localStorage.getItem('homoSapiensGameSave');
        if (!savedData) {
            return false;
        }
        
        const gameData = JSON.parse(savedData);
        
        // Загружаем все данные
        people = gameData.people || [];
        buildings = gameData.buildings || [];
        appleTrees = gameData.appleTrees || [];
        stones = gameData.stones || [];
        bushes = gameData.bushes || [];
        sabertoothTigers = gameData.sabertoothTigers || [];
        deer = gameData.deer || [];
        mammoths = gameData.mammoths || [];
        steppeMammoths = gameData.steppeMammoths || [];
        neanderthals = gameData.neanderthals || [];
        resources = gameData.resources || { food: 0, wood: 0, stone: 0 };
        totalFoodCollected = gameData.totalFoodCollected || 0;
        totalWoodCollected = gameData.totalWoodCollected || 0;
        totalStoneCollected = gameData.totalStoneCollected || 0;
        currentEra = gameData.currentEra || 'stone_age';
        if (gameData.eras) {
            eras.bone_age.unlocked = gameData.eras.bone_age.unlocked || false;
        }
        camera = gameData.camera || { x: 0, y: 0 };
        
        // Сброс дополнительных переменных состояния
        selectedPeople = [];
        selectedBuilding = null;
        buildingMode = false;
        buildingType = null;
        maxPopulation = 5;
        
        // Загружаем дополнительные массивы если они есть
        caves = gameData.caves || [];
        deerCarcasses = gameData.deerCarcasses || [];
        mammothCarcasses = gameData.mammothCarcasses || [];
        steppeMammothCarcasses = gameData.steppeMammothCarcasses || [];
        populationMessages = gameData.populationMessages || [];
        flyingSpears = gameData.flyingSpears || [];
        
        // Сброс автосохранения
        lastAutoSave = Date.now();
        
        console.log('Игра загружена');
        return true;
    } catch (error) {
        console.error('Ошибка при загрузке игры:', error);
        return false;
    }
}

function hasSavedGame() {
    const hasSave = localStorage.getItem('homoSapiensGameSave') !== null;
    console.log('Проверка наличия сохранения:', hasSave); // Отладочное сообщение
    return hasSave;
}

function generateInitialTrees() {
    // Генерируем деревья вокруг стартовой позиции (меньше, как в обычном мире)
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 600;
        const x = 400 + Math.cos(angle) * distance;
        const y = 350 + Math.sin(angle) * distance;
        
        appleTrees.push({
            x: x,
            y: y,
            food: 5,
            maxFood: 5,
            lastHarvest: 0,
            r: 45
        });
    }
}

function generateInitialStones() {
    // Генерируем камни вокруг стартовой позиции (меньше, как в обычном мире)
    for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 250 + Math.random() * 700;
        const x = 400 + Math.cos(angle) * distance;
        const y = 350 + Math.sin(angle) * distance;
        
        stones.push({
            x: x,
            y: y,
            amount: Math.floor(Math.random() * 3) + 2,
            size: Math.random() * 0.5 + 0.8,
            r: 25
        });
    }
}

function startNewGame() {
    // Останавливаем музыку главного меню
    if (mainMenuMusicPlaying && mainMenuMusicLoaded) {
        mainMenuMusic.pause();
        mainMenuMusic.currentTime = 0;
        mainMenuMusicPlaying = false;
        console.log('Main menu music stopped');
    }
    
    // Сброс всех игровых переменных к начальному состоянию
    people = [];
    selectedPeople = [];
    selectedBuilding = null;
    buildings = [];
    appleTrees = [];
    stones = [];
    bushes = [];
    sabertoothTigers = [];
    deer = [];
    mammoths = [];
    steppeMammoths = [];
    neanderthals = [];
    flyingSpears = [];
    caves = [];
    deerCarcasses = [];
    mammothCarcasses = [];
    steppeMammothCarcasses = [];
    populationMessages = [];
    
    // Сброс режимов и состояний
    buildingMode = false;
    buildingType = null;
    maxPopulation = 5;
    
    // Сброс ресурсов
    resources = {
        food: 0,
        wood: 0,
        stone: 0
    };
    
    // Сброс статистики
    totalFoodCollected = 0;
    totalWoodCollected = 0;
    totalStoneCollected = 0;
    
    // Сброс эпохи
    currentEra = 'stone_age';
    eras.bone_age.unlocked = false;
    
    // Сброс камеры
    camera = { x: 0, y: 0 };
    
    // Сброс автосохранения
    lastAutoSave = Date.now();
    
    // Генерация нового мира
    generateBushes();
    generateInitialTrees();
    generateInitialStones();
    
    // Добавляем стартовую хижину рода
    buildings.push({
        x: 400,
        y: 350,
        type: 'reproduction_house'
    });
    
    // Добавляем стартовых людей
    for (let i = 0; i < 5; i++) {
        people.push({
            x: 400 + (Math.random() - 0.5) * 100,
            y: 350 + (Math.random() - 0.5) * 100,
            target: null,
            hasAxe: false,
            choppingTimer: 0,
            currentBush: null,
            harvestingTreePos: null,
            harvestTimer: 0,
            statusDisplayTimer: 0,
            type: 'civilian',
            collectingStonePos: null,
            collectTimer: 0,
            lastAction: null,
            health: 100,
            maxHealth: 100,
            miningCave: null,
            miningTimer: 0
        });
    }
    
    gameState = 'playing';
}

function continueGame() {
    // Останавливаем музыку главного меню
    if (mainMenuMusicPlaying && mainMenuMusicLoaded) {
        mainMenuMusic.pause();
        mainMenuMusic.currentTime = 0;
        mainMenuMusicPlaying = false;
        console.log('Main menu music stopped');
    }
    
    console.log('Попытка загрузить сохранение...');
    if (loadGameState()) {
        console.log('Сохранение загружено успешно, переключаемся в игру');
        gameState = 'playing';
    } else {
        console.log('Сохранение не найдено или повреждено, запускаем новую игру');
        // Если нет сохранения, запускаем новую игру
        startNewGame();
    }
}

function drawPauseMenu() {
    // Полупрозрачный фон поверх игры
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Заголовок
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('ПАУЗА', canvas.width / 2, 150);
    
    // Кнопки
    const buttonWidth = 200;
    const buttonHeight = 50;
    const spacing = 70;
    const startY = 250;
    
    // Кнопка "Продолжить"
    const continueButtonX = canvas.width / 2 - buttonWidth / 2;
    const continueButtonY = startY;
    
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(continueButtonX, continueButtonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 3;
    ctx.strokeRect(continueButtonX, continueButtonY, buttonWidth, buttonHeight);
    
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('ПРОДОЛЖИТЬ', canvas.width / 2, continueButtonY + 32);
    
    // Кнопка "Сохранить"
    const saveButtonX = canvas.width / 2 - buttonWidth / 2;
    const saveButtonY = startY + spacing;
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(saveButtonX, saveButtonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#5dade2';
    ctx.lineWidth = 3;
    ctx.strokeRect(saveButtonX, saveButtonY, buttonWidth, buttonHeight);
    
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('СОХРАНИТЬ', canvas.width / 2, saveButtonY + 32);
    
    // Кнопка "В главное меню"
    const mainMenuButtonX = canvas.width / 2 - buttonWidth / 2;
    const mainMenuButtonY = startY + spacing * 2;
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(mainMenuButtonX, mainMenuButtonY, buttonWidth, buttonHeight);
    ctx.strokeStyle = '#ec7063';
    ctx.lineWidth = 3;
    ctx.strokeRect(mainMenuButtonX, mainMenuButtonY, buttonWidth, buttonHeight);
    
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('ГЛАВНОЕ МЕНЮ', canvas.width / 2, mainMenuButtonY + 32);
    
    // Инструкция
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('Нажмите Escape чтобы вернуться в игру', canvas.width / 2, mainMenuButtonY + 100);
    
    // Сохраняем координаты кнопок для обработки кликов
    window.pauseMenuButtons = {
        continue: {
            x: continueButtonX,
            y: continueButtonY,
            width: buttonWidth,
            height: buttonHeight
        },
        save: {
            x: saveButtonX,
            y: saveButtonY,
            width: buttonWidth,
            height: buttonHeight
        },
        mainMenu: {
            x: mainMenuButtonX,
            y: mainMenuButtonY,
            width: buttonWidth,
            height: buttonHeight
        }
    };
}

function drawMainMenu() {
    // Рисуем фоновое изображение или цветной фон
    if (mainMenuImageLoaded) {
        // Рисуем изображение на весь экран
        ctx.drawImage(mainMenuImage, 0, 0, canvas.width, canvas.height);
        
        // Добавляем полупрозрачный слой для лучшей читаемости текста
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Fallback - цветной фон если изображение не загружено
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Отладочное сообщение
        console.log('Main menu image not loaded, using fallback');
    }
    
    // Заголовок игры
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('HOMO SAPIENS', canvas.width / 2, 150);
    
    // Подзаголовок
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('Эволюция человечества', canvas.width / 2, 200);
    
    // Кнопка "Новая игра"
    const newGameButtonX = canvas.width / 2 - 100;
    const newGameButtonY = 300;
    const buttonWidth = 200;
    const buttonHeight = 50;
    
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(newGameButtonX, newGameButtonY, buttonWidth, buttonHeight);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('НОВАЯ ИГРА', canvas.width / 2, newGameButtonY + 32);
    
    // Кнопка "Продолжить" (если есть сохранение)
    const continueButtonX = canvas.width / 2 - 100;
    const continueButtonY = 380;
    const hasSave = hasSavedGame();
    
    ctx.fillStyle = hasSave ? '#3498db' : '#7f8c8d';
    ctx.fillRect(continueButtonX, continueButtonY, buttonWidth, buttonHeight);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = hasSave ? '#fff' : '#95a5a6';
    ctx.fillText('ПРОДОЛЖИТЬ', canvas.width / 2, continueButtonY + 32);
    
    // Кнопка переключения управления
    const controlButtonX = canvas.width / 2 - 75;
    const controlButtonY = 460;
    const controlButtonWidth = 150;
    const controlButtonHeight = 40;
    
    ctx.fillStyle = showMobileControls ? '#e67e22' : '#9b59b6';
    ctx.fillRect(controlButtonX, controlButtonY, controlButtonWidth, controlButtonHeight);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    const controlText = showMobileControls ? '📱 MOBILE' : '💻 LAPTOP';
    ctx.fillText(controlText, canvas.width / 2, controlButtonY + 26);
    
    // Инструкции
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff200ff';
    ctx.fillText('Управляйте племенем первобытных людей', canvas.width / 2, 540);
    ctx.fillText('Собирайте ресурсы, стройте жилища, развивайтесь!', canvas.width / 2, 560);
    
    // Уведомление о музыке (если она еще не включена)
    if (mainMenuMusicLoaded && !mainMenuMusicPlaying && !userHasInteracted) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#f39c12';
        ctx.fillText('🔊 Кликните в любом месте для включения музыки', canvas.width / 2, 585);
    }
    
    // Информация о текущем режиме управления
    ctx.font = '12px Arial';
    ctx.fillStyle = '#95a5a6';
    const controlsY = (mainMenuMusicLoaded && !mainMenuMusicPlaying && !userHasInteracted) ? 610 : 590;
    if (showMobileControls) {
        ctx.fillText('Включены виртуальные кнопки и джойстик', canvas.width / 2, controlsY);
        if (isMobile) {
            ctx.fillText('(автоопределение мобильного устройства)', canvas.width / 2, controlsY + 15);
        }
    } else {
        ctx.fillText('Используйте клавиатуру: WASD - движение, Space - атака, E - действие', canvas.width / 2, controlsY);
        if (!isMobile) {
            ctx.fillText('(автоопределение настольного устройства)', canvas.width / 2, controlsY + 15);
        }
    }
    
    // Сохраняем координаты кнопок для обработки кликов
    window.menuButtons = {
        newGame: {
            x: newGameButtonX,
            y: newGameButtonY,
            width: buttonWidth,
            height: buttonHeight
        },
        continue: {
            x: continueButtonX,
            y: continueButtonY,
            width: buttonWidth,
            height: buttonHeight
        },
        controlMode: {
            x: controlButtonX,
            y: controlButtonY,
            width: controlButtonWidth,
            height: controlButtonHeight
        }
    };
}

function gameLoop() {
    try {
        if (gameState === 'menu') {
            // Простая попытка запуска музыки если пользователь взаимодействовал
            if (userHasInteracted && mainMenuMusicLoaded && !mainMenuMusicPlaying) {
                tryPlayMainMenuMusic();
            }
            drawMainMenu();
        } else if (gameState === 'playing') {
            // Останавливаем музыку главного меню во время игры
            if (mainMenuMusicPlaying) {
                mainMenuMusic.pause();
                mainMenuMusicPlaying = false;
                console.log('Main menu music stopped during gameplay');
            }
            
            updatePeople();
            updateFlyingSpears(); // Обновляем летящие копья
            updateSabertoothTigers();
            updateDeer();
            updateMammoths();
            updateSteppeMammoths(); // Обновляем степных мамонтов
            updateNeanderthals();
            updateCamera();
            
            // Обновляем звук рубки дерева
            updateWoodSound();
            
            // Обновляем звук добычи камня
            updateStoneSound();
        
        // Обновление таймера информации о кусте
        if (bushInfoTimer > 0) {
            bushInfoTimer--;
            if (bushInfoTimer === 0) {
                showBushInfo = false;
            }
        }
        
        // Автосохранение
        const currentTime = Date.now();
        if (currentTime - lastAutoSave > autoSaveInterval) {
            console.log('Автосохранение...'); // Отладочное сообщение
            saveGameState();
            lastAutoSave = currentTime;
        }
        
        draw();
    } else if (gameState === 'paused') {
        // В режиме паузы сначала рисуем игру, потом меню поверх
        draw();
        drawPauseMenu();
    }
    } catch (error) {
        console.error('Error in gameLoop:', error);
        // Продолжаем работу, чтобы игра не зависла
    }
    requestAnimationFrame(gameLoop);
}

// Обработчик клавиш для сохранения игры
document.addEventListener('keydown', function(e) {
    // Обрабатываем первое взаимодействие пользователя
    handleFirstInteraction();
    
    if (gameState === 'playing') {
        // Сохранение по Ctrl+S или F5
        if ((e.ctrlKey && e.key === 's') || e.key === 'F5') {
            e.preventDefault();
            saveGameState();
            console.log('Игра сохранена вручную');
        }
        // Пауза по Escape
        if (e.key === 'Escape') {
            gameState = 'paused';
        }
    } else if (gameState === 'paused') {
        // Возврат в игру по Escape
        if (e.key === 'Escape') {
            gameState = 'playing';
        }
    }
});

// Функции для мобильного управления
function drawMobileControls() {
    if (!showMobileControls || gameState !== 'playing') return;
    
    drawMobileButtons(); // Только кнопки, джойстика больше нет
}

function drawMobileButtons() {
    const buttons = mobileControls.buttons;
    
    ctx.save();
    
    // Кнопка меню
    if (buttons.menu.visible) {
        ctx.globalAlpha = buttons.menu.pressed ? 0.9 : 0.7;
        ctx.fillStyle = '#4444ff';
        
        // Рисуем прямоугольную кнопку
        ctx.fillRect(buttons.menu.x, buttons.menu.y, buttons.menu.width, buttons.menu.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttons.menu.x, buttons.menu.y, buttons.menu.width, buttons.menu.height);
        
        // Иконка меню (три линии)
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☰', buttons.menu.x + buttons.menu.width/2, buttons.menu.y + buttons.menu.height/2);
    }
    
    ctx.restore();
}

// Обработчики touch событий для мобильного управления
function handleTouchStart(e) {
    e.preventDefault();
    
    // Обрабатываем первое взаимодействие пользователя
    handleFirstInteraction();
    
    // В главном меню обрабатываем touch события всегда (для кнопок меню)
    if (gameState === 'menu') {
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Обрабатываем как обычный клик мыши
        handleMenuClick(x, y);
        return;
    }
    
    // В меню паузы также обрабатываем touch события
    if (gameState === 'paused') {
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Обрабатываем как обычный клик мыши
        handlePauseMenuClick(x, y);
        return;
    }
    
    // Во время игры обрабатываем касания
    if (gameState !== 'playing') return;
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Если включен мобильный режим - проверяем только кнопку меню
        if (showMobileControls) {
            const menuButton = mobileControls.buttons.menu;
            // Проверяем прямоугольную область кнопки меню
            if (x >= menuButton.x && x <= menuButton.x + menuButton.width &&
                y >= menuButton.y && y <= menuButton.y + menuButton.height) {
                menuButton.pressed = true;
                mobileControls.touches.set(touch.identifier, { type: 'button', name: 'menu' });
                handleMobileButtonPress('menu');
                continue;
            }
        }
        
        // Регистрируем касание для последующей обработки в handleTouchEnd
        mobileControls.touches.set(touch.identifier, { 
            type: 'tap', 
            x: x, 
            y: y,
            startTime: Date.now()
        });
        
        // Если касание не попало на кнопку меню, обрабатываем как игровое взаимодействие
        handleGameTouch(x, y);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    // В мобильном режиме больше нет джойстика для обработки движений
}

function handleGameTouch(x, y) {
    // ===== ПРОВЕРКА КЛИКОВ ПО UI ЭЛЕМЕНТАМ (ПРИОРИТЕТ) =====
    
    // Проверяем клик по кнопке "Выделить всё" (для мобильных) - высший приоритет
    if (window.selectAllButton) {
        const btn = window.selectAllButton;
        console.log('Touch - Проверяем кнопку "Выделить всё":', {
            x, y, 
            btnX: btn.x, btnY: btn.y, 
            btnWidth: btn.width, btnHeight: btn.height,
            inX: x >= btn.x && x <= btn.x + btn.width,
            inY: y >= btn.y && y <= btn.y + btn.height,
            allSelected: btn.allSelected,
            currentSelected: selectedPeople.length
        });
        
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height) {
            
            console.log('Touch - КЛИК ПО КНОПКЕ "Выделить всё"!');
            
            if (btn.allSelected) {
                // Снимаем выделение со всех
                selectedPeople = [];
                console.log('Touch - Снято выделение со всех юнитов');
            } else {
                // Выделяем всех юнитов
                selectedPeople = people.map((_, idx) => idx);
                console.log('Touch - Выделены все юниты:', selectedPeople.length);
            }
            
            // Очищаем кнопки найма при изменении выделения
            window.reproductionHouseHireButton = null;
            window.reproductionHouseHunterButton = null;
            window.reproductionHouseTechButton = null;
            window.warriorCampHireButton = null;
            window.bonfireHireTorchbearerButton = null;
            
            return;
        }
    }
    
    // Проверяем клик по кнопке "ОТКРЫТЬ" (для мобильных) - высший приоритет
    if (window.openBuildingModalButton) {
        const btn = window.openBuildingModalButton;
        console.log('Touch - Проверяем клик по кнопке ОТКРЫТЬ:', {
            x, y, 
            btnX: btn.x, btnY: btn.y, 
            btnWidth: btn.width, btnHeight: btn.height,
            inX: x >= btn.x && x <= btn.x + btn.width,
            inY: y >= btn.y && y <= btn.y + btn.height
        });
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height) {
            console.log('Touch - Клик по кнопке ОТКРЫТЬ! Открываем модальное окно');
            showBuildingModal = true;
            return;
        }
    }
    
    // Проверяем клики по кнопкам закрытия модальных окон зданий
    if (window.reproductionHouseCloseButton) {
        const btn = window.reproductionHouseCloseButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height) {
            selectedBuilding = null;
            console.log('Touch - Закрыта панель хижины рода');
            return;
        }
    }
    
    if (window.warriorCampCloseButton) {
        const btn = window.warriorCampCloseButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height) {
            selectedBuilding = null;
            console.log('Touch - Закрыта панель лагеря воинов');
            return;
        }
    }
    
    if (window.bonfireCloseButton) {
        const btn = window.bonfireCloseButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height) {
            selectedBuilding = null;
            console.log('Touch - Закрыта панель костра');
            return;
        }
    }
    
    // ===== КНОПКИ ЗДАНИЙ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ =====
    
    // Проверяем клик на кнопку найма в интерфейсе хижины рода
    if (window.reproductionHouseHireButton) {
        const btn = window.reproductionHouseHireButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом
            if (people.length < maxPopulation && resources.food >= 5) {
                // Нанимаем нового человека рядом с хижиной рода
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'civilian',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 100,
                    maxHealth: 100,
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.food -= 5;
                selectedBuilding = null; // Закрываем панель после найма
                console.log('Touch - Нанят гражданский');
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма охотника в интерфейсе хижины рода
    if (window.reproductionHouseHunterButton) {
        const btn = window.reproductionHouseHunterButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом охотника
            if (people.length < maxPopulation && resources.wood >= 5 && resources.food >= 3) {
                // Нанимаем нового охотника рядом с хижиной рода
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'hunter',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 120,
                    maxHealth: 120,
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 200,
                    attackRange: 60,
                    damage: 40,
                    lastAttack: 0,
                    speed: 3.0
                });
                
                resources.wood -= 5;
                resources.food -= 3;
                selectedBuilding = null; // Закрываем панель после найма
                console.log('Touch - Нанят охотник');
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку технологии в интерфейсе хижины рода
    if (window.reproductionHouseTechButton) {
        const btn = window.reproductionHouseTechButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height && btn.canResearch) {
            
            // Дополнительная проверка ресурсов перед изучением технологии
            if (resources.food >= 200 && currentEra === 'stone_age') {
                // Тратим пищу и открываем новокаменный век
                resources.food -= 200;
                currentEra = 'bone_age';
                eras.bone_age.unlocked = true;
                
                // Добавляем уведомление об открытии новой эпохи
                eraNotifications.push({
                    message: `🌾 Новокаменный век открыт!`,
                    timer: 3000,
                    y: canvas.height / 2 - 60
                });
                
                selectedBuilding = null; // Закрываем панель после изучения
                console.log('Touch - Изучена технология');
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма в интерфейсе лагеря воинов
    if (window.warriorCampHireButton) {
        const btn = window.warriorCampHireButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом
            if (people.length < maxPopulation && resources.wood >= 10 && resources.food >= 3) {
                // Нанимаем нового воина рядом с лагерем воинов
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'warrior',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 120,
                    maxHealth: 120,
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 220,
                    attackRange: 45,
                    damage: 35,
                    lastAttack: 0,
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.wood -= 10;
                resources.food -= 3;
                selectedBuilding = null; // Закрываем панель после найма
                console.log('Touch - Нанят воин');
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма метателя копья в интерфейсе лагеря воинов
    if (window.warriorCampHireSpearmanButton) {
        const btn = window.warriorCampHireSpearmanButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом
            if (people.length < maxPopulation && resources.wood >= 15 && resources.food >= 5 && currentEra === 'bone_age') {
                // Нанимаем нового метателя копья рядом с лагерем воинов
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'spearman',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 110,
                    maxHealth: 110,
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 250,
                    attackRange: 80,
                    damage: 50,
                    lastAttack: 0,
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.wood -= 15;
                resources.food -= 5;
                selectedBuilding = null; // Закрываем панель после найма
                console.log('Touch - Нанят метатель копья');
            }
            return;
        }
    }
    
    // Проверяем клик на кнопку найма факельщика в интерфейсе костра
    if (window.bonfireHireTorchbearerButton) {
        const btn = window.bonfireHireTorchbearerButton;
        if (x >= btn.x && x <= btn.x + btn.width && 
            y >= btn.y && y <= btn.y + btn.height && btn.canHire) {
            
            // Дополнительная проверка ресурсов перед наймом
            if (people.length < maxPopulation && resources.wood >= 8 && resources.food >= 4 && currentEra === 'bone_age') {
                // Нанимаем нового факельщика рядом с костром
                const startX = selectedBuilding.x + (Math.random() - 0.5) * 80;
                const startY = selectedBuilding.y + (Math.random() - 0.5) * 80;
                
                people.push({
                    x: startX,
                    y: startY,
                    target: null,
                    hasAxe: false,
                    choppingTimer: 0,
                    currentBush: null,
                    harvestingTreePos: null,
                    harvestTimer: 0,
                    statusDisplayTimer: 0,
                    type: 'torchbearer',
                    collectingStonePos: null,
                    collectTimer: 0,
                    lastAction: null,
                    health: 90,
                    maxHealth: 90,
                    combatTarget: null,
                    attackCooldown: 0,
                    detectionRange: 180,
                    attackRange: 50,
                    damage: 25,
                    lastAttack: 0,
                    miningCave: null,
                    miningTimer: 0
                });
                
                resources.wood -= 8;
                resources.food -= 4;
                selectedBuilding = null; // Закрываем панель после найма
                console.log('Touch - Нанят факельщик');
            }
            return;
        }
    }
    
    // Проверяем клики по модальному окну зданий
    if (showBuildingModal) {
        // Проверяем клик на кнопку закрытия модального окна
        if (window.buildingModalCloseButton) {
            const btn = window.buildingModalCloseButton;
            if (x >= btn.x && x <= btn.x + btn.width && 
                y >= btn.y && y <= btn.y + btn.height) {
                showBuildingModal = false;
                return;
            }
        }
        
        // Проверяем клики на здания в модальном окне
        if (window.buildingModalButtons) {
            for (const btn of window.buildingModalButtons) {
                if (x >= btn.x && x <= btn.x + btn.width && 
                    y >= btn.y && y <= btn.y + btn.height) {
                    // Активируем режим строительства выбранного здания
                    buildingMode = true;
                    buildingType = btn.type;
                    showBuildingModal = false; // Закрываем модальное окно
                    console.log('Touch - Выбрано здание для строительства:', btn.type, 'buildingMode:', buildingMode);
                    return;
                }
            }
        }
        
        // Если клик был внутри модального окна, не обрабатываем дальше
        return;
    }
    
    // Эта функция обрабатывает касания игрового поля как клики мышью
    // Конвертируем экранные координаты в мировые
    const worldX = (x - canvas.width/2) + camera.x + canvas.width/2;
    const worldY = (y - canvas.height/2) + camera.y + canvas.height/2;
    
    // Проверяем клики по панели населения (как в обработчике мыши)
    let clickedOnUI = false;
    people.forEach((p, idx) => {
        if (p.uiX && x >= p.uiX && x <= p.uiX + p.uiWidth && 
            y >= p.uiY && y <= p.uiY + p.uiHeight) {
            
            // На мобиле тап по персонажу переключает его выделение
            if (selectedPeople.includes(idx)) {
                // Убираем персонажа из выделения
                selectedPeople = selectedPeople.filter(i => i !== idx);
                console.log(`Touch - Снято выделение с персонажа ${idx}. Остались выделенными:`, selectedPeople);
            } else {
                // Добавляем персонажа к выделению
                selectedPeople.push(idx);
                console.log(`Touch - Добавлен к выделению персонаж ${idx}. Теперь выделены:`, selectedPeople);
            }
            
            // Обновляем звук рубки после изменения выделения
            updateWoodSound();
            updateStoneSound();
            
            buildingMode = false;
            buildingType = null;
            
            // Очищаем кнопки найма при изменении выделения
            window.reproductionHouseHireButton = null;
            window.reproductionHouseHunterButton = null;
            window.reproductionHouseTechButton = null;
            window.warriorCampHireButton = null;
            window.bonfireHireTorchbearerButton = null;
            
            clickedOnUI = true;
            return;
        }
    });
    
    if (clickedOnUI) return;
    
    // ===== ЛОГИКА СТРОИТЕЛЬСТВА =====
    // Если в режиме строительства, строим здание
    const hasBuilders = people.some(p => p.type === 'builder' || p.type === 'civilian');
    console.log('Touch - Проверка строительства:', {
        buildingMode, 
        buildingType, 
        hasBuilders, 
        peopleCount: people.length,
        peopleTypes: people.map(p => p.type)
    });
    
    if (buildingMode && buildingType && hasBuilders) {
        if (buildingType === 'house' && resources.wood >= 10) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((worldX - building.x) ** 2 + (worldY - building.y) ** 2);
                if (distance < 100) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((worldX - 400) ** 2 + (worldY - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим жилище
                buildings.push({
                    x: worldX,
                    y: worldY,
                    type: 'house'
                });
                resources.wood -= 10;
                
                // Увеличиваем максимальное население на 5 за каждый шалаш
                maxPopulation += 5;
                
                buildingMode = false;
                buildingType = null;
                console.log('Touch - Построено жилище');
                return;
            }
        } else if (buildingType === 'reproduction_house' && resources.wood >= 15 && resources.stone >= 5) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((worldX - building.x) ** 2 + (worldY - building.y) ** 2);
                if (distance < 100) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((worldX - 400) ** 2 + (worldY - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим хижину рода
                buildings.push({
                    x: worldX,
                    y: worldY,
                    type: 'reproduction_house'
                });
                resources.wood -= 15;
                resources.stone -= 5;
                
                buildingMode = false;
                buildingType = null;
                console.log('Touch - Построена хижина рода');
                return;
            }
        } else if (buildingType === 'warrior_camp' && resources.wood >= 20 && resources.stone >= 10) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((worldX - building.x) ** 2 + (worldY - building.y) ** 2);
                if (distance < 100) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((worldX - 400) ** 2 + (worldY - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим лагерь воинов
                buildings.push({
                    x: worldX,
                    y: worldY,
                    type: 'warrior_camp'
                });
                resources.wood -= 20;
                resources.stone -= 10;
                
                buildingMode = false;
                buildingType = null;
                console.log('Touch - Построен лагерь воинов');
                return;
            }
        } else if (buildingType === 'bonfire' && resources.wood >= 5) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((worldX - building.x) ** 2 + (worldY - building.y) ** 2);
                if (distance < 100) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((worldX - 400) ** 2 + (worldY - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим костер
                buildings.push({
                    x: worldX,
                    y: worldY,
                    type: 'bonfire'
                });
                resources.wood -= 5;
                
                buildingMode = false;
                buildingType = null;
                console.log('Touch - Построен костер');
                return;
            }
        } else if (buildingType === 'farm' && resources.wood >= 15 && resources.stone >= 5) {
            // Проверяем, не слишком ли близко к другим зданиям
            let canBuild = true;
            buildings.forEach(building => {
                const distance = Math.sqrt((worldX - building.x) ** 2 + (worldY - building.y) ** 2);
                if (distance < 100) {
                    canBuild = false;
                }
            });
            
            // Проверяем расстояние до шалаша
            const distanceToHut = Math.sqrt((worldX - 400) ** 2 + (worldY - 350) ** 2);
            if (distanceToHut < 100) {
                canBuild = false;
            }
            
            if (canBuild) {
                // Строим ферму
                buildings.push({
                    x: worldX,
                    y: worldY,
                    type: 'farm'
                });
                resources.wood -= 15;
                resources.stone -= 5;
                
                buildingMode = false;
                buildingType = null;
                console.log('Touch - Построена ферма');
                return;
            }
        }
        
        // Если в режиме строительства но не удалось построить - просто возвращаемся
        console.log('Touch - Не удалось построить:', buildingType, 'Ресурсы:', resources);
        return;
    }
    
    // Если НЕ в режиме строительства, продолжаем обычную логику
    if (buildingMode && buildingType) {
        console.log('Touch - В режиме строительства, но нет строителей. Возвращаемся.');
        return;
    }
    
    // Проверяем выбор человечка на карте
    let found = false;
    for (let i = people.length - 1; i >= 0; i--) {
        const person = people[i];
        const dist = Math.sqrt((worldX - person.x) ** 2 + (worldY - person.y) ** 2);
        if (dist < 25) {
            selectedPeople = [i];
            // Обновляем звук рубки после изменения выделения
            updateWoodSound();
            updateStoneSound();
            found = true;
            break;
        }
    }
    
    if (found) {
        buildingMode = false;
        buildingType = null;
        window.reproductionHouseHireButton = null;
        window.reproductionHouseHunterButton = null;
        window.reproductionHouseTechButton = null;
        window.warriorCampHireButton = null;
        window.bonfireHireTorchbearerButton = null;
        return;
    }
    
    // Проверяем тап на здания (для открытия модалок зданий)
    buildings.forEach(building => {
        const distanceToBuilding = Math.sqrt((worldX - building.x) ** 2 + (worldY - building.y) ** 2);
        if (distanceToBuilding < 60) { // Область тапа по зданию
            selectedBuilding = building;
            buildingMode = false;
            buildingType = null;
            found = true;
            console.log('Touch - Выбрано здание:', building.type);
            
            // Специальная обработка для фермы - назначаем работников
            if (building.type === 'farm' && selectedPeople.length > 0) {
                selectedPeople.forEach(personIdx => {
                    const person = people[personIdx];
                    if (person && person.type === 'civilian' && !person.farmWork) {
                        // Назначаем мирного жителя работать на ферму
                        if (building.workers.length < 3) { // Максимум 3 работника на ферму
                            building.workers.push(person);
                            person.farmWork = building;
                            person.target = { x: building.x + (Math.random() - 0.5) * 160, y: building.y + 60 };
                            person.lastAction = 'Идет работать на ферму';
                            person.statusDisplayTimer = 120;
                            console.log("Touch - Работник назначен на ферму");
                        }
                    }
                });
            }
            return; // Важно: выходим из функции после выбора здания
        }
    });
    
    // Если здание было выбрано, не продолжаем дальше
    if (found) return;
    
    // Если есть выбранные персонажи - отправляем их к точке касания
    if (selectedPeople.length > 0) {
        // Проверяем атаку на неандертальцев
        for (let neanderthal of neanderthals) {
            const distToNeanderthal = Math.sqrt((worldX - neanderthal.x) ** 2 + (worldY - neanderthal.y) ** 2);
            if (distToNeanderthal < 40) {
                selectedPeople.forEach(personIdx => {
                    if (people[personIdx]) {
                        people[personIdx].combatTarget = neanderthal;
                        people[personIdx].target = { x: neanderthal.x, y: neanderthal.y };
                    }
                });
                return;
            }
        }
        
        // Проверяем атаку на мамонтов
        for (let mammoth of mammoths) {
            const distToMammoth = Math.sqrt((worldX - mammoth.x) ** 2 + (worldY - mammoth.y) ** 2);
            if (distToMammoth < 50) {
                selectedPeople.forEach(personIdx => {
                    if (people[personIdx] && people[personIdx].type === 'hunter') {
                        people[personIdx].huntTarget = mammoth;
                        people[personIdx].target = { x: mammoth.x, y: mammoth.y };
                        people[personIdx].butcherTarget = null;
                    }
                });
                return;
            }
        }
        
        // Проверяем атаку на степных мамонтов
        for (let steppeMammoth of steppeMammoths) {
            const distToSteppeMammoth = Math.sqrt((worldX - steppeMammoth.x) ** 2 + (worldY - steppeMammoth.y) ** 2);
            if (distToSteppeMammoth < 60) {
                selectedPeople.forEach(personIdx => {
                    if (people[personIdx] && people[personIdx].type === 'hunter') {
                        people[personIdx].huntTarget = steppeMammoth;
                        people[personIdx].target = { x: steppeMammoth.x, y: steppeMammoth.y };
                        people[personIdx].butcherTarget = null;
                    }
                });
                return;
            }
        }
        
        // Проверяем клик на тушу мамонта для разделки
        for (let carcass of mammothCarcasses) {
            const distToCarcass = Math.sqrt((worldX - carcass.x) ** 2 + (worldY - carcass.y) ** 2);
            if (distToCarcass < 50 && carcass.food > 0) {
                selectedPeople.forEach(personIdx => {
                    if (people[personIdx] && people[personIdx].type === 'hunter') {
                        people[personIdx].butcherTarget = carcass;
                        people[personIdx].target = { x: carcass.x, y: carcass.y };
                        people[personIdx].huntTarget = null;
                    }
                });
                return;
            }
        }
        
        // Проверяем клик на тушу степного мамонта для разделки
        for (let carcass of steppeMammothCarcasses) {
            const distToCarcass = Math.sqrt((worldX - carcass.x) ** 2 + (worldY - carcass.y) ** 2);
            if (distToCarcass < 70 && carcass.food > 0) {
                selectedPeople.forEach(personIdx => {
                    if (people[personIdx] && people[personIdx].type === 'hunter') {
                        people[personIdx].butcherTarget = carcass;
                        people[personIdx].target = { x: carcass.x, y: carcass.y };
                        people[personIdx].huntTarget = null;
                    }
                });
                return;
            }
        }
        
        // Обычное движение - назначаем цель всем выделенным персонажам с разбросом
        selectedPeople.forEach((personIdx, i) => {
            if (people[personIdx]) {
                const offset = 30;
                const angle = (i / selectedPeople.length) * Math.PI * 2;
                const offsetX = Math.cos(angle) * offset;
                const offsetY = Math.sin(angle) * offset;
                
                people[personIdx].target = { 
                    x: worldX + offsetX, 
                    y: worldY + offsetY 
                };
            }
        });
        return;
    }
    
    // Сбрасываем выбранное здание при клике в пустое место
    selectedBuilding = null;
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    // В меню не обрабатываем окончания касаний
    if (gameState === 'menu' || gameState === 'paused') return;
    
    if (gameState !== 'playing' || !showMobileControls) return;
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const touchData = mobileControls.touches.get(touch.identifier);
        
        if (touchData && touchData.type === 'button') {
            mobileControls.buttons[touchData.name].pressed = false;
            mobileControls.touches.delete(touch.identifier);
        } else if (touchData && touchData.type === 'tap') {
            // Тап уже обработан в handleGameTouch, просто очищаем данные касания
            mobileControls.touches.delete(touch.identifier);
        }
    }
}

function handleMobileButtonPress(buttonName) {
    switch (buttonName) {
        case 'menu':
            // Имитируем нажатие Escape для меню
            simulateKeyPress('Escape');
            break;
    }
}

function simulateKeyPress(key) {
    const event = new KeyboardEvent('keydown', {
        key: key,
        code: key === 'Escape' ? 'Escape' : key,
        which: key === 'Escape' ? 27 : key.charCodeAt(0),
        keyCode: key === 'Escape' ? 27 : key.charCodeAt(0)
    });
    document.dispatchEvent(event);
}

// Добавляем обработчики событий
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

// Запуск игры после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting game loop');
    gameLoop();
    
    // Проверяем поддержку автозапуска
    checkAutoplaySupport();
    
    // Пытаемся запустить музыку через небольшую задержку
    setTimeout(() => {
        if (gameState === 'menu' && !mainMenuMusicPlaying) {
            console.log('🎵 Attempting autoplay after DOM load...');
            tryPlayMainMenuMusic();
        }
    }, 500);
});

// Если DOM уже загружен (на случай поздней загрузки скрипта)
if (document.readyState === 'loading') {
    // DOM еще загружается, ждем события DOMContentLoaded
} else {
    // DOM уже загружен, запускаем сразу
    console.log('DOM already loaded, starting game loop immediately');
    gameLoop();
    
    // Проверяем поддержку автозапуска
    checkAutoplaySupport();
    
    // Пытаемся запустить музыку через небольшую задержку
    setTimeout(() => {
        if (gameState === 'menu' && !mainMenuMusicPlaying) {
            console.log('🎵 Attempting autoplay after immediate start...');
            tryPlayMainMenuMusic();
        }
    }, 500);
}

