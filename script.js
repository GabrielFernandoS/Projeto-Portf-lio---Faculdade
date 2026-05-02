/* =========================================================
   PORTFÓLIO PESSOAL — JavaScript
   Funcionalidades:
   1. Toggle de tema claro/escuro (persistido em localStorage)
   2. Menu mobile (hambúrguer)
   3. Indicador de seção ativa no menu (IntersectionObserver)
   4. Barra de progresso de scroll
   5. Reveal de elementos ao rolar
   6. Validação do formulário de contato + simulação de envio (modal)
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. TEMA CLARO / ESCURO
     Lê preferência salva ou usa a do sistema.
     --------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  // Tema padrão: claro. Se houver preferência salva, respeita.
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || 'light';
  root.setAttribute('data-theme', initialTheme);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ---------------------------------------------------------
     2. MENU MOBILE
     Abre/fecha lista de links em telas pequenas.
     --------------------------------------------------------- */
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Fecha o menu ao clicar em qualquer link (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ---------------------------------------------------------
  3. INDICADOR DE SEÇÃO ATIVA + REVEAL
  Usa IntersectionObserver: quando uma seção aparece na
  viewport, marca o link correspondente como 'active'.
  --------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const linkMap = {};
  navLinks.querySelectorAll('a[href^="#"]').forEach(a => {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove 'active' de todos e marca o atual
        Object.values(linkMap).forEach(l => l.classList.remove('active'));
        const link = linkMap[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => navObserver.observe(s));

  // Reveal animado ao entrar na viewport
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => {
    // Se o elemento já está visível na carga inicial, marca direto
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      el.classList.add('visible');
    } else {
      revealObserver.observe(el);
    }
  });

  /* ---------------------------------------------------------
     4. BARRA DE PROGRESSO DE SCROLL
     --------------------------------------------------------- */
  const progress = document.getElementById('scroll-progress');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = `${Math.max(0, Math.min(1, scrolled)) * 100}%`;
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------
     5. FORMULÁRIO DE CONTATO
     - Valida nome (mínimo 2 caracteres)
     - Valida e-mail com regex padrão
     - Valida mensagem (mínimo 10 caracteres)
     - Em caso de erro: marca o campo e exibe mensagem
     - Em caso de sucesso: limpa o form e abre modal
     --------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');

  // Regex simples para formato de e-mail (usuario@dominio.tld)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(field, msg) {
    const wrapper = field.closest('.field');
    const errorEl = wrapper.querySelector('.error');
    wrapper.classList.add('invalid');
    errorEl.textContent = msg;
  }
  function clearError(field) {
    const wrapper = field.closest('.field');
    wrapper.classList.remove('invalid');
    wrapper.querySelector('.error').textContent = '';
  }

  // Validação ao vivo: limpa erro assim que o usuário começa a corrigir
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // impede o envio real (é simulação)

    const nome = form.elements['nome'];
    const email = form.elements['email'];
    const mensagem = form.elements['mensagem'];
    let valid = true;

    // Nome: obrigatório, mínimo 2 caracteres
    if (!nome.value.trim()) {
      setError(nome, 'Por favor, informe seu nome.');
      valid = false;
    } else if (nome.value.trim().length < 2) {
      setError(nome, 'Nome muito curto.');
      valid = false;
    }

    // Email: obrigatório e formato válido
    if (!email.value.trim()) {
      setError(email, 'Por favor, informe seu e-mail.');
      valid = false;
    } else if (!EMAIL_RE.test(email.value.trim())) {
      setError(email, 'Formato inválido. Ex: nome@dominio.com');
      valid = false;
    }

    // Mensagem: obrigatória, mínimo 10 caracteres
    if (!mensagem.value.trim()) {
      setError(mensagem, 'Escreva uma mensagem.');
      valid = false;
    } else if (mensagem.value.trim().length < 10) {
      setError(mensagem, 'Conte um pouco mais (mín. 10 caracteres).');
      valid = false;
    }

    if (!valid) return;

    // SIMULAÇÃO DE ENVIO: limpa o form e abre o modal de sucesso
    form.reset();
    openModal();
  });

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    // fecha ao clicar fora do conteúdo (no backdrop)
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  /* ---------------------------------------------------------
     6. ANO ATUAL NO RODAPÉ
     --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
