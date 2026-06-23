document.addEventListener("DOMContentLoaded", () => {

    // 1. Evitamos que el navegador intente recordar por su cuenta dónde estaba el scroll al refrescar
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // 2. PRELOADER CON "SCROLL FANTASMA" (Fuerza a la GPU a renderizar el cristal)
    window.addEventListener("load", () => {
        
        const preloader = document.getElementById("preloader");
        
        // EL FIX: Solo ejecutamos toda la animación de bloqueo si la página tiene preloader
        if (preloader) {
            // Bloqueamos la pantalla
            document.body.style.overflow = "hidden";
            
            // Bajamos instantáneamente al final
            window.scrollTo(0, document.body.scrollHeight);

            setTimeout(() => {
                // Volvemos arriba
                window.scrollTo(0, 0);

                setTimeout(() => {
                    preloader.style.opacity = "0";
                    setTimeout(() => { 
                        preloader.style.visibility = "hidden";
                        document.body.style.overflow = ""; // Le devolvemos el scroll al usuario
                    }, 800);
                }, 50);
            }, 600);
        } else {
            // Si NO hay preloader (como en blueprint.html), garantizamos que el scroll esté libre
            document.body.style.overflow = "";
        }
    });
    
    let idx = 0;
    
    // FUNCIÓN DE CONTROL DE CARRUSEL
    const updateCarousel = () => {
        const activePanel = document.querySelector('.service-panel.active');
        if (!activePanel) return;
        
        const cards = activePanel.querySelectorAll('.card-servicio-ancha');
        const total = cards.length;
        if (!total) return;
        
        idx = (idx + total) % total;
        cards.forEach((card, i) => {
            if (i === idx) {
                card.classList.add('is-center');
            } else {
                card.classList.remove('is-center');
            }
        });

        // Actualizar puntos
        const dotsContainer = document.querySelector('.carousel-indicators');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            cards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `indicator-dot ${i === idx ? 'active' : ''}`;
                dot.addEventListener('click', () => { idx = i; updateCarousel(); });
                dotsContainer.appendChild(dot);
            });
        }
    };

    const obs1 = new IntersectionObserver((entries, o) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('activa'); o.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => obs1.observe(el));

    const obs2 = new IntersectionObserver(entries => entries.forEach(e => {
        e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    }));
    document.querySelectorAll('.tab-btn-crystal.active, .badge-track').forEach(el => obs2.observe(el));

    setTimeout(updateCarousel, 50);

    const prev = document.querySelector('.carousel-arrow.prev');
    const next = document.querySelector('.carousel-arrow.next');
    if (next) next.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); idx++; updateCarousel(); });
    if (prev) prev.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); idx--; updateCarousel(); });

    const tabs = document.querySelectorAll('.tab-btn-crystal');
    const panels = document.querySelectorAll('.service-panel');
    
    tabs.forEach(t => t.addEventListener('click', (e) => {
        tabs.forEach(tab => tab.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        const btn = e.currentTarget;
        btn.classList.add('active');
        
        const targetPanel = document.getElementById(btn.getAttribute('data-target'));
        if (targetPanel) targetPanel.classList.add('active');
        
        idx = 0; // Reinicia el contador de tarjetas al cambiar de sección
        obs2.disconnect();
        document.querySelectorAll('.tab-btn-crystal.active, .badge-track').forEach(el => obs2.observe(el));
        updateCarousel();
    }));

    // Efecto Parallax 3D aplicado a la tarjeta y a los 3 mockups iniciales
    const cardScene = document.getElementById('card-scene');
    const cardInner = document.getElementById('card-inner');
    const btnFlipForm = document.getElementById('btn-flip-form');
    const btnFlipBack = document.getElementById('btn-flip-back');
    
    // Seleccionamos los 3 mockups
    const mockups = document.querySelectorAll('.interfaz-mockup, .mini-mockup-card');

    if (cardScene || mockups.length > 0) {
        const updateTilt = () => {
            const winH = window.innerHeight;
            const scrollY = window.scrollY; // Detecta la posición del scroll

            // 1. Tilt de la tarjeta de contacto
            if (cardScene) {
                const rect = cardScene.getBoundingClientRect();
                if (rect.top < winH && rect.bottom > 0) {
                    let progress = (rect.top - (winH * 0.1)) / (winH * 0.9);
                    progress = Math.max(0, Math.min(1, progress)); 
                    const angle = progress * 45; 
                    cardScene.style.transform = `perspective(2000px) rotateX(${angle}deg)`;
                }
            }

            // 2. Tilt de los mockups al scrollear
            mockups.forEach(mockup => {
                const rect = mockup.getBoundingClientRect();
                if (rect.top < winH && rect.bottom > 0) {
                    let progress = (rect.top - (winH * 0.2)) / (winH * 0.8);
                    progress = Math.max(0, Math.min(1, progress));
                    const angleX = progress * 20; 
                    mockup.style.transform = `perspective(1200px) rotateY(-6deg) rotateX(${angleX}deg) translateZ(0)`;
                }
            });

            // 3. Efecto Parallax en figuras 3D de fondo (Ajustado para no esconderlas)
            const parallaxGeometries = document.querySelectorAll('.esfera-central-3d, .geometria-capsula-3d, .geometria-cubo-3d');
            parallaxGeometries.forEach(el => {
                const speed = 0.05; 
                // Calculamos la posición relativa al elemento para que no se escape
                const rectTop = el.parentElement.getBoundingClientRect().top;
                
                // Solo aplicamos el efecto si está visible en pantalla
                if (rectTop < winH && rectTop > -winH) {
                    const yPos = (winH - rectTop) * speed; 
                    
                    if (el.classList.contains('esfera-central-3d')) {
                        el.style.transform = `translate(-65%, calc(-20% - ${yPos}px)) translateZ(0)`;
                    } else if (el.classList.contains('geometria-capsula-3d')) {
                        el.style.transform = `rotate(35deg) translateZ(-10px) translateY(${-yPos}px)`;
                    } else if (el.classList.contains('geometria-cubo-3d')) {
                        el.style.transform = `rotate(-20deg) rotateX(15deg) translateZ(-10px) translateY(${-yPos}px)`;
                    }
                }
            });
        };

        window.addEventListener('scroll', updateTilt, { passive: true });
        updateTilt(); 
    }

    // Giro 180 del formulario
    if (btnFlipForm && btnFlipBack && cardInner) {
        btnFlipForm.addEventListener('click', (e) => {
            e.preventDefault();
            cardInner.classList.add('is-flipped');
        });
        btnFlipBack.addEventListener('click', (e) => {
            e.preventDefault();
            cardInner.classList.remove('is-flipped');
        });
    }
    
});

// ==========================================
// MOTOR TÁCTIL PARA EL CARRUSEL MÓVIL (Versión Quirúrgica)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const carruselWrapper = document.querySelector('.servicios-interactive-wrapper');
    const tabsContainer = document.querySelector('.servicios-tabs');
    const tabs = document.querySelectorAll('.tab-btn-crystal');
    
    // 1. AUTO-CENTRADO SEGURO (Mata el bug de la pantalla corrida)
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (tabsContainer) {
                // Matemática pura: calculamos el centro exacto del botón respecto a su contenedor
                const scrollPos = this.offsetLeft - (tabsContainer.offsetWidth / 2) + (this.offsetWidth / 2);
                
                // Le ordenamos que mueva SOLO la caja de botones, protegiendo el resto de la página
                tabsContainer.scrollTo({
                    left: scrollPos,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. DETECCIÓN DE DESLIZAMIENTO (SWIPE) PARA LAS TARJETAS
    if (carruselWrapper) {
        let touchstartX = 0;
        let touchendX = 0;

        // Detecta dónde pones el dedo al tocar los mockups
        carruselWrapper.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        // Detecta hacia dónde sueltas el dedo
        carruselWrapper.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            procesarDeslizamiento();
        }, { passive: true });

        function procesarDeslizamiento() {
            // Buscamos qué tarjeta está activa actualmente
            let activeIndex = Array.from(tabs).findIndex(t => t.classList.contains('active'));
            if (activeIndex === -1) return;

            const umbral = 50; // Sensibilidad: debes mover el dedo al menos 50px

            if (touchendX < touchstartX - umbral) {
                // Deslizaste hacia la izquierda (Avanzar)
                if (activeIndex < tabs.length - 1) {
                    tabs[activeIndex + 1].click(); 
                }
            } else if (touchendX > touchstartX + umbral) {
                // Deslizaste hacia la derecha (Retroceder)
                if (activeIndex > 0) {
                    tabs[activeIndex - 1].click(); 
                }
            }
        }
    }
});