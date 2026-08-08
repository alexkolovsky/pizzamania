<script lang="ts">
  /**
   * The pineapple protest. Purely decorative theatre: the topping is already
   * on the pizza and the screen-reader one-liner was already announced by the
   * builder, so the whole scene is aria-hidden. This component only mounts
   * when motion is allowed; reduced-motion users get a static toast instead.
   */
  import { onMount } from 'svelte';

  let { ondone }: { ondone: () => void } = $props();

  let scene: HTMLDivElement;
  let bubble: HTMLDivElement;
  let arm: SVGGElement;

  onMount(() => {
    let cancelled = false;
    let timeline: { kill: () => void } | undefined;

    // GSAP is only loaded when a gag actually plays — keeps it out of the
    // initial bundle.
    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      timeline = gsap
        .timeline({ onComplete: ondone })
        .fromTo(scene, { x: -280, rotation: -4 }, { x: 0, rotation: 0, duration: 0.55, ease: 'back.out(1.4)' })
        .fromTo(bubble, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
        .to(arm, { rotation: -22, transformOrigin: '80% 85%', duration: 0.16, repeat: 5, yoyo: true, ease: 'power1.inOut' })
        .to({}, { duration: 1.0 }) // Giovanni glares in silence
        .to(bubble, { scale: 0.6, opacity: 0, duration: 0.25, ease: 'power2.in' })
        .to(scene, { x: -280, rotation: -3, duration: 0.45, ease: 'power2.in' }, '<0.05');
    });

    return () => {
      cancelled = true;
      timeline?.kill();
    };
  });
</script>

<div class="giovanni" bind:this={scene} aria-hidden="true">
  <div class="bubble" bind:this={bubble}>
    <strong>Mamma mia!</strong> No ananas on pizza!<br />
    <em>…va bene, va bene. This one time.</em>
  </div>
  <svg viewBox="0 0 200 240" width="170" height="204">
    <!-- body + apron -->
    <path d="M 55 150 Q 100 130 145 150 L 152 240 L 48 240 Z" fill="#f4ede0" />
    <path d="M 62 168 Q 100 152 138 168 L 143 240 L 57 240 Z" fill="#c93a22" />
    <path d="M 92 175 L 108 175 L 106 196 L 94 196 Z" fill="#8c2611" />
    <!-- left arm on hip -->
    <path d="M 60 160 Q 34 178 46 200 Q 52 208 62 202 Q 74 192 74 176 Z" fill="#f4ede0" />
    <!-- head -->
    <ellipse cx="100" cy="112" rx="34" ry="36" fill="#eab88f" />
    <!-- ears -->
    <circle cx="66" cy="112" r="7" fill="#eab88f" />
    <circle cx="134" cy="112" r="7" fill="#eab88f" />
    <!-- chef hat -->
    <path d="M 64 88 Q 58 48 92 50 Q 100 34 116 44 Q 146 40 138 78 Q 137 88 134 92 L 66 92 Z" fill="#fff9ec" />
    <rect x="66" y="86" width="68" height="12" rx="6" fill="#ecdfc8" />
    <!-- eyebrows: outraged -->
    <path d="M 76 100 L 92 106 M 124 100 L 108 106" stroke="#4a3526" stroke-width="4" stroke-linecap="round" />
    <!-- eyes -->
    <circle cx="86" cy="114" r="4" fill="#211a12" />
    <circle cx="114" cy="114" r="4" fill="#211a12" />
    <!-- the mustache -->
    <path d="M 78 130 Q 90 122 100 130 Q 110 122 122 130 Q 118 142 100 136 Q 82 142 78 130 Z" fill="#4a3526" />
    <!-- open, protesting mouth -->
    <ellipse cx="100" cy="142" rx="7" ry="5" fill="#7c3226" />
    <!-- right arm: raised, finger wagging (animated group) -->
    <g bind:this={arm}>
      <path d="M 140 160 Q 168 140 162 112 Q 160 102 150 106 Q 138 122 136 152 Z" fill="#f4ede0" />
      <circle cx="156" cy="106" r="11" fill="#eab88f" />
      <rect x="152" y="82" width="9" height="22" rx="4.5" fill="#eab88f" />
    </g>
  </svg>
</div>

<style>
  .giovanni {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 150;
    pointer-events: none;
    filter: drop-shadow(0 6px 12px rgba(43, 36, 29, 0.3));
    /* Pre-position off-screen so there's no flash before GSAP loads */
    transform: translateX(-280px);
  }

  .bubble {
    position: absolute;
    left: 120px;
    bottom: 190px;
    width: 15rem;
    padding: var(--space-3);
    background: var(--cream);
    color: var(--ink);
    border: var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow-hard-sm);
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    line-height: 1.3;
    opacity: 0;
  }
  .bubble::after {
    content: '';
    position: absolute;
    left: 26px;
    bottom: -12px;
    width: 20px;
    height: 20px;
    background: var(--cream);
    border-right: 2px solid var(--ink);
    border-bottom: 2px solid var(--ink);
    transform: rotate(45deg) skew(8deg, 8deg);
  }
  .bubble strong {
    color: var(--tomato-ink);
  }
  .bubble em {
    font-style: italic;
  }
</style>
