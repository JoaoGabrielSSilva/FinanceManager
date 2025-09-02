/**
 * custom.js - Implementação personalizada de componentes de UI
 * Este arquivo substitui as funcionalidades do Bootstrap com implementações personalizadas
 */

// Variáveis globais para rastrear elementos ativos
let activeModals = [];
let activeDropdowns = [];
let activeTooltips = [];

/**
 * Inicializa todos os modais na página
 */
function initModals() {
    // Adiciona event listeners para elementos que abrem modais
    document.querySelectorAll('[data-bs-toggle="modal"], [data-toggle="modal"]').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetSelector = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
            if (targetSelector) {
                const modal = document.querySelector(targetSelector);
                if (modal) {
                    openModal(modal);
                }
            }
        });
    });

    // Adiciona event listeners para botões que fecham modais
    document.querySelectorAll('[data-bs-dismiss="modal"], [data-dismiss="modal"]').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Fecha modal ao clicar no backdrop
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal') && event.target.classList.contains('show')) {
            closeModal(event.target);
        }
    });

    // Fecha modal com a tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && activeModals.length > 0) {
            closeModal(activeModals[activeModals.length - 1]);
        }
    });
}

/**
 * Abre um modal
 * @param {HTMLElement} modal - O elemento modal a ser aberto
 */
function openModal(modal) {
    // Adiciona classes para exibir o modal
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    
    // Cria backdrop se não existir
    if (!document.querySelector('.modal-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        document.body.appendChild(backdrop);
    }
    
    // Adiciona à lista de modais ativos
    activeModals.push(modal);
    
    // Dispara evento
    modal.dispatchEvent(new Event('shown.modal'));
}

/**
 * Fecha um modal
 * @param {HTMLElement} modal - O elemento modal a ser fechado
 */
function closeModal(modal) {
    // Remove classes
    modal.classList.remove('show');
    
    // Remove o modal da lista de ativos
    activeModals = activeModals.filter(m => m !== modal);
    
    // Se não houver mais modais ativos, limpa o backdrop e a classe do body
    if (activeModals.length === 0) {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
    }
    
    // Dispara evento
    modal.dispatchEvent(new Event('hidden.modal'));
}

/**
 * Inicializa elementos colapsáveis
 */
function initCollapseElements() {
    document.querySelectorAll('[data-bs-toggle="collapse"], [data-toggle="collapse"]').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetSelector = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
            if (targetSelector) {
                const target = document.querySelector(targetSelector);
                if (target) {
                    toggleCollapse(target);
                }
            }
        });
    });
}

/**
 * Alterna o estado de um elemento colapsável
 * @param {HTMLElement} element - O elemento a ser alternado
 */
function toggleCollapse(element) {
    if (element.classList.contains('show')) {
        // Colapsa o elemento
        element.style.height = element.scrollHeight + 'px';
        // Força um reflow
        element.offsetHeight;
        element.style.height = '0';
        element.classList.remove('show');
        
        // Dispara evento
        element.dispatchEvent(new Event('hidden.collapse'));
        
        // Remove a altura após a transição
        element.addEventListener('transitionend', function handler() {
            element.style.height = '';
            element.removeEventListener('transitionend', handler);
        }, { once: true });
    } else {
        // Expande o elemento
        element.style.height = '0';
        element.classList.add('show');
        
        // Anima para a altura total
        const height = element.scrollHeight;
        element.style.height = height + 'px';
        
        // Dispara evento
        element.dispatchEvent(new Event('shown.collapse'));
        
        // Remove a altura após a transição
        element.addEventListener('transitionend', function handler() {
            element.style.height = '';
            element.removeEventListener('transitionend', handler);
        }, { once: true });
    }
}

/**
 * Inicializa dropdowns
 */
function initDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            event.preventDefault();
            const dropdown = this.closest('.dropdown');
            toggleDropdown(dropdown);
        });
    });
    
    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });
}

/**
 * Alterna o estado de um dropdown
 * @param {HTMLElement} dropdown - O elemento dropdown
 */
function toggleDropdown(dropdown) {
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        activeDropdowns = activeDropdowns.filter(d => d !== dropdown);
    } else {
        // Fecha outros dropdowns
        closeAllDropdowns();
        
        // Abre este dropdown
        dropdown.classList.add('show');
        activeDropdowns.push(dropdown);
    }
}

/**
 * Fecha todos os dropdowns ativos
 */
function closeAllDropdowns() {
    activeDropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    activeDropdowns = [];
}

/**
 * Inicializa validação de formulários
 */
function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(this)) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

/**
 * Valida um formulário
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - Verdadeiro se o formulário for válido
 */
function validateForm(form) {
    let isValid = true;
    
    // Valida campos obrigatórios
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    });
    
    // Valida emails
    form.querySelectorAll('input[type="email"]').forEach(field => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (field.value && !emailRegex.test(field.value)) {
            field.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    // Valida números
    form.querySelectorAll('input[type="number"]').forEach(field => {
        if (field.value && (isNaN(field.value) || parseFloat(field.value) < parseFloat(field.min) || parseFloat(field.value) > parseFloat(field.max))) {
            field.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Inicializa tooltips
 */
function initTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"], [data-toggle="tooltip"]').forEach(element => {
        const title = element.getAttribute('title') || element.getAttribute('data-bs-title') || element.getAttribute('data-title');
        if (title) {
            // Cria o elemento tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `<div class="tooltip-inner">${title}</div><div class="tooltip-arrow"></div>`;
            document.body.appendChild(tooltip);
            
            // Configura eventos
            element.addEventListener('mouseenter', () => showTooltip(element, tooltip));
            element.addEventListener('mouseleave', () => hideTooltip(tooltip));
            
            // Armazena referência ao tooltip
            element._tooltip = tooltip;
            activeTooltips.push({ element, tooltip });
        }
    });
}

/**
 * Exibe um tooltip
 * @param {HTMLElement} element - O elemento que acionou o tooltip
 * @param {HTMLElement} tooltip - O elemento tooltip
 */
function showTooltip(element, tooltip) {
    // Posiciona o tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
    tooltip.style.left = (rect.left + (rect.width / 2) - (tooltipRect.width / 2)) + 'px';
    
    // Exibe o tooltip
    tooltip.classList.add('show');
}

/**
 * Esconde um tooltip
 * @param {HTMLElement} tooltip - O elemento tooltip
 */
function hideTooltip(tooltip) {
    tooltip.classList.remove('show');
}

// Exporta funções para uso global
window.initModals = initModals;
window.initCollapseElements = initCollapseElements;
window.initDropdowns = initDropdowns;
window.initFormValidation = initFormValidation;
window.initTooltips = initTooltips;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleCollapse = toggleCollapse;
window.toggleDropdown = toggleDropdown;