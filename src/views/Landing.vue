<template>
	<main class="landing">
		<h1 class="headline">Track your routines. Build a better you.</h1>
		<router-link class="cta" to="/onboarding">Get started</router-link>
	</main>
</template>

<script setup>
</script>

<style scoped>

.landing::before {
	content: '';
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, rgba(5,7,10,0.1) 0%, rgba(5,7,10,0.6) 100%);
	z-index: 0;
}

.landing > * {
	position: relative;
	z-index: 1;
}

.landing {
	height: 100svh;
	height: 100dvh; /* fallback */
	position: fixed;
	inset: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: flex-start;
	padding: clamp(1.5rem, 5vw, 3rem);
	padding-left: clamp(1.5rem, 8vw, 5rem);
	/* smaller bottom padding using svh to avoid overflow */
	padding-bottom: clamp(4rem, 10svh, 8rem);
	text-align: left;
	background: url('/landing-bg.png') center/cover no-repeat;
	z-index: 0;
}

.cta {
	background: rgba(255, 255, 255, 0.08);
	backdrop-filter: blur(12px);
	padding: 0.95rem 1.75rem;
	min-height: 48px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	font-weight: 500;
	font-size: 1rem;
	letter-spacing: -0.01em;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta:hover { 
	background: rgba(255, 255, 255, 0.12);
	border-color: rgba(255, 255, 255, 0.25);
	transform: translateY(-1px);
}

.cta:active { 
	transform: translateY(0) scale(0.98);
}

.cta:focus-visible { 
	outline: 2px solid rgba(255, 255, 255, 0.4);
	outline-offset: 3px;
}

@media (min-width: 640px) {
	.headline { 
		font-size: clamp(3rem, 6vw + 0.5rem, 5.5rem);
		max-width: 16ch;
	}
	.landing {
		padding-left: clamp(3rem, 10vw, 8rem);
		background-image: url('/landing-bg-desktop.png');
	}
}

@media (min-width: 1024px) {
	.headline { 
		font-size: clamp(3.5rem, 5vw + 1rem, 6rem);
	}
}
</style>

