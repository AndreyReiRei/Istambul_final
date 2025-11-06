// Ленивая загрузка изображений
class LazyLoadManager {
	constructor() {
		this.images = document.querySelectorAll('.lazy-image');
		this.observer = null;
		this.init();
	}

	init() {
		if ('IntersectionObserver' in window) {
			this.setupIntersectionObserver();
		} else {
			// Fallback для старых браузеров
			this.loadAllImages();
		}
	}

	setupIntersectionObserver() {
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					this.loadImage(entry.target);
					this.observer.unobserve(entry.target);
				}
			});
		}, {
			rootMargin: '50px 0px',
			threshold: 0.1
		});

		this.images.forEach(img => this.observer.observe(img));
	}

	loadImage(img) {
		const src = img.getAttribute('data-src');

		if (!src) return;

		const tempImage = new Image();

		tempImage.onload = () => {
			img.src = src;
			img.classList.add('loaded');
			img.removeAttribute('data-src');
		};

		tempImage.onerror = () => {
			console.error('Ошибка загрузки изображения:', src);
			img.classList.add('error');
		};

		tempImage.src = src;
	}

	loadAllImages() {
		this.images.forEach(img => this.loadImage(img));
	}
}

// Глобальные переменные для отслеживания состояния модального окна
let currentGallery = null;
let currentMediaIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
	// Инициализация ленивой загрузки изображений
	const lazyLoader = new LazyLoadManager();

	// Инициализация анимации частиц
	initParticleAnimation();

	// Инициализация всех галерей
	initGalleries();

	// Инициализация модального окна
	initModal();

	// Инициализация анимаций при скролле
	initScrollAnimations();
});

// Анимация частиц
function initParticleAnimation() {
	const container = document.getElementById('background-animation');
	if (!container) return;

	let particles = [];

	// Цвета для частиц (теплые, солнечные тона)
	const colors = [
		'#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500',
		'#FFEC8B', '#FFFACD', '#FFFFE0', '#FAFAD2', '#EEE8AA'
	];

	// Настройки анимации
	const settings = {
		particleCount: 80,
		particleSize: { min: 2, max: 8 },
		speed: { min: 0.3, max: 1.2 },
		mouseDist: 120,
		twinkleChance: 0.3 // 30% частиц будут мерцать
	};

	// Создание частицы
	class Particle {
		constructor() {
			this.size = Math.random() * (settings.particleSize.max - settings.particleSize.min) + settings.particleSize.min;
			this.x = Math.random() * (window.innerWidth - this.size * 2) + this.size;
			this.y = Math.random() * (window.innerHeight - this.size * 2) + this.size;
			this.speedX = Math.random() * (settings.speed.max - settings.speed.min) + settings.speed.min;
			this.speedY = Math.random() * (settings.speed.max - settings.speed.min) + settings.speed.min;
			this.directionX = Math.random() > 0.5 ? 1 : -1;
			this.directionY = Math.random() > 0.5 ? 1 : -1;
			this.color = colors[Math.floor(Math.random() * colors.length)];
			this.element = null;
			this.willTwinkle = Math.random() < settings.twinkleChance;
			this.create();
		}

		// Создание DOM-элемента для частицы
		create() {
			this.element = document.createElement('div');
			this.element.className = 'particle';
			this.element.style.width = `${this.size}px`;
			this.element.style.height = `${this.size}px`;
			this.element.style.backgroundColor = this.color;
			this.element.style.boxShadow = `0 0 ${this.size * 2}px ${this.size}px ${this.color}40`;
			this.element.style.left = `${this.x}px`;
			this.element.style.top = `${this.y}px`;

			// Добавляем мерцание некоторым частицам
			if (this.willTwinkle) {
				this.element.style.animation = `float ${15 + Math.random() * 10}s infinite linear, 
                                        twinkle ${3 + Math.random() * 4}s infinite linear`;
			} else {
				this.element.style.animation = `float ${15 + Math.random() * 10}s infinite linear`;
			}

			container.appendChild(this.element);
		}

		// Обновление позиции частицы
		update(mouse) {
			// Движение частицы
			this.x += this.speedX * this.directionX;
			this.y += this.speedY * this.directionY;

			// Проверка границ и изменение направления
			if (this.x > window.innerWidth - this.size || this.x < this.size) {
				this.directionX *= -1;
			}
			if (this.y > window.innerHeight - this.size || this.y < this.size) {
				this.directionY *= -1;
			}

			// Взаимодействие с курсором мыши
			if (mouse.x && mouse.y) {
				const dx = mouse.x - this.x;
				const dy = mouse.y - this.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < settings.mouseDist) {
					// Эффект отталкивания
					const force = (settings.mouseDist - distance) / settings.mouseDist;
					this.x -= dx * force * 0.1;
					this.y -= dy * force * 0.1;
					this.element.style.transform = 'scale(1.5)';
				} else {
					this.element.style.transform = 'scale(1)';
				}
			}

			// Обновление позиции на экране
			this.element.style.left = `${this.x}px`;
			this.element.style.top = `${this.y}px`;
		}
	}

	// Инициализация частиц
	function initParticles() {
		for (let i = 0; i < settings.particleCount; i++) {
			particles.push(new Particle());
		}
	}

	// Анимация частиц
	function animate() {
		const mouse = {
			x: undefined,
			y: undefined
		};

		// Обновление позиции мыши
		document.addEventListener('mousemove', (e) => {
			mouse.x = e.x;
			mouse.y = e.y;
		});

		// Обновление частиц
		particles.forEach(particle => {
			particle.update(mouse);
		});

		requestAnimationFrame(animate);
	}

	// Обработка изменения размера окна
	window.addEventListener('resize', () => {
		// Пересоздаем частицы при изменении размера окна
		particles.forEach(particle => {
			if (particle.element.parentNode) {
				container.removeChild(particle.element);
			}
		});
		particles = [];
		initParticles();
	});

	// Запуск анимации
	initParticles();
	animate();
}

function initGalleries() {
	const galleries = document.querySelectorAll('.media-gallery');

	galleries.forEach(gallery => {
		const container = gallery.querySelector('.gallery-container');
		const prevButton = gallery.querySelector('.prev');
		const nextButton = gallery.querySelector('.next');
		const mediaItems = gallery.querySelectorAll('.media-item');

		// Прокрутка галереи при клике на кнопки
		if (prevButton && nextButton) {
			prevButton.addEventListener('click', () => {
				container.scrollBy({ left: -320, behavior: 'smooth' });
			});

			nextButton.addEventListener('click', () => {
				container.scrollBy({ left: 320, behavior: 'smooth' });
			});
		}

		// Открытие медиа в модальном окне
		mediaItems.forEach(item => {
			item.addEventListener('click', () => {
				openModal(item);
			});
		});

		// Скрываем кнопки навигации, если контента мало
		checkGalleryNavigation(gallery);
	});
}

function checkGalleryNavigation(gallery) {
	const container = gallery.querySelector('.gallery-container');
	const prevButton = gallery.querySelector('.prev');
	const nextButton = gallery.querySelector('.next');

	// Проверяем, нужна ли навигация
	const checkNavigation = () => {
		if (container.scrollWidth <= container.clientWidth) {
			prevButton.style.display = 'none';
			nextButton.style.display = 'none';
		} else {
			prevButton.style.display = 'flex';
			nextButton.style.display = 'flex';

			// Проверяем позицию прокрутки для скрытия/показа кнопок
			if (container.scrollLeft === 0) {
				prevButton.style.opacity = '0.5';
			} else {
				prevButton.style.opacity = '1';
			}

			if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
				nextButton.style.opacity = '0.5';
			} else {
				nextButton.style.opacity = '1';
			}
		}
	};

	// Проверяем при загрузке и изменении размера окна
	checkNavigation();
	window.addEventListener('resize', checkNavigation);

	// Проверяем при прокрутке галереи
	container.addEventListener('scroll', checkNavigation);
}

function initModal() {
	const modal = document.querySelector('.modal');
	if (!modal) return;

	const closeBtn = document.querySelector('.close');
	const modalPrev = document.querySelector('.modal-prev');
	const modalNext = document.querySelector('.modal-next');

	// Закрытие модального окна
	closeBtn.addEventListener('click', closeModal);

	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			closeModal();
		}
	});

	// Навигация в модальном окне
	modalPrev.addEventListener('click', navigateModal.bind(null, -1));
	modalNext.addEventListener('click', navigateModal.bind(null, 1));

	// Закрытие по клавише Esc
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && modal.style.display === 'block') {
			closeModal();
		}

		// Навигация стрелками клавиатуры
		if (modal.style.display === 'block') {
			if (e.key === 'ArrowLeft') {
				navigateModal(-1);
			} else if (e.key === 'ArrowRight') {
				navigateModal(1);
			}
		}
	});
}

function openModal(mediaItem) {
	console.log('Opening modal for:', mediaItem);

	// Проверяем, является ли это YouTube видео
	const youtubePoster = mediaItem.querySelector('.youtube-poster');
	if (youtubePoster) {
		console.log('YouTube video detected');
		const youtubeId = youtubePoster.getAttribute('data-youtube-id');

		// Находим родительскую галерею и все её элементы
		const gallery = mediaItem.closest('.media-gallery');
		const mediaItems = gallery.querySelectorAll('.media-item');

		// Сохраняем информацию о текущей галерее и индексе
		currentGallery = gallery;
		currentMediaIndex = Array.from(mediaItems).indexOf(mediaItem);

		openYouTubeInModal(youtubeId);
		updateModalNavigation(mediaItems.length);
		return;
	}

	// Проверяем, является ли это VK видео
	const vkPoster = mediaItem.querySelector('.vk-video-poster');
	if (vkPoster) {
		console.log('VK video detected');
		const vkVideoId = vkPoster.getAttribute('data-vk-video-id');

		// Находим родительскую галерею и все её элементы
		const gallery = mediaItem.closest('.media-gallery');
		const mediaItems = gallery.querySelectorAll('.media-item');

		// Сохраняем информацию о текущей галерее и индексе
		currentGallery = gallery;
		currentMediaIndex = Array.from(mediaItems).indexOf(mediaItem);

		openVKVideoInModal(vkVideoId);
		updateModalNavigation(mediaItems.length);
		return;
	}

	// Стандартная обработка изображений и видео
	const mediaElement = mediaItem.querySelector('img, video');
	if (mediaElement) {
		console.log('Standard media detected:', mediaElement.tagName);
		// Находим родительскую галерею и все её элементы
		const gallery = mediaItem.closest('.media-gallery');
		const mediaItems = gallery.querySelectorAll('.media-item');

		// Сохраняем информацию о текущей галерее и индексе
		currentGallery = gallery;
		currentMediaIndex = Array.from(mediaItems).indexOf(mediaItem);

		openMediaInModal(mediaElement);
		updateModalNavigation(mediaItems.length);
	}
}

// Функция для загрузки VK Video с сообщением об ограничении
function openVKVideoInModal(vkVideoId) {
	console.log('Opening VK video:', vkVideoId);
	const modal = document.querySelector('.modal');
	const modalContent = modal.querySelector('.modal-content');

	if (!modal || !modalContent) {
		console.error('Modal or modal content not found');
		return;
	}

	// Создаем контейнер с сообщением
	let vkContainer = document.createElement('div');
	vkContainer.className = 'vk-video-alert';
	vkContainer.innerHTML = `
        <div class="alert-content">
            <h3>Видео из VK</h3>
            <p>Для просмотра этого видео откройте его напрямую в VK</p>
            <a href="https://vk.com/video${vkVideoId}" target="_blank" class="vk-link-button">
                Открыть в VK
            </a>
            <p class="alert-note">Видео недоступно для встраивания на сайты без доменного имени</p>
        </div>
    `;

	modalContent.innerHTML = '';
	modalContent.appendChild(vkContainer);
	modal.style.display = 'flex';
	document.body.style.overflow = 'hidden';

	console.log('VK video alert displayed');
}

function openYouTubeInModal(youtubeId) {
	console.log('Opening YouTube video:', youtubeId);
	const modal = document.querySelector('.modal');
	const modalContent = modal.querySelector('.modal-content');

	if (!modal || !modalContent) {
		console.error('Modal or modal content not found');
		return;
	}

	// Создаем контейнер для YouTube
	let youtubeContainer = document.createElement('div');
	youtubeContainer.className = 'youtube-container';
	youtubeContainer.setAttribute('data-youtube-id', youtubeId);

	// Создаем iframe БЕЗ autoplay
	const iframe = document.createElement('iframe');
	iframe.className = 'youtube-iframe';
	iframe.src = `https://www.youtube.com/embed/${youtubeId}?rel=0&enablejsapi=1`;
	iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture';
	iframe.allowFullscreen = true;
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.border = 'none';

	youtubeContainer.appendChild(iframe);

	// Добавляем кнопку воспроизведения
	addYouTubePlayButton(youtubeContainer, youtubeId);

	// Очищаем предыдущий контент и добавляем новый
	modalContent.innerHTML = '';
	modalContent.appendChild(youtubeContainer);

	// Показываем модальное окно
	modal.style.display = 'flex';
	document.body.style.overflow = 'hidden';

	console.log('YouTube modal opened successfully');
}

// Функция для добавления кнопки воспроизведения YouTube
function addYouTubePlayButton(container, youtubeId) {
	const playOverlay = document.createElement('div');
	playOverlay.className = 'youtube-play-overlay';
	playOverlay.innerHTML = `
        <div class="youtube-play-button">
            <div class="play-icon">▶</div>
            <div class="play-text">Нажмите для воспроизведения</div>
        </div>
    `;

	playOverlay.addEventListener('click', function () {
		const iframe = container.querySelector('.youtube-iframe');
		// Меняем src на версию с autoplay
		iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&enablejsapi=1`;
		// Скрываем кнопку воспроизведения
		playOverlay.style.display = 'none';
	});

	container.appendChild(playOverlay);
}

function openMediaInModal(mediaElement) {
	const modal = document.querySelector('.modal');
	const modalContent = modal.querySelector('.modal-content');

	if (!modal || !modalContent) return;

	// Полностью очищаем контент модального окна
	modalContent.innerHTML = '';

	// Создаем соответствующий медиа элемент
	if (mediaElement.tagName === 'IMG') {
		const modalImg = document.createElement('img');
		modalImg.className = 'modal-media';
		const actualSrc = mediaElement.getAttribute('data-src') || mediaElement.src;
		modalImg.src = actualSrc;
		modalImg.alt = mediaElement.alt;
		modalContent.appendChild(modalImg);
	} else if (mediaElement.tagName === 'VIDEO') {
		const modalVideo = document.createElement('video');
		modalVideo.className = 'modal-media';
		modalVideo.controls = true;

		// Копируем источник видео
		const source = mediaElement.querySelector('source');
		if (source) {
			const newSource = document.createElement('source');
			newSource.src = source.src;
			newSource.type = source.type;
			modalVideo.appendChild(newSource);
		}
		modalContent.appendChild(modalVideo);
	}

	// Показываем модальное окно
	modal.style.display = 'flex';
	document.body.style.overflow = 'hidden';
}

function closeModal() {
	const modal = document.querySelector('.modal');
	if (!modal) return;

	const modalContent = modal.querySelector('.modal-content');

	// Полностью очищаем контент модального окна
	if (modalContent) {
		modalContent.innerHTML = '';
	}

	// Останавливаем все видео элементы
	const videos = document.querySelectorAll('video');
	videos.forEach(video => {
		video.pause();
		video.currentTime = 0;
	});

	// Сбрасываем состояние
	currentGallery = null;
	currentMediaIndex = 0;

	modal.style.display = 'none';
	document.body.style.overflow = '';
}

// Обновите функцию navigateModal для правильной работы с YouTube и VK
function navigateModal(direction) {
	if (!currentGallery) return;

	const mediaItems = currentGallery.querySelectorAll('.media-item');
	const totalItems = mediaItems.length;

	// Вычисляем новый индекс
	let newIndex = currentMediaIndex + direction;

	// Зацикливаем навигацию
	if (newIndex < 0) newIndex = totalItems - 1;
	if (newIndex >= totalItems) newIndex = 0;

	// Обновляем текущий индекс
	currentMediaIndex = newIndex;

	// Получаем новый медиа-элемент
	const newMediaItem = mediaItems[newIndex];

	// Проверяем тип медиа
	const youtubePoster = newMediaItem.querySelector('.youtube-poster');
	if (youtubePoster) {
		const youtubeId = youtubePoster.getAttribute('data-youtube-id');
		openYouTubeInModal(youtubeId);
		return;
	}

	const vkPoster = newMediaItem.querySelector('.vk-video-poster');
	if (vkPoster) {
		const vkVideoId = vkPoster.getAttribute('data-vk-video-id');
		openVKVideoInModal(vkVideoId);
		return;
	}

	const newMediaElement = newMediaItem.querySelector('img, video');
	if (newMediaElement) {
		openMediaInModal(newMediaElement);
	}

	updateModalNavigation(totalItems);
}

function updateModalNavigation(totalItems) {
	const modalPrev = document.querySelector('.modal-prev');
	const modalNext = document.querySelector('.modal-next');

	if (totalItems <= 1) {
		modalPrev.style.display = 'none';
		modalNext.style.display = 'none';
	} else {
		modalPrev.style.display = 'flex';
		modalNext.style.display = 'flex';
	}
}

// Инициализация анимаций при скролле (всплытие окон)
function initScrollAnimations() {
	const contentBlocks = document.querySelectorAll('.content-block');
	let animationTimeouts = new WeakMap();

	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			// Очищаем предыдущий таймаут
			if (animationTimeouts.has(entry.target)) {
				clearTimeout(animationTimeouts.get(entry.target));
				animationTimeouts.delete(entry.target);
			}

			if (entry.isIntersecting) {
				const timeoutId = setTimeout(() => {
					entry.target.classList.add('visible');
					animationTimeouts.delete(entry.target);
				}, 50);
				animationTimeouts.set(entry.target, timeoutId);
			}
		});
	}, {
		threshold: 0.1,
		rootMargin: '0px 0px -50px 0px'
	});

	contentBlocks.forEach(block => {
		observer.observe(block);
	});
}

// Добавляем поддержку свайпа для мобильных устройств
document.querySelectorAll('.gallery-container').forEach(container => {
	let startX;
	let scrollLeft;

	container.addEventListener('touchstart', (e) => {
		startX = e.touches[0].pageX - container.offsetLeft;
		scrollLeft = container.scrollLeft;
	});

	container.addEventListener('touchmove', (e) => {
		if (!startX) return;
		const x = e.touches[0].pageX - container.offsetLeft;
		const walk = (x - startX) * 2;
		container.scrollLeft = scrollLeft - walk;
	});
});

// Предзагрузка критических изображений
function loadCriticalImages() {
	const criticalImages = document.querySelectorAll('.image-content .lazy-image');
	criticalImages.forEach(img => {
		const src = img.getAttribute('data-src');
		if (src) {
			const tempImage = new Image();
			tempImage.src = src;
		}
	});
}

// Загрузка критических изображений после полной загрузки страницы
window.addEventListener('load', loadCriticalImages);