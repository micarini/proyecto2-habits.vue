<template>
	<main class="landing">
		<h1 class="headline">Track your routines. Build a better you.</h1>
		<router-link class="cta" to="/onboarding">Get started</router-link>
	</main>
</template>

<script setup>
</script>

<style scoped>
.landing {
	min-height: 100dvh;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: flex-start;
	padding: clamp(1.5rem, 5vw, 3rem);
	padding-left: clamp(1.5rem, 8vw, 5rem);
	padding-bottom: clamp(8rem, 16vh, 12rem);
	text-align: left;
	background: url('/landing-bg.png') center/cover no-repeat;
	position: relative;
}

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

.headline {
	font-size: clamp(2.5rem, 7vw + 0.5rem, 5rem);
	font-weight: 700;
	line-height: 1.1;
	letter-spacing: -0.03em;
	margin: 0 0 2.5rem;
	max-width: 18ch;
	font-family: 'Bricolage Grotesque', sans-serif;
}

.cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
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

